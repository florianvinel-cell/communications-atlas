import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API route for email preview (legacy, keep for existing)
  app.get("/api/email-preview/:campaignId/:actionId", async (req, res) => {
    const { campaignId, actionId } = req.params;
    const key = process.env.CUSTOMER_IO_APP_API_KEY;

    if (!key) {
      return res.status(500).json({ error: "CUSTOMER_IO_APP_API_KEY not configured" });
    }

    try {
      const response = await fetch(
        `https://api.customer.io/v1/campaigns/${campaignId}/actions/${actionId}`,
        { headers: { Authorization: `Bearer ${key}` } }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch email: ${response.statusText}`);
      }

      const data = await response.json();
      
      res.json({
        subject: data.action.subject,
        preheader: data.action.preheader,
        body: data.action.body,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch email preview" });
    }
  });

  // API route to get metrics for a campaign
  app.get("/api/campaigns/:campaignId/metrics", async (req, res) => {
    const { campaignId } = req.params;
    const { period, steps } = req.query;
    const key = process.env.CUSTOMER_IO_APP_KEY || process.env.CUSTOMER_IO_APP_API_KEY;

    if (!key) {
      return res.status(500).json({ error: "CUSTOMER_IO_APP_KEY not configured" });
    }

    try {
      const qPeriod = period || 'days';
      const qSteps = steps || 30;
      const response = await fetch(
        `https://api.customer.io/v1/campaigns/${campaignId}/metrics?period=${qPeriod}&steps=${qSteps}`,
        { headers: { Authorization: `Bearer ${key}` } }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.statusText}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch campaign metrics" });
    }
  });

  // API route to get all actions for a campaign
  app.get("/api/campaigns/:campaignId/actions", async (req, res) => {
    const { campaignId } = req.params;
    const key = process.env.CUSTOMER_IO_APP_API_KEY;

    if (!key) {
      return res.status(500).json({ error: "CUSTOMER_IO_APP_API_KEY not configured" });
    }

    try {
      const response = await fetch(
        `https://api.customer.io/v1/campaigns/${campaignId}/actions`,
        { headers: { Authorization: `Bearer ${key}` } }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch actions: ${response.statusText}`);
      }

      const data = await response.json();
      res.json(data.actions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch campaign actions" });
    }
  });

  // Customer Lookup API Routes
  const APP_API_BASE = 'https://api.customer.io/v1';

  app.get("/api/customer-lookup/customers", async (req, res) => {
    const { email } = req.query;
    const key = process.env.CUSTOMER_IO_APP_KEY;
    console.log('Customer Lookup Request:', { email });
    console.log('Auth header:', `Bearer ${process.env.CUSTOMER_IO_APP_KEY?.slice(0, 20)}`);
    console.log('URL:', `${APP_API_BASE}/customers?email=${email}`);
    try {
      const response = await fetch(`${APP_API_BASE}/customers?email=${encodeURIComponent(email as string)}`, {
        headers: { Authorization: `Bearer ${key}` }
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      res.json(await response.json());
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/customer-lookup/messages", async (req, res) => {
    const { customer_id } = req.query;
    const key = process.env.CUSTOMER_IO_APP_KEY;
    try {
      const response = await fetch(`${APP_API_BASE}/customers/${encodeURIComponent(customer_id as string)}/messages?limit=10`, {
        headers: { Authorization: `Bearer ${key}` }
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      console.log('Sample message:', data.results?.[0] || data.messages?.[0] || data);
      res.json(data);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // Since we can't get rendered delivery_details anymore, we will provide an endpoint to fetch the template
  // If the frontend has an actionId it can use /api/email-preview/:campaignId/:actionId
  // If it only has campaignId, we can get the actions and pick the first email action.
  app.get("/api/customer-lookup/campaign_template/:campaignId", async (req, res) => {
    const { campaignId } = req.params;
    const actionId = req.query.actionId as string;
    const key = process.env.CUSTOMER_IO_APP_KEY;
    try {
      let targetActionId = actionId;
      if (!targetActionId || targetActionId === 'undefined') {
        const actionsResp = await fetch(`${APP_API_BASE}/campaigns/${campaignId}/actions`, {
          headers: { Authorization: `Bearer ${key}` }
        });
        if (!actionsResp.ok) throw new Error("Failed to get actions");
        const actionsData = await actionsResp.json();
        const emailAction = actionsData.actions?.find((a: any) => a.type === 'email');
        if (emailAction) {
          targetActionId = emailAction.id;
        } else {
          return res.status(404).json({ error: "No email action found in campaign" });
        }
      }

      const response = await fetch(`${APP_API_BASE}/campaigns/${campaignId}/actions/${targetActionId}`, {
        headers: { Authorization: `Bearer ${key}` }
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      res.json({
        body: data.action.body
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // Simple cache for segment latest endpoint
  const segmentCache: Record<string, { timestamp: number, data: any }> = {};

  app.get("/api/customer-lookup/segment-latest/:segmentId", async (req, res) => {
    const { segmentId } = req.params;
    const key = process.env.CUSTOMER_IO_APP_KEY;

    // Check cache (2 hours = 7200000 ms)
    const now = Date.now();
    if (segmentCache[segmentId] && now - segmentCache[segmentId].timestamp < 7200000) {
      return res.json(segmentCache[segmentId].data);
    }

    try {
      async function findMaxValidSeq(): Promise<number> {
        let low = 0;
        let high = 10000000;
        async function hasItems(seq: number): Promise<boolean> {
            const cursor = Buffer.from(`1:${seq}`).toString('base64');
            const r = await fetch(`${APP_API_BASE}/segments/${segmentId}/membership?start=${cursor}&limit=1`, {
                headers: { Authorization: `Bearer ${key}` }
            });
            if (!r.ok) return false;
            const d = await r.json();
            return !!(d.ids && d.ids.length > 0);
        }
        while (await hasItems(high)) { low = high; high *= 2; }
        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            if (await hasItems(mid)) low = mid + 1;
            else high = mid - 1;
        }
        return low - 1;
      }
      
      const maxSeq = await findMaxValidSeq();
      let currentSeq = maxSeq;
      let collectedIds: string[] = [];
      let step = 10000;
      let safeLoop = 0;
      
      while (collectedIds.length < 5 && currentSeq >= 0 && safeLoop < 50) {
          safeLoop++;
          const startSeq = Math.max(0, currentSeq - step);
          const cursor = Buffer.from(`1:${startSeq}`).toString('base64');
          
          const memRes = await fetch(`${APP_API_BASE}/segments/${segmentId}/membership?start=${cursor}&limit=1000`, {
              headers: { Authorization: `Bearer ${key}` }
          });
          const data = await memRes.json();
          const ids = data.ids || [];
            
          if (ids.length === 1000) {
              step = Math.max(10, Math.floor(step / 2));
              continue;
          }
          
          const toAdd = [...ids].reverse();
          for (const id of toAdd) {
              if (!collectedIds.includes(id)) {
                  collectedIds.push(id);
                  if (collectedIds.length >= 5) break;
              }
          }
            
          currentSeq = startSeq;
          step = Math.min(1000000, step * 2);
      }
      
      const customers = [];
      for (const id of collectedIds) {
         const attrRes = await fetch(`${APP_API_BASE}/customers/${id}/attributes`, {
            headers: { Authorization: `Bearer ${key}` }
         });
         if (attrRes.ok) {
            const attrData = await attrRes.json();
            const customer = attrData.customer || {};
            const attrs = customer.attributes || {};
            customers.push({
               id: customer.id,
               email: customer.identifiers?.email || attrs.email || '',
               plan: attrs.plan || ''
            });
         }
      }

      const result = { customers };
      // Update cache
      segmentCache[segmentId] = { timestamp: now, data: result };

      res.json(result);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/customer-lookup/campaigns/:campaignId", async (req, res) => {
    const key = process.env.CUSTOMER_IO_SERVICE_KEY;
    try {
      const response = await fetch(`${APP_API_BASE}/campaigns/${req.params.campaignId}`, {
        headers: { Authorization: `Bearer ${key}` }
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      res.json(await response.json());
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  // API route to sync campaign flow
  app.get("/api/campaigns/:campaignId/sync", async (req, res) => {
    const { campaignId } = req.params;
    const key = process.env.CUSTOMER_IO_APP_API_KEY;

    if (!key) {
      return res.status(500).json({ error: "CUSTOMER_IO_APP_API_KEY not configured" });
    }

    try {
      const response = await fetch(
        `https://api.customer.io/v1/campaigns/${campaignId}/actions`,
        { headers: { Authorization: `Bearer ${key}` } }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch campaign: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Structure actions
      const actions = data.actions.map((action: any) => ({
          type: 'email',
          actionId: action.id,
          name: action.name,
          subject: action.subject,
          preheader: action.preheader_text,
          body: action.body
      }));

      // In a real scenario, we would interleave delays, but for now just return emails
      res.json(actions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to sync campaign" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production handling
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
