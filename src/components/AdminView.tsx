import { useState } from 'react';
import { ChevronDown, ChevronUp, Save, Database } from 'lucide-react';
import { initialCampaignMetadata } from '../campaignData';
import { DATA } from '../constants';

import { AppConfig, CampaignMetadata, SavedPreset } from '../hooks/useAppConfig';
import CampaignGraph from './CampaignGraph';
import { campaignFlows } from '../flowData';

export default function AdminView({ 
  config, 
  presets,
  savePreset,
  applyPreset,
  toggleVisibility, 
  setStage,
  setMetadata,
  setActivePlan,
  setNodePosition,
  addCampaign,
  updateCampaign,
  addCustomEdge,
  removeCustomEdge
}: { 
  config: AppConfig, 
  presets: SavedPreset[],
  savePreset: (name: string) => void,
  applyPreset: (preset: SavedPreset) => void,
  toggleVisibility: (code: string) => void, 
  setStage: (code: string, stage: string) => void,
  setMetadata: (code: string, metadata: CampaignMetadata) => void,
  setActivePlan: (plan: 'Leads' | 'Launch' | 'Plus') => void,
  setNodePosition: (code: string, position: { x: number, y: number }) => void,
  addCampaign: (code: string, label: string, type: 'campaign' | 'source' | 'milestone') => void,
  updateCampaign: (code: string, label: string, type: 'campaign' | 'source' | 'milestone') => void,
  addCustomEdge: (edge: { id: string, source: string, target: string }) => void,
  removeCustomEdge: (id: string) => void
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [presetName, setPresetName] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'graph'>('list');

    const [toast, setToast] = useState<string | null>(null);

    const applyPresetAndToast = (p: SavedPreset) => {
        applyPreset(p);
        setToast(`Loaded snapshot: ${p.name}`);
        setTimeout(() => setToast(null), 3000);
    };

  const toggleExpand = (code: string) => {
    setExpanded(prev => ({ ...prev, [code]: !prev[code] }));
  };

  const updateMetadata = (code: string, updates: Partial<CampaignMetadata>) => {
    const current = config.campaignMetadata[code] || { metrics: {} };
    setMetadata(code, { ...current, ...updates, metrics: { ...current.metrics, ...updates.metrics } });
  };

  const grouped = [...DATA.stages, 'HIDDEN'].reduce((acc, stage) => {
    acc[stage] = [];
    return acc;
  }, {} as Record<string, string[]>);

  Object.keys(DATA.nodes)
    .filter(code => DATA.nodes[code] && !DATA.stages.includes(code))
    .forEach(code => {
      // Filtering in Admin list by plan
      const plan = config.campaignMetadata[code]?.plan || 'Leads';
      if (config.activePlan === 'Leads') {
          if (plan !== 'Leads') return;
      } else if (config.activePlan === 'Launch') {
          if (plan !== 'Launch' && plan !== 'Launch & Plus') return;
      } else if (config.activePlan === 'Plus') {
          if (plan !== 'Plus' && plan !== 'Launch & Plus') return;
      }

      if (config.hiddenCampaigns[code]) {
        grouped['HIDDEN'].push(code);
      } else {
        const stage = config.campaignStages[code] || DATA.stages[0];
        if (grouped[stage]) {
          grouped[stage].push(code);
        } else {
          grouped[DATA.stages[0]].push(code);
        }
      }
    });

  return (
    <div className="p-6 bg-[var(--ink)] border border-[var(--line)]">
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl text-[var(--paper)]">Manage Campaigns</h2>

          <div className="flex gap-4">
              <div className="flex bg-[var(--ink)] border border-[var(--line)] p-1 mr-4">                
                  {(['Leads', 'Launch', 'Plus'] as const).map(plan => (
                    <button 
                        key={plan}
                        className={`px-4 py-2 font-mono text-[12px] uppercase ${config.activePlan === plan ? 'bg-[var(--accent)] text-[var(--ink)]' : 'text-[var(--muted)]'}`} 
                        onClick={() => setActivePlan(plan)}
                    >
                      {plan}
                    </button>
                  ))}
              </div>
              <div className="flex bg-[var(--ink-2)] border border-[var(--line)]">
                  <button onClick={() => setActiveTab('list')} className={`px-3 py-1 text-xs font-mono uppercase ${activeTab === 'list' ? 'bg-[var(--accent)] text-[var(--ink)]' : 'text-[var(--muted)]'}`}>List</button>
                  <button onClick={() => setActiveTab('graph')} className={`px-3 py-1 text-xs font-mono uppercase ${activeTab === 'graph' ? 'bg-[var(--accent)] text-[var(--ink)]' : 'text-[var(--muted)]'}`}>Graph</button>
              </div>
              <div className="flex gap-2">
                 <input 
                    placeholder="New Preset Name" 
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    className="bg-[var(--ink-2)] border border-[var(--line)] text-[var(--paper)] px-3 py-1 font-mono text-xs"
                 />
                 <button onClick={() => { if(presetName) { savePreset(presetName); setPresetName(''); } }} className="flex items-center gap-1 bg-[var(--accent)] text-[var(--ink)] px-3 py-1 text-xs font-mono uppercase">
                     <Save size={14} /> Save State
                 </button>
              </div>
              <div className="border-l border-[var(--line)] pl-4 flex gap-2 items-center relative">
                  <Database size={14} className="text-[var(--muted)]" />
                  <select 
                      className="bg-[var(--ink-2)] border border-[var(--line)] text-[var(--paper)] px-3 py-1 text-xs font-mono uppercase outline-none"
                      onChange={(e) => {
                        if (!e.target.value) return;
                        const p = presets.find(p => p.id === e.target.value);
                        if (p) {
                            applyPresetAndToast(p);
                        }
                        e.target.value = '';
                      }}
                      defaultValue=""
                  >
                      <option value="" disabled>Load Snapshot...</option>
                      {presets.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                  </select>
                  {toast && (
                      <div className="absolute top-full mt-2 left-0 w-max bg-green-500/20 text-green-400 border border-green-500/50 px-3 py-1 text-xs font-mono uppercase rounded animate-in fade-in slide-in-from-top-2 z-50">
                          {toast}
                      </div>
                  )}
              </div>
          </div>
      </div>
      
      {activeTab === 'list' ? (
      <div className="space-y-6">
        {[...DATA.stages, 'HIDDEN'].map(stage => grouped[stage].length === 0 ? null : (
          <div key={stage}>
            <h3 className="text-lg text-[var(--paper)] font-serif mb-3 border-b border-[var(--line)] pb-2">{stage === 'HIDDEN' ? 'Hidden Campaigns' : DATA.stageLabels[stage]}</h3>
            <div className="space-y-1">
              {grouped[stage].map(code => {
                const meta = config.campaignMetadata[code] || { metrics: {} };
                return (
                  <div key={code} className="border border-[var(--line)] bg-[var(--ink-2)]">
                      <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center p-2">
                        <button onClick={() => toggleExpand(code)} className="text-[var(--muted)]">
                           {expanded[code] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        <div className="font-mono text-sm text-[var(--paper)]">{config.campaignMetadata[code]?.customName || DATA.nodes[code]}</div>
                        
                        <select 
                            value={config.campaignStages[code] || DATA.stages[0]}
                            onChange={(e) => setStage(code, e.target.value)}
                            className="bg-[var(--ink)] border border-[var(--line)] text-[var(--muted)] text-xs p-1"
                        >
                          {DATA.stages.map(s => <option key={s} value={s}>{DATA.stageLabels[s]}</option>)}
                        </select>

                        <select 
                            value={meta.plan || 'Leads'}
                            onChange={(e) => updateMetadata(code, { plan: e.target.value as 'Launch' | 'Plus' | 'Leads' | 'Launch & Plus' })}
                            className="bg-[var(--ink)] border border-[var(--line)] text-[var(--muted)] text-xs p-1"
                        >
                            <option value="Leads">Leads</option>
                            <option value="Launch">Launch</option>
                            <option value="Plus">Plus</option>
                            <option value="Launch & Plus">Launch & Plus</option>
                        </select>

                        <button 
                            onClick={() => toggleVisibility(code)}
                            className={`px-3 py-1 text-xs uppercase font-mono ${config.hiddenCampaigns[code] ? 'bg-red-900/50 text-red-200' : 'bg-green-900/50 text-green-200'}`}
                        >
                            {config.hiddenCampaigns[code] ? 'Hidden' : 'Visible'}
                        </button>
                      </div>

                      {expanded[code] && (
                          <div className="p-4 border-t border-[var(--line)] bg-[var(--ink)] space-y-4">
                              <input 
                                  placeholder="Campaign Code (Internal)" 
                                  value={code}
                                  onChange={(e) => { 
                                     // This needs a rename mechanism 
                                     console.log('Renaming requested, not implemented yet');
                                  }}
                                  className="w-full p-2 bg-[var(--ink-2)] border border-[var(--line)] text-[var(--paper)] font-mono text-sm"
                              />
                              <input 
                                  placeholder="Custom Name for View" 
                                  value={meta.customName || ''}
                                  onChange={(e) => updateMetadata(code, { customName: e.target.value })}
                                  className="w-full p-2 bg-[var(--ink-2)] border border-[var(--line)] text-[var(--paper)]"
                              />
                              <textarea 
                                  placeholder="Description for Colleagues"
                                  value={meta.description || ''}
                                  onChange={(e) => updateMetadata(code, { description: e.target.value })}
                                  className="w-full p-2 bg-[var(--ink-2)] border border-[var(--line)] text-[var(--paper)]"
                              />
                               <input 
                                  placeholder="Label (e.g. Partner)"
                                  value={meta.label || ''}
                                  onChange={(e) => updateMetadata(code, { label: e.target.value })}
                                  className="w-full p-2 bg-[var(--ink-2)] border border-[var(--line)] text-[var(--paper)]"
                              />
                              <div className="grid grid-cols-3 gap-2">
                                <input
                                    type="text"
                                    placeholder="Monthly Volume"
                                    value={meta.metrics?.volume || ''}
                                    onChange={(e) => updateMetadata(code, { metrics: { ...meta.metrics, volume: e.target.value } })}
                                    className="w-full p-2 bg-[var(--ink-2)] border border-[var(--line)] text-[var(--paper)]"
                                />
                                <input
                                    type="text"
                                    placeholder="Open Rate"
                                    value={meta.metrics?.openRate || ''}
                                    onChange={(e) => updateMetadata(code, { metrics: { ...meta.metrics, openRate: e.target.value } })}
                                    className="w-full p-2 bg-[var(--ink-2)] border border-[var(--line)] text-[var(--paper)]"
                                />
                                <input
                                    type="text"
                                    placeholder="Click Rate"
                                    value={meta.metrics?.clickRate || ''}
                                    onChange={(e) => updateMetadata(code, { metrics: { ...meta.metrics, clickRate: e.target.value } })}
                                    className="w-full p-2 bg-[var(--ink-2)] border border-[var(--line)] text-[var(--paper)]"
                                />
                              </div>
                              </div>
                      )}
                  </div>
                );
              })}
            </div>
          </div>
        )) }
      </div>
      ) : (
          <CampaignGraph config={config} onNodeClick={() => {}} setNodePosition={setNodePosition} addCampaign={addCampaign} updateCampaign={updateCampaign} addCustomEdge={addCustomEdge} removeCustomEdge={removeCustomEdge} setMetadata={setMetadata} setStage={setStage} />
      )}
    </div>
  );
}
