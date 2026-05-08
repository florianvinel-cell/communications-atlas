import 'dotenv/config';

async function listCampaigns() {
  const url = 'https://api.customer.io/v1/campaigns';
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.CUSTOMER_IO_APP_API_KEY || process.env.CUSTOMER_IO_APP_KEY}` }
  });
  const data = await response.json();
  if (data.campaigns) {
    data.campaigns.forEach((c: any) => {
      if (c.name.toLowerCase().includes('sf') || c.name.toLowerCase().includes('no-tf') || c.name.toLowerCase().includes('879')) {
        console.log(`ID: ${c.id}, Name: ${c.name}`);
      }
    });
  } else {
    console.log(data);
  }
}

listCampaigns();
