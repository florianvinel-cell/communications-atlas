import dotenv from 'dotenv';
dotenv.config();
async function run() {
  const key = process.env.CUSTOMER_IO_APP_KEY;
  const res = await fetch('https://api.customer.io/v1/segments/775/membership?limit=5', {
    headers: { Authorization: `Bearer ${key}` }
  });
  const data = await res.json();
  console.log("Keys:", Object.keys(data));
  console.log("IDs:", data.ids);
  console.log("Next:", data.next);
}
run();
