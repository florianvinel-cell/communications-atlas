import 'dotenv/config';

async function testOptions() {
  const response = await fetch('https://api.customer.io/v1/campaigns/879/metrics?period=days&steps=30&unique=true', {
    headers: { Authorization: `Bearer ${process.env.CUSTOMER_IO_APP_API_KEY || process.env.CUSTOMER_IO_APP_KEY}` }
  });
  const data = await response.json();
  const series = data.metric?.series || {};
  const sumArray = (arr: number[]) => (arr || []).reduce((a, b) => a + b, 0);
  console.log('unique sent:', sumArray(series.sent));
  console.log('unique opened:', sumArray(series.opened));
  console.log('unique opened (human):', sumArray(series.human_opened));
}

testOptions();
