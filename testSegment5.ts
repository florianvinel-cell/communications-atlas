import dotenv from 'dotenv';
dotenv.config();
async function run() {
  const key = process.env.CUSTOMER_IO_APP_KEY;
  const attrRes = await fetch(`https://api.customer.io/v1/segments/775`, {
        headers: { Authorization: `Bearer ${key}` }
  });
  const data = await attrRes.json();
  console.log("Segment Data:", data);
}
run();
