import dotenv from 'dotenv';
dotenv.config();

const API_BASE = 'https://api.customer.io/v1';

async function testFetch(id: number) {
    const key = process.env.CUSTOMER_IO_APP_KEY;
    console.log(`Fetching ${id}...`);
    try {
        const res = await fetch(`${API_BASE}/campaigns/${id}/metrics?period=days&steps=30`, {
           headers: { Authorization: `Bearer ${key}` }
        });
        const data = await res.json();
        const sent = data.metric?.series?.sent?.reduce((a: number, b: number) => a + b, 0) || 0;
        console.log(`Campaign ${id} sent: ${sent}`);
        console.log(`Campaign raw metrics: `, JSON.stringify(data.metric?.series?.sent));
    } catch (e) {
        console.error("Error", e);
    }
}

async function run() {
    await testFetch(580);
    await testFetch(401);
}
run();
