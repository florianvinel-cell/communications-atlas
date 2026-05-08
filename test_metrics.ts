import 'dotenv/config';

async function testOptions() {
  const response = await fetch('https://api.customer.io/v1/campaigns/879/metrics?period=days&steps=30&unique=true', {
    headers: { Authorization: `Bearer ${process.env.CUSTOMER_IO_APP_API_KEY || process.env.CUSTOMER_IO_APP_KEY}` }
  });
  const data = await response.json();
  console.log('unique=true', Object.keys(data.metric?.series || {}));
}

testOptions();
