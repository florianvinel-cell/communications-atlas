import dotenv from 'dotenv';
dotenv.config();

async function run() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const res = await fetch(`http://127.0.0.1:3000/api/campaigns/580/metrics?period=days&steps=30`);
    console.log(res.status);
    const data = await res.json();
    console.log(data);
}
run();
