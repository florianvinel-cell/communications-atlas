import 'dotenv/config';

async function fetchMetrics() {
  const url = 'http://localhost:3000/api/campaigns/879/metrics?period=days&steps=30';
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.metric && data.metric.series) {
    const series = data.metric.series;
    const sumArray = (arr: number[]) => (arr || []).reduce((a, b) => a + b, 0);
    
    const sent = sumArray(series.sent);
    const opens = sumArray(series.opened);
    const clicks = sumArray(series.clicked);
    
    let openRate = '0.0%';
    let clickRate = '0.0%';
    if (sent > 0) {
      openRate = ((opens / sent) * 100).toFixed(1) + '%';
      clickRate = ((clicks / opens) * 100).toFixed(1) + '%';
    }

    console.log(`Volume: ${sent.toLocaleString('en-US')}`);
    console.log(`Open Rate: ${openRate}`);
    console.log(`Click Rate: ${clickRate}`);
  } else {
    console.error("No metrics found", data);
  }
}

fetchMetrics();
