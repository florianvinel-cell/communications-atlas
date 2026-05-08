import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const key = process.env.CUSTOMER_IO_APP_KEY;
  // Let's guess a next cursor.
  // We know it's base64 of "1:something"
  // Let's try a very high number.
  const cursor = Buffer.from('1:1000000000').toString('base64');
  console.log("Cursor:", cursor);
  const res = await fetch(`https://api.customer.io/v1/segments/775/membership?start=${cursor}`, {
    headers: { Authorization: `Bearer ${key}` }
  });
  const data = await res.json();
  console.log("Status:", res.status);
  console.log("IDs:", data.ids?.length);
  console.log("Next:", data.next);
}
run();
