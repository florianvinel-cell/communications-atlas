export const DATA = {"stages": ["ACQUISITION", "PREBUILD", "RETENTION", "UPGRADES", "CHURN"],
  "stageLabels": {
    "ACQUISITION": "Acquisition",
    "PREBUILD": "Pre-build",
    "RETENTION": "Retention",
    "UPGRADES": "Upgrades",
    "CHURN": "Churn"
  }, "groups": {
    "ACQUISITION": ["ACQ", "FB", "GG", "EI", "MY", "SW", "WG", "SBA", "WX", "PRE", "PS608", "EX572", "SIG", "PSL607", "ADO926", "REC", "PSNURTURE"],
    "PREBUILD": ["PAY", "LAUNCHPATH", "PCL580", "PLUSPATH", "PCP888", "SF", "TFC401", "DLC402", "DLC2991", "SFC879", "TFD403", "TFD403_2", "BUILD", "WBL287", "NPS906"],
    "RETENTION": ["RETL", "LRF854", "LDO970", "LEI971", "LST972", "LPP973", "RETP", "PRF974", "PDO977", "PEM978", "PST979", "PPP980", "PGC981", "PGV982", "GPILOT994", "ONGOING", "GMB", "CHKP775", "REF481", "UPS432", "LCR1038", "NPSF911"],
    "UPGRADES": ["LUF916", "PLG1008", "MTA250", "UPGRADE918"],
    "CHURN": ["CHURN", "WBF964", "CXD1039", "WB21031"]
  }, "nodes": {
    "ACQUISITION": "Acquisition", "FB": "Facebook Lead Gen - 934", "GG": "Google Lead Gen - 932", "EI": "Lead Nurture Exit Intent - 651", "MY": "Mylo Flow - 887", "SW": "Swyft Flow - 873", "WG": "WaGov 2026 - 988", "SBA": "Website Audit Tool SBA Leads - 1035", "WX": "Wix Leads Sequence - 577", "PRE": "Pre-Signup", "PS608": "Pre-Signup Launch - 608", "EX572": "Example Pages Send - 572", "SIG": "Signed Up No Payment", "PSL607": "Post-Signup Launch - 607", "ADO926": "Acquisition Drop-Off - 926", "REC": "US Leads Monthly Re-acquisition - 1044", "PSNURTURE": "Post-Signup Nurture - 1050",
    "PREBUILD": "Pre-build", "PAY": "Payment Event", "LAUNCHPATH": "Launch Customer Path", "PCL580": "Purchase Launch Confirmation - 580", "PLUSPATH": "Plus / Growth Customer Path", "PCP888": "Purchase Plus-Growth Confirmation - 888", "SF": "SmartForm Completion", "TFC401": "Post Payment - Typeform Chasers - 401", "DLC402": "Post Payment - DLC Chasers - 402", "SFC879": "No-TF Activation - SF Chasers - 879", "TFD403": "TF Completed and DLC Booked - 403", "TFD403_2": "TF Completed and DLC Booked - 403_2", "BUILD": "Site Being Built", "WBL287": "Post Sign-up - Website Live - 287", "DLC2991": "Post Payment - DLC 2 Chasers - 991", "NPS906": "New Customer NPS - 906",
    "RETENTION": "Retention", "RETL": "Launch - Activation & Retention", "LRF854": "Launch Retention Flow - 854", "LDO970": "Launch Retention - Domain - 970", "LEI971": "Launch Retention - Email - 971", "LST972": "Launch Retention - Stripe - 972", "LPP973": "Launch Retention - PayPal - 973", "RETP": "Plus/Growth - Activation & Retention", "PRF974": "Plus Retention Flow - 974", "PDO977": "Plus Retention - Domain - 977", "PEM978": "Plus Retention - Email - 978", "PST979": "Plus Retention - Stripe - 979", "PPP980": "Plus Retention - PayPal - 980", "PGC981": "Plus Retention - GMB Connection - 981", "PGV982": "Plus Retention - GMB Verification - 982", "GPILOT994": "Growth Onboarding Pilot - 994", "ONGOING": "Ongoing - Always-On Campaigns", "GMB": "GMB Flows", "CHKP775": "Website Checkup - 775", "REF481": "Share Referral Link - 481", "UPS432": "Upsell Generic Footer - 432", "LCR1038": "Local Competitor Radar - 1038", "NPSF911": "No NPS 90 Days - 911",
    "UPGRADES": "Upgrades", "LUF916": "Launch Upgrade Flow - 916", "PLG1008": "Plus to Growth AM Emails - 1008", "MTA250": "Monthly to Annual - 250", "UPGRADE918": "Plus Upgrade flow - 918",
    "CHURN": "Churn", "WBF964": "Winback Flow - 964", "CXD1039": "Cancelled from Dunning - 1039", "WB21031": "Cancelled 2024-2026 Winback - 1031"
  }, "edges": [["ACQ", "FB"], ["ACQ", "GG"], ["ACQ", "EI"], ["ACQ", "MY"], ["ACQ", "SW"], ["ACQ", "WG"], ["ACQ", "SBA"], ["ACQ", "WX"], ["FB", "PRE"], ["GG", "PRE"], ["EI", "PRE"], ["MY", "PRE"], ["SW", "PRE"], ["WG", "PRE"], ["SBA", "PRE"], ["WX", "PRE"], ["PRE", "PS608"], ["PS608", "EX572"], ["PS608", "SIG"], ["EI", "SIG"], ["SIG", "PSL607"], ["SIG", "ADO926"], ["PSL607", "EX572"], ["PSL607", "PAY"], ["ADO926", "PAY"], ["PAY", "LAUNCHPATH"], ["LAUNCHPATH", "PCL580"], ["PAY", "PLUSPATH"], ["PLUSPATH", "PCP888"], ["PCL580", "SF"], ["PCP888", "SF"], ["SF", "TFC401"], ["SF", "DLC402"], ["TFC401", "DLC402"], ["TFC401", "SFC879"], ["DLC402", "TFD403"], ["TFD403", "BUILD"], ["BUILD", "WBL287"], ["BUILD", "DLC2991"], ["BUILD", "NPS906"], ["WBL287", "RETL"], ["RETL", "LRF854"], ["RETL", "LDO970"], ["RETL", "LEI971"], ["RETL", "LST972"], ["RETL", "LPP973"], ["RETL", "LUF916"], ["LUF916", "UPGRADE918"], ["WBL287", "RETP"], ["RETP", "PRF974"], ["RETP", "PDO977"], ["RETP", "PEM978"], ["RETP", "PST979"], ["RETP", "PPP980"], ["RETP", "PGC981"], ["RETP", "PGV982"], ["RETP", "GPILOT994"], ["RETP", "PLG1008"], ["RETL", "ONGOING"], ["RETP", "ONGOING"], ["ONGOING", "MTA250"], ["ONGOING", "GMB"], ["ONGOING", "CHKP775"], ["ONGOING", "REF481"], ["ONGOING", "UPS432"], ["ONGOING", "LCR1038"], ["ONGOING", "NPSF911"], ["RETL", "CHURN"], ["RETP", "CHURN"], ["CHURN", "WBF964"], ["CHURN", "CXD1039"], ["CHURN", "WB21031"], ["PS608", "REC"], ["PSL607", "REC"]]};

export const nodeTypes: Record<string, 'campaign' | 'source' | 'milestone'> = {
    'FB': 'source', 'GG': 'source', 'MY': 'source', 'SW': 'source', 'WG': 'source', 'SBA': 'source', 'WX': 'source',
    'SIG': 'milestone', 'PAY': 'milestone', 'BUILD': 'milestone', 'CHURN': 'milestone',
};
// default to campaign
Object.keys(DATA.nodes).forEach(k => {
    if (!DATA.stages.includes(k) && !nodeTypes[k]) nodeTypes[k] = 'campaign';
});

export const upstream: Record<string, string[]> = {};
export const downstream: Record<string, string[]> = {};
DATA.edges.forEach(([f, t]) => {
  (downstream[f] = downstream[f] || []).push(t);
  (upstream[t] = upstream[t] || []).push(f);
});

export const nodeStage: Record<string, string> = {};
DATA.stages.forEach(s => {
  nodeStage[s] = s;
  (DATA.groups[s] || []).forEach(n => { nodeStage[n] = s; });
});

export const totalCampaigns = Object.keys(DATA.nodes).length - DATA.stages.length;
