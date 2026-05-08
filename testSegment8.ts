import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const key = process.env.CUSTOMER_IO_APP_KEY;
  
  async function testId(id: number) {
     const cursor = Buffer.from(`1:${id}`).toString('base64');
     const res = await fetch(`https://api.customer.io/v1/segments/775/membership?start=${cursor}&limit=1`, {
       headers: { Authorization: `Bearer ${key}` }
     });
     const data = await res.json();
     return data.ids ? data.ids.length : 0;
  }
  
  let low = 0;
  let high = 50000000;
  
  while (low < high) {
    let mid = Math.floor((low + high) / 2);
    const count = await testId(mid);
    if (count > 0) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  
  console.log("Max ID is approx:", low);
  
  // Now fetch with maxID - 5
  const cursor = Buffer.from(`1:${low - 5}`).toString('base64');
  const res = await fetch(`https://api.customer.io/v1/segments/775/membership?start=${cursor}&limit=5`, {
       headers: { Authorization: `Bearer ${key}` }
  });
  const data = await res.json();
  console.log("Last IDs:", data.ids);
}
run();
