import 'dotenv/config';

async function check() {
  const url = 'https://api.customer.io/v1/campaigns/879/metrics?period=days&steps=30&type=unique';
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.CUSTOMER_IO_APP_API_KEY || process.env.CUSTOMER_IO_APP_KEY}` }
  });
  const data = await response.json();
  console.log(data);
}

check();
