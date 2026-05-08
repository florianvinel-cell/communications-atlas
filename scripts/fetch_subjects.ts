import * as dotenv from 'dotenv';
dotenv.config();

async function fetchAllActions() {
  const key = process.env.CUSTOMER_IO_APP_API_KEY;
  if (!key) {
    console.error('CUSTOMER_IO_APP_API_KEY is not set');
    return;
  }

  // Testing the potential list endpoint
  const url = `https://api.customer.io/v1/campaigns/1050/actions`;
  console.log(`Fetching: ${url}`);
  try {
    const response = await fetch(url, { headers: { Authorization: `Bearer ${key}` } });
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error fetching actions:', error);
  }
}

fetchAllActions();
