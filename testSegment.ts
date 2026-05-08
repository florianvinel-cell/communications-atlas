import dotenv from 'dotenv';
dotenv.config();
async function run() {
  const key = process.env.CUSTOMER_IO_APP_KEY;
  const res = await fetch('https://api.customer.io/v1/customers/b2b604fa-c989-4b6e-8bdb-7e930e626682/attributes', {
    headers: { Authorization: `Bearer ${key}` }
  });
  console.log('Customer fetch status:', res.status);
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
run();
