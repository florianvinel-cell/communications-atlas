import dotenv from 'dotenv';
dotenv.config();

const API_BASE = 'https://api.customer.io/v1';

async function fetchStats(id: number) {
    const key = process.env.CUSTOMER_IO_APP_KEY;
    const res = await fetch(`${API_BASE}/campaigns/${id}/metrics?period=days&steps=30`, {
       headers: { Authorization: `Bearer ${key}` }
    });
    const data = await res.json();
    const series = data.metric?.series || {};
    const sumArray = (arr: number[]) => (arr || []).reduce((a, b) => a + b, 0);
    const sent = sumArray(series.sent);
    const opens = sumArray(series.opened);
    const clicks = sumArray(series.clicked);
    console.log(`ID ${id} - sent: ${sent}, opened: ${opens}, clicked: ${clicks}`);
}

async function run() {
    await fetchStats(580);
    await fetchStats(401);
}
run();
