import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const key = process.env.CUSTOMER_IO_APP_KEY;
  // first fetch with limit 5
  let res = await fetch(`https://api.customer.io/v1/segments/775/membership?limit=5`, { headers: { Authorization: `Bearer ${key}` }});
  let data = await res.json();
  console.log("No Start:", data.ids);

  // then start=base64("1:2")
  const start = Buffer.from("1:2").toString('base64');
  res = await fetch(`https://api.customer.io/v1/segments/775/membership?limit=5&start=${start}`, { headers: { Authorization: `Bearer ${key}` }});
  data = await res.json();
  console.log("Start 1:2:", data.ids);
}
run();
