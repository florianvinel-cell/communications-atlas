import dotenv from 'dotenv';
dotenv.config();

const API_BASE = 'https://api.customer.io/v1';

async function fetchStats(campaignId: number, name: string) {
    const key = process.env.CUSTOMER_IO_APP_KEY;
    if (!key) {
        console.error("No APP KEY found in env");
        return;
    }
    try {
        const res = await fetch(`${API_BASE}/campaigns/${campaignId}/metrics?period=days&steps=30`, {
           headers: { Authorization: `Bearer ${key}` }
        });
        if (!res.ok) {
            console.log(`Failed to fetch for ${campaignId} (${name}): ${res.status}`);
            return;
        }
        const data = await res.json();
        const series = data.metric?.series || {};
        
        const sumArray = (arr: number[]) => (arr || []).reduce((a, b) => a + b, 0);
        
        const sent = sumArray(series.sent);
        const opens = sumArray(series.opened);
        const clicks = sumArray(series.clicked);
        
        let openRate = '0.0%';
        let clickRate = '0.0%';
        if (sent > 0) {
            // Customer.io standard definition is opens / delivered, but we can do opens / sent for simplicity or follow standard 
            openRate = ((opens / sent) * 100).toFixed(1) + '%';
            clickRate = ((clicks / opens) * 100).toFixed(1) + '%';
        }
        
        console.log(`| ${campaignId.toString().padEnd(6)} | ${name.padEnd(20)} | ${sent.toString().padEnd(10)} | ${openRate.padEnd(10)} | ${(sent > 0 ? ((clicks/sent)*100).toFixed(1) + '%' : '0.0%').padEnd(10)} |`);
    } catch (e) {
        console.error("Error fetching", campaignId, e);
    }
}

async function run() {
    const leads = [
        { id: 608, name: "PS608" },
        { id: 572, name: "EX572" },
        { id: 651, name: "EI" },
        { id: 934, name: "FB" },
        { id: 932, name: "GG" },
        { id: 887, name: "MY" },
        { id: 873, name: "SW" },
        { id: 988, name: "WG" }
    ];
    
    console.log("| ID     | Name                 | Sent       | Open Rate  | Click Rate |");
    console.log("|--------|----------------------|------------|------------|------------|");
    for (const c of leads) {
        await fetchStats(c.id, c.name);
    }
}

run();
