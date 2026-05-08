async function testSync() {
    const res = await fetch('http://localhost:3000/api/campaigns/1051/sync');
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
}
testSync();
