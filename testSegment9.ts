import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const key = process.env.CUSTOMER_IO_APP_KEY;
  const cursor = Buffer.from(`1:${3993031 - 100}`).toString('base64');
  const res = await fetch(`https://api.customer.io/v1/segments/775/membership?start=${cursor}&limit=10`, {
       headers: { Authorization: `Bearer ${key}` }
  });
  const data = await res.json();
  console.log("Last IDs:", data);
  const ids = data.ids || [];
  
  if (ids.length > 0) {
      const attrRes = await fetch(`https://api.customer.io/v1/customers/${ids[ids.length - 1]}/attributes`, {
        headers: { Authorization: `Bearer ${key}` }
      });
      const attrData = await attrRes.json();
      console.log("Created At:", attrData.customer?.attributes?.created_at, attrData.customer?.identifiers?.email);
  }
}
run();
