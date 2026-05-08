import dotenv from 'dotenv';
dotenv.config();
async function run() {
  const key = process.env.CUSTOMER_IO_APP_KEY;
  const attrRes = await fetch(`https://api.customer.io/v1/customers/aa74f01a-6db2-4bf4-9357-f2d6ebcdb4dc/attributes`, {
        headers: { Authorization: `Bearer ${key}` }
  });
  const attrData = await attrRes.json();
  console.log("Last Search Element created_at:", attrData.customer?.attributes?.created_at);
}
run();
