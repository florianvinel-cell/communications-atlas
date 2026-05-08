import dotenv from 'dotenv';
dotenv.config();

const APP_API_BASE = 'https://api.customer.io/v1';

async function run() {
    const key = process.env.CUSTOMER_IO_APP_KEY;
    const segmentId = 775;
    const limit = 5;

    async function findMaxValidSeq(): Promise<number> {
        let low = 0;
        let high = 1000000;
          
        async function hasItems(seq: number): Promise<boolean> {
            const cursor = Buffer.from(`1:${seq}`).toString('base64');
            const res = await fetch(`${APP_API_BASE}/segments/${segmentId}/membership?start=${cursor}&limit=1`, {
                headers: { Authorization: `Bearer ${key}` }
            });
            if (!res.ok) return false;
            const data = await res.json();
            return !!(data.ids && data.ids.length > 0);
        }

        while (await hasItems(high)) { low = high; high *= 2; }
        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            if (await hasItems(mid)) low = mid + 1;
            else high = mid - 1;
        }
        return low - 1;
    }
      
    console.log("Finding max sequence...");
    const maxSeq = await findMaxValidSeq();
    console.log("Max valid sequence:", maxSeq);
      
    let currentSeq = maxSeq;
    let collectedIds: string[] = [];
    let step = 10000;
      
    let safeLoop = 0;
    while (collectedIds.length < limit && currentSeq >= 0 && safeLoop < 50) {
        safeLoop++;
        const startSeq = Math.max(0, currentSeq - step);
        const cursor = Buffer.from(`1:${startSeq}`).toString('base64');
        
        console.log(`Fetching from ${startSeq} (step: ${step})`);
        const res = await fetch(`${APP_API_BASE}/segments/${segmentId}/membership?start=${cursor}&limit=1000`, {
            headers: { Authorization: `Bearer ${key}` }
        });
        const data = await res.json();
        const ids = data.ids || [];
          
        if (ids.length === 1000) {
            console.log("Hit 1000 limit, shrinking step size.");
            step = Math.max(10, Math.floor(step / 2));
            continue;
        }
        
        const toAdd = [...ids].reverse();
        for (const id of toAdd) {
            if (!collectedIds.includes(id)) {
                collectedIds.push(id);
                if (collectedIds.length >= limit) break;
            }
        }
          
        currentSeq = startSeq;
        step = Math.min(1000000, step * 2);
    }
      
    console.log("Last 5 customers:", collectedIds);
}
run();
