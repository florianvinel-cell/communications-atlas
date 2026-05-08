import fs from 'fs';

const currentData = `export const initialCampaignMetadata: Record<string, any> = {
  "WBF964": { campaignId: 964, customName: "Win-Back Lapsed Customers", label: "Win-Back", description: "Re-engagement flow for customers who have churned. Attempts to bring them back with targeted messaging.", metrics: { volume: "1,079", openRate: "48.7%", clickRate: "0.0%" } },
  "LUF916": { campaignId: 916, customName: "Launch → Upgrade Nudge", label: "Main Flow", description: "Long-running sequence nudging Launch plan customers to upgrade to Plus or Growth.", metrics: { volume: "22,605", openRate: "39.6%", clickRate: "0.5%" } },
  "PLG1008": { campaignId: 1008, customName: "Plus → Growth AM Emails", label: "Upgrade Pitch", description: "Targeted emails encouraging Plus customers to upgrade to the Growth plan.", metrics: { volume: "808", openRate: "39.8%", clickRate: "4.1%" } },
  "UPGRADE918": { campaignId: 918, customName: "Plus Upgrade Full Flow", label: "Main Flow", description: "Full nurture sequence encouraging Plus customers to upgrade, with multi-step touchpoints.", metrics: { volume: "24,044", openRate: "40.0%", clickRate: "0.5%" } },
  "MTA250": { campaignId: 250, customName: "Monthly → Annual Switch", label: "Billing Upsell", description: "Encourages monthly subscribers to switch to an annual billing plan. Focused on LTV extension.", metrics: { volume: "47,398", openRate: "35.2%", clickRate: "1.4%" } },
  "PRF974": { campaignId: 974, customName: "Plus Retention Main Flow", label: "Main Flow", description: "Core retention sequence for Plus plan customers. Drives full platform activation across all key features.", metrics: { volume: "6,286", openRate: "38.2%", clickRate: "2.8%" } },
  "PDO977": { campaignId: 977, customName: "Plus Retention - Domain", label: "Feature Activation", description: "Targets Plus customers who haven't connected or purchased a domain.", metrics: { volume: "275", openRate: "43.6%", clickRate: "6.6%" } },
  "PEM978": { campaignId: 978, customName: "Plus Retention - Email", label: "Feature Activation", description: "Targets Plus customers who haven't set up a business email.", metrics: { volume: "1,390", openRate: "36.5%", clickRate: "3.9%" } },
  "PST979": { campaignId: 979, customName: "Plus Retention - Stripe", label: "Feature Activation", description: "Targets Plus customers who haven't connected Stripe.", metrics: { volume: "3,290", openRate: "39.1%", clickRate: "1.5%" } },
  "PPP980": { campaignId: 980, customName: "Plus Retention - PayPal", label: "Feature Activation", description: "Targets Plus customers who haven't connected PayPal.", metrics: { volume: "3,097", openRate: "38.0%", clickRate: "1.1%" } },
  "PGC981": { campaignId: 981, customName: "Plus Retention - GMB Connection", label: "Feature Activation", description: "Targets Plus customers who haven't connected their Google Business Profile.", metrics: { volume: "226", openRate: "36.6%", clickRate: "6.2%" } },
  "PGV982": { campaignId: 982, customName: "Plus Retention - GMB Verification", label: "Feature Activation", description: "Targets Plus customers who haven't verified their Google Business Profile.", metrics: { volume: "1,292", openRate: "42.6%", clickRate: "7.6%" } },
  "NPSF911": { campaignId: 911, customName: "90-Day NPS Survey", label: "Survey", description: "Sends an NPS survey to customers who haven't been surveyed in the last 90 days. Measures satisfaction and flags at-risk accounts.", metrics: { volume: "738", openRate: "51.2%", clickRate: "12.4%" } },
  "LRF854": { campaignId: 854, customName: "Launch Retention Main Flow", label: "Main Flow", description: "Core retention sequence for Launch plan customers. Drives feature activation (domain, email, payments) to reduce churn.", metrics: { volume: "11,857", openRate: "37.4%", clickRate: "1.8%" } },
  "LDO970": { campaignId: 970, customName: "Launch Retention - Domain", label: "Feature Activation", description: "Targets Launch customers who haven't connected or purchased a domain yet.", metrics: { volume: "193", openRate: "49.9%", clickRate: "7.0%" } },
  "LEI971": { campaignId: 971, customName: "Launch Retention - Email", label: "Feature Activation", description: "Targets Launch customers who haven't set up a business email.", metrics: { volume: "791", openRate: "40.1%", clickRate: "6.7%" } },
  "LST972": { campaignId: 972, customName: "Launch Retention - Stripe", label: "Feature Activation", description: "Targets Launch customers who haven't connected Stripe for payments.", metrics: { volume: "1,481", openRate: "37.2%", clickRate: "1.8%" } },
  "LPP973": { campaignId: 973, customName: "Launch Retention - PayPal", label: "Feature Activation", description: "Targets Launch customers who haven't connected PayPal for payments.", metrics: { volume: "1,415", openRate: "37.8%", clickRate: "1.9%" } },
  "PCL580": { campaignId: 580, customName: "Launch Purchase atlas", label: "Payment Confirmation", description: "Confirms payment and sets expectations for new Launch plan customers. First touchpoint after purchase.", metrics: { volume: "0", openRate: "0.0%", clickRate: "0.0%" } },
  "PCP888": { campaignId: 888, customName: "Plus Purchase atlas", label: "Payment Confirmation", description: "Confirms payment for Plus and Growth plan customers. Higher-tier onboarding kickoff.", metrics: { volume: "3,805", openRate: "65.1%", clickRate: "12.9%" } },
  "TFC401": { campaignId: 401, customName: "Smartform Chasers atlas", label: "SmartForm", description: "Primary sequence pushing new customers to complete the SmartForm so UENI can start building their site.", metrics: { volume: "0", openRate: "0.0%", clickRate: "0.0%" } },
  "DLC402": { campaignId: 402, customName: "DLC Chasers atlas", label: "Booking", description: "Pushes customers who completed the SmartForm to book their Design & Launch Call.", metrics: { volume: "0", openRate: "0.0%", clickRate: "0.0%" } },
  "SFC879": { campaignId: 879, customName: "SmartForm Re-engagement atlas", label: "SmartForm", description: "Re-engages customers who exhausted the primary SmartForm chaser flow without completing it.", metrics: { volume: "0", openRate: "0.0%", clickRate: "0.0%" } },
  "TFD403": { campaignId: 403, customName: "Launch Post-SmartForm & DLC Booked atlas", label: "Handoff", description: "Confirms next steps after a customer has completed the SmartForm and booked their call. Bridges intake to build.", metrics: { volume: "0", openRate: "0.0%", clickRate: "0.0%" } },
  "TFD403_2": { campaignId: 403, customName: "Plus Post-SmartForm & DLC Booked atlas", label: "Handoff", description: "Confirms next steps after a customer has completed the SmartForm and booked their call. Bridges intake to build.", metrics: { volume: "0", openRate: "0.0%", clickRate: "0.0%" }, plan: 'Launch' },
  "WBL287": { campaignId: 287, customName: "Your website is live atlas", label: "Go-Live", description: "Notifies the customer that their website has been published and guides them through their new UENI dashboard.", metrics: { volume: "7,325", openRate: "58.8%", clickRate: "14.7%" } },
  "MY": { campaignId: 887, customName: "Mylo Partner Leads", label: "Partner", description: "Nurture sequence for leads referred by Mylo (business insurance partner). Educates on UENI's value and drives sign-up.", metrics: { volume: "43,015", openRate: "25.0%", clickRate: "0.6%" } },
  "SW": { campaignId: 873, customName: "Swyft Partner Leads", label: "Partner", description: "Nurture sequence for leads referred by Swyft (incorporation partner). Drives conversion from lead to paid customer.", metrics: { volume: "7,444", openRate: "35.3%", clickRate: "0.8%" } },
  "WG": { campaignId: 988, customName: "US Gov Business Database", label: "Cold Outreach", description: "Outreach to newly incorporated US businesses sourced from a public government database.", metrics: { volume: "95,146", openRate: "52.2%", clickRate: "0.7%" } },
  "PS608": { campaignId: 608, customName: "Pre-Signup Nurture", label: "Top of Funnel", description: "Email sequence for people who left their email on a landing page but haven't created an account yet.", metrics: { volume: "14,906", openRate: "35.1%", clickRate: "3.4%" } },
  "PSL607": { campaignId: 607, customName: "Post-Signup Nurture", label: "Pre-Purchase", description: "Email sequence for people who created an account but haven't completed payment. Core pre-purchase conversion flow.", metrics: { volume: "21,075", openRate: "38.2%", clickRate: "3.9%" } },
  "EX572": { campaignId: 572 },
  "EI": { campaignId: 651 },
  "FB": { campaignId: 934 },
  "GG": { campaignId: 932 },
  "ADO926": { campaignId: 926 },
  "REC": { campaignId: 1044 },
  "CXD1039": { campaignId: 1039 },
  "GPILOT994": { campaignId: 994 },
  "SBA": { campaignId: 1035 },
  "WX": { campaignId: 577 },
  "PSNURTURE": { campaignId: 1050 },
  "DLC2991": { campaignId: 991 },
  "NPS906": { campaignId: 906 },
  "CHKP775": { campaignId: 775 },
  "REF481": { campaignId: 481 },
  "UPS432": { campaignId: 432 },
  "LCR1038": { campaignId: 1038 },
  "WB21031": { campaignId: 1031 },
};`;

const mappings = [
{ code: 'PS608', id: 608, name: 'Pre-Signup Nurture' },
{ code: 'EX572', id: 572, name: 'Example Pages Send' },
{ code: 'EI', id: 651, name: 'Lead Nurture Exit Intent' },
{ code: 'FB', id: 934, name: 'Facebook Lead Gen' },
{ code: 'GG', id: 932, name: 'Google Lead Gen' },
{ code: 'MY', id: 887, name: 'Mylo Flow' },
{ code: 'SW', id: 873, name: 'Swyft Flow' },
{ code: 'WG', id: 988, name: 'WaGov 2026' },
{ code: 'PSL607', id: 607, name: 'Post-Signup Nurture' },
{ code: 'ADO926', id: 926, name: 'Acquisition Drop-Off' },
{ code: 'REC1044', id: 1044, name: 'US Leads May 2026' },
{ code: 'PCL580', id: 580, name: 'Launch Purchase Confirmation' },
{ code: 'PCP888', id: 888, name: 'Plus & Growth Purchase Confirmation' },
{ code: 'UTP581', id: 581, name: 'Upgrade to Plan' },
{ code: 'TFC401', id: 401, name: 'SmartForm Chasers' },
{ code: 'SFC879', id: 879, name: 'SmartForm Re-engagement' },
{ code: 'DLC402', id: 402, name: 'DLC Chasers' },
{ code: 'TFD403', id: 403, name: 'Post-SmartForm & DLC Booked' },
{ code: 'WBL287', id: 287, name: 'Your Website is Live' },
{ code: 'LRF854', id: 854, name: 'Launch Retention Main Flow' },
{ code: 'LDO970', id: 970, name: 'Domain Activation' },
{ code: 'LEI971', id: 971, name: 'Email Activation' },
{ code: 'LST972', id: 972, name: 'Stripe Activation' },
{ code: 'LPP973', id: 973, name: 'PayPal Activation' },
{ code: 'LUF916', id: 916, name: 'Launch → Upgrade Nudge' },
{ code: 'WBF964', id: 964, name: 'Win-Back Flow' },
{ code: 'CXD1039', id: 1039, name: 'Cancelled Flow' },
{ code: 'PRF974', id: 974, name: 'Plus Retention Main Flow' },
{ code: 'PDO977', id: 977, name: 'Plus Domain Activation' },
{ code: 'PEM978', id: 978, name: 'Plus Email Activation' },
{ code: 'PST979', id: 979, name: 'Plus Stripe Activation' },
{ code: 'PPP980', id: 980, name: 'Plus PayPal Activation' },
{ code: 'PGC981', id: 981, name: 'GMB Connection' },
{ code: 'PGV982', id: 982, name: 'GMB Verification' },
{ code: 'GPILOT994', id: 994, name: 'Growth Onboarding Pilot' },
{ code: 'NPSF911', id: 911, name: '90-Day NPS Survey' },
{ code: 'PLG1008', id: 1008, name: 'Plus → Growth AM Emails' },
{ code: 'UPGRADE918', id: 918, name: 'Plus Upgrade Full Flow' },
{ code: 'MTA250', id: 250, name: 'Monthly → Annual Switch' },
];

const newStats: Record<string, any> = {
'PS608': {vol: '2,014', open: '39.2%', click: '4.1%'},
'EX572': {vol: '147', open: '80.3%', click: '66.7%'},
'EI': {vol: '347', open: '43.2%', click: '6.6%'},
'FB': {vol: '268', open: '26.5%', click: '0.0%'},
'GG': {vol: '274', open: '7.7%', click: '1.1%'},
'MY': {vol: '11,866', open: '14.4%', click: '0.4%'},
'SW': {vol: '4,956', open: '32.6%', click: '0.9%'},
'WG': {vol: '5,879', open: '48.5%', click: '0.7%'}
};

let objStr = currentData;
let obj: Record<string, any> = {};
eval('obj = ' + currentData.substring(currentData.indexOf('{')));

for (const m of mappings) {
   let targetCode = m.code;
   if (targetCode === 'REC1044' && obj['REC']) targetCode = 'REC';  
   if (!obj[targetCode]) {
     obj[targetCode] = {};
   }
   obj[targetCode].campaignId = m.id;
   // User requested: "Don't change anything else — layout, labels, descriptions, and connections all stay the same". 
   // So we ONLY set campaignId here, nothing else on other campaigns!
}

for (const code of Object.keys(newStats)) {
   if (!obj[code].metrics) obj[code].metrics = {};
   obj[code].metrics.volume = newStats[code].vol;
   obj[code].metrics.openRate = newStats[code].open;
   obj[code].metrics.clickRate = newStats[code].click;
}

const out = 'export const initialCampaignMetadata: Record<string, any> = {\n' + 
  Object.keys(obj).map(k => `  "${k}": ${JSON.stringify(obj[k])}`).join(',\n') + '\n};\n';

fs.writeFileSync('src/campaignData.ts', out);
