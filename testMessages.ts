import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const email = 'cperry@genesisrcg.com';
  const key = process.env.CUSTOMER_IO_APP_KEY;
  
  const custRes = await fetch(`https://api.customer.io/v1/customers?email=${email}`, {
    headers: { Authorization: `Bearer ${key}` }
  });
  const custData = await custRes.json();
  const cid = custData.results?.[0]?.id;
  
  if (!cid) {
    console.log("No customer");
    return;
  }
  
  const msgRes = await fetch(`https://api.customer.io/v1/customers/${cid}/messages?limit=2`, {
    headers: { Authorization: `Bearer ${key}` }
  });
  const msgData = await msgRes.json();
  console.log(JSON.stringify(msgData, null, 2));
}
run();
