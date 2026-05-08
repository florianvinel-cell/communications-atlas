import { initialCampaignMetadata } from './src/campaignData';
import { DATA } from './src/constants';

Object.keys(DATA.nodes).forEach(code => {
   if (!initialCampaignMetadata[code] || !initialCampaignMetadata[code].campaignId) {
      console.log(`Missing ID for ${code} (${DATA.nodes[code]})`);
   }
});
