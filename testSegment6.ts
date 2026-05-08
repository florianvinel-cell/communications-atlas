import dotenv from 'dotenv';
dotenv.config();
async function run() {
  const key = process.env.CUSTOMER_IO_APP_KEY;
  // Test 1: sort=desc
  // Test 2: order=desc
  // Test 3: direction=desc
  for (const q of ['sort=desc', 'order=desc', 'direction=desc', 'sort=-created_at']) {
      const res = await fetch(`https://api.customer.io/v1/segments/775/membership?limit=5&${q}`, {
        headers: { Authorization: `Bearer ${key}` }
      });
      const data = await res.json();
      console.log(q, data.ids?.[0], data.ids?.[4]);
  }
}
run();
