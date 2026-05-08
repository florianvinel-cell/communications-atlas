import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const supabaseUrl = 'https://zqqklrsdzjxuahdquqra.supabase.co';
const supabaseAnonKey = 'sb_publishable_vQtXrDbKvUe5I2heQ2ZKEQ_F0wEs2Az';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function generateDoc() {
  const { data, error } = await supabase.from('app_config').select('config').eq('id', 'global').single();
  if (error) {
    console.error('Error fetching data:', error);
    return;
  }
  
  const config = data.config;
  const metadata = config.campaignMetadata || {};
  
  const plans = {
    'Leads': [],
    'Launch': [],
    'Plus': []
  };

  for (const [code, meta] of Object.entries(metadata)) {
    const plan = meta.plan || 'Leads';
    const item = `* **${meta.customName || code}** (${code}) - ${meta.label || 'Unlabeled'}\n  * *Description*: ${meta.description || 'N/A'}`;
    
    if (plan === 'Launch & Plus') {
      plans['Launch'].push(item);
      plans['Plus'].push(item);
    } else if (plans[plan]) {
      plans[plan].push(item);
    } else {
       // fallback, put in Leads?
       plans['Leads'].push(item);
    }
  }

  let doc = `# Customer.io Campaign Atlas\n\n`;
  
  doc += `## 1. Leads\n\n`;
  doc += plans['Leads'].join('\n\n') + '\n\n';
  
  doc += `## 2. Launch Users\n\n`;
  doc += plans['Launch'].join('\n\n') + '\n\n';
  
  doc += `## 3. Plus Users\n\n`;
  doc += plans['Plus'].join('\n\n') + '\n\n';

  fs.writeFileSync('campaign_atlas.md', doc);
  console.log('Generated campaign_atlas.md');
}

generateDoc();
