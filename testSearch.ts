import dotenv from 'dotenv';
dotenv.config();
async function run() {
  const key = process.env.CUSTOMER_IO_APP_KEY;
  const payload = {
    filter: {
      segment: { id: 775 }
    },
    sort: {
      field: "created_at",
      direction: "desc"
    },
    limit: 5
  };
  const res = await fetch('https://api.customer.io/v1/customers', {
    method: 'POST',
    headers: { 
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  console.log("Status:", res.status);
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
run();
