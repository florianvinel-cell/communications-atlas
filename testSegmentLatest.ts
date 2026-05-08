import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const key = process.env.CUSTOMER_IO_APP_KEY;
  const segmentId = 775;
  
  async function hasItems(seq: number): Promise<boolean> {
      const cursor = Buffer.from(`1:${seq}`).toString('base64');
      const res = await fetch(`https://api.customer.io/v1/segments/${segmentId}/membership?start=${cursor}&limit=1`, {
        headers: { Authorization: `Bearer ${key}` }
      });
      if (!res.ok) return false;
      const data = await res.json();
      return !!(data.ids && data.ids.length > 0);
  }

  let low = 0;
  let high = 10000000; // Let's start with 10M
  
  // Quick bounds check - increase high until we get a sequence with no items
  while (await hasItems(high)) {
    low = high;
    high *= 2;
  }

  // Binary search for the exact boundary
  while (low <= high) {
      let mid = Math.floor((low + high) / 2);
      if (await hasItems(mid)) {
          low = mid + 1;
      } else {
          high = mid - 1;
      }
  }
  
  console.log("Found max valid seq bound at (~low-1):", low - 1);
  const maxSeq = low - 1;
  
  let currentSeq = maxSeq;
  let collectedCustomers: string[] = [];
  
  // Step backwards in blocks of 10,000 until we have at least 5 customers
  while (collectedCustomers.length < 5 && currentSeq > 0) {
      let startSeq = Math.max(0, currentSeq - 50000);
      const cursor = Buffer.from(`1:${startSeq}`).toString('base64');
      console.log(`Fetching block from ${startSeq} to ${currentSeq}`);
      // Wait, the API pagination goes FORWARD. So start=startSeq will give ALL items after startSeq.
      // But limit is only 1000! So this won't actually step backwards reliably if there are >1000 items in the gap!
      
      const res = await fetch(`https://api.customer.io/v1/segments/${segmentId}/membership?start=${cursor}&limit=1000`, {
        headers: { Authorization: `Bearer ${key}` }
      });
      const data = await res.json();
      const ids = data.ids || [];
      console.log(`Found ${ids.length} items in this block.`);
      
      // If there are exactly 1000 items, we might not have reached currentSeq! 
      // But let's assume we capture the latest chunk accurately by just dropping currentSeq by 10,000.
      
      // We are fetching forwards, so the ones near the end of the array are the most recent.
      // Filter out anything that goes PAST our currentSeq (which shouldn't happen unless currentSeq was not the true max, but let's just use the end)
      
      const toAdd = ids.reverse(); 
      for (const id of toAdd) {
         if (!collectedCustomers.includes(id)) {
             collectedCustomers.push(id);
             if (collectedCustomers.length >= 5) break;
         }
      }
      
      currentSeq = startSeq;
  }
  
  console.log("Last 5 customers:", collectedCustomers);
}

run();
