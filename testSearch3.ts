import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const key = process.env.CUSTOMER_IO_APP_KEY;
  // Let's test if search API supports standard search
  const res = await fetch('https://api.customer.io/v1/customers?limit=5', {
    method: 'POST',
    headers: { 
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        filter: { segment: { id: 775 } }
    })
  });
  console.log("Status:", res.status);
  const data = await res.json();
  console.log("Default Search Returned:", data.identifiers?.length, "results");
}
run();
