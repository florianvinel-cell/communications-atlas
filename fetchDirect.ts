import dotenv from 'dotenv';
dotenv.config();

const API_BASE = 'https://api.customer.io/v1';

async function run() {
    const key = process.env.CUSTOMER_IO_APP_KEY;
    try {
        const res = await fetch(`${API_BASE}/campaigns/608?period=30`, {
           headers: { Authorization: `Bearer ${key}` }
        });
        const data = await res.json();
        console.log("608: ", JSON.stringify(data, null, 2));

        const res2 = await fetch(`${API_BASE}/campaigns/608/metrics?period=days&steps=30`, {
            headers: { Authorization: `Bearer ${key}` }
        });
        const data2 = await res2.json();
        console.log("608 metrics: ", JSON.stringify(data2, null, 2));
    } catch (e) {
        console.error("Error", e);
    }
}
run();
