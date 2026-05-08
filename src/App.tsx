/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { Sun, Moon, ChevronDown, TrendingUp, Eye, MousePointer, Award } from 'lucide-react';
import { DATA, upstream, downstream, nodeStage, totalCampaigns } from './constants';
import CampaignGraph from './components/CampaignGraph';
import { useAppConfig } from './hooks/useAppConfig';
import AdminView from './components/AdminView';
import FlowVisualizer from './components/FlowVisualizer';
import CustomerLookup from './components/CustomerLookup';

export default function App() {
  const { config, graphConfig, presets, savePreset, applyPreset, toggleVisibility, setStage, setMetadata, setActivePlan, setNodePosition, addCampaign, updateCampaign, addCustomEdge, removeCustomEdge, commitChanges, loading } = useAppConfig();
  const [search, setSearch] = useState('');
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'view' | 'admin'>('view');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeCampaign, setActiveCampaign] = useState<{code: string, name: string, stage: string} | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'graph' | 'lookup'>('list');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set(DATA.stages));

  const maxVolumeCode = useMemo(() => {
    let maxV = -1;
    let code = null;
    Object.keys(config.campaignMetadata).forEach(c => {
        const vStr = String(config.campaignMetadata[c]?.metrics?.volume || '');
        if (vStr) {
            const v = parseInt(vStr.replace(/[^\d]/g, ''), 10);
            if (!isNaN(v) && v > maxV) {
                maxV = v;
                code = c;
            }
        }
    });
    return code;
  }, [config.campaignMetadata]);

  const toggleStage = (sc: string) => {
    const next = new Set(expandedStages);
    if (next.has(sc)) next.delete(sc);
    else next.add(sc);
    setExpandedStages(next);
  };

  const filteredData = useMemo(() => {
    const q = search.toLowerCase();
    
    // Group campaigns according to config
    const groups: Record<string, string[]> = {};
    DATA.stages.forEach(s => groups[s] = []);
    
    Object.keys(DATA.nodes).filter(c => !DATA.stages.includes(c)).forEach(code => {
      const stage = config.campaignStages[code] || DATA.stages[0];
      
      // Filter based on plan
      const plan = config.campaignMetadata[code]?.plan || 'Leads';

      if (config.activePlan === 'Leads') {
          if (plan !== 'Leads') return;
      } else if (config.activePlan === 'Launch') {
          if (plan !== 'Launch' && plan !== 'Launch & Plus') return;
      } else if (config.activePlan === 'Plus') {
          if (plan !== 'Plus' && plan !== 'Launch & Plus') return;
      }
      
      if (!groups[stage]) groups[stage] = [];
      if (!config.hiddenCampaigns[code]) {
        groups[stage].push(code);
      }
    });

    // Logic to determine which campaigns/stages to show
    return DATA.stages.map(sc => {
      const items = (groups[sc] || []).filter(code => {
        const name = (config.campaignMetadata[code]?.customName || DATA.nodes[code] || "").toLowerCase();
        const matchesQ = !q || name.includes(q) || code.toLowerCase().includes(q);
        const matchesStage = !activeStage || sc === activeStage;
        return matchesQ && matchesStage;
      });

      if (sc === 'ACQUISITION') {
          items.sort((a, b) => {
              const volA = parseInt(String(config.campaignMetadata[a]?.metrics?.volume || '0').replace(/[^\d]/g, ''), 10) || 0;
              const volB = parseInt(String(config.campaignMetadata[b]?.metrics?.volume || '0').replace(/[^\d]/g, ''), 10) || 0;
              return volB - volA;
          });
      } else if (sc === 'PREBUILD') {
          const order = ['PAY', 'LAUNCHPATH', 'PCL580', 'PLUSPATH', 'PCP888', 'SF', 'TFC401', 'DLC402', 'DLC2991', 'SFC879', 'TFD403', 'BUILD', 'WBL287', 'NPS906'];
          items.sort((a, b) => {
              const orderA = order.indexOf(a);
              const orderB = order.indexOf(b);
              if (orderA === -1 && orderB === -1) return 0;
              if (orderA === -1) return 1;
              if (orderB === -1) return -1;
              return orderA - orderB;
          });
      } else if (sc === 'UPGRADES') {
          const order = ['UPGRADE918', 'MTA250'];
          items.sort((a, b) => {
              const orderA = order.indexOf(a);
              const orderB = order.indexOf(b);
              if (orderA === -1 && orderB === -1) return 0;
              if (orderA === -1) return 1;
              if (orderB === -1) return -1;
              return orderA - orderB;
          });
      }
      return { sc, items };
    }).filter(s => s.items.length > 0);
  }, [search, activeStage, config]);

  const totalVisible = filteredData.reduce((acc, s) => acc + s.items.length, 0);

  const openPanel = (code: string) => {
    // Only open if the node exists
    if (DATA.nodes[code]) {
      const meta = config.campaignMetadata[code];
      setActiveCampaign({
        code,
        name: meta?.customName || DATA.nodes[code],
        stage: config.campaignStages[code] || 'ACQUISITION'
      });
      setPanelOpen(true);
    }
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setPanelOpen(false); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  if (false && loading) {
    return <div className="p-8 font-mono text-[var(--muted)] text-sm">Initializing workspace...</div>;
  }

  return (
    <div className="wrap p-8 max-w-[1600px] mx-auto min-h-screen bg-[var(--ink)] text-[var(--text)]">
          <header className="border-b border-[var(--line)] pb-6 mb-8 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-end">
        <div className="title-block">
          <div className="font-mono text-[10px] tracking-[0.25em] text-[var(--accent)] mb-3 flex items-center gap-3 uppercase">
            <span className="w-6 h-[1px] bg-[var(--accent)] inline-block"></span> Customer.io · Communications Atlas
          </div>
          <h1 className="font-serif font-light text-5xl md:text-[52px] leading-none tracking-tighter text-[var(--paper)]">
            Every message, <em className="italic text-[var(--accent-2)] font-normal">mapped.</em>
          </h1>
          <div className="font-serif italic text-base text-[var(--muted)] mt-3">
            <p>The Communications Atlas is an internal tool that maps every automated communication UENI sends to its customers — from the moment someone sees an ad, all the way through purchase, onboarding, activation, and long-term retention.</p>
            <p className="mt-4">It visualises all campaigns as an interactive graph, where each node represents a flow and arrows show how customers move between them. Clicking any node opens a side panel showing the exact sequence of emails (and SMS) that flow sends — with subject lines, delays between messages, and a live preview of each email's design.</p>
            <p className="mt-4">The goal is simple: give anyone at UENI — product, sales, R&D, builders, success, growth AMs or leadership — a clear, always-up-to-date picture of what we're saying to our customers, when, and why.</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="flex gap-2">
            <button 
              className="p-2 border border-[var(--line)] text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button 
                className={`px-3 py-1 border border-[var(--line)] font-mono text-[10px] uppercase transition-colors ${activeTab === 'admin' ? 'bg-[var(--accent)] text-[var(--ink)]' : 'text-[var(--muted)]'}`}
                onClick={() => {
                    if (activeTab === 'admin') {
                        setActiveTab('view');
                        setIsAdmin(false);
                        setAdminPassword('');
                    } else {
                        setActiveTab('admin');
                    }
                }}
            >
              {activeTab === 'admin' ? 'View' : 'Admin'}
            </button>
          </div>
          
          <div className="text-right font-mono text-[10px] tracking-[0.15em] uppercase text-[var(--muted-2)]">
            <strong className="block text-3xl text-[var(--paper)] tracking-normal mb-1">{totalVisible}</strong>
            Active flows
          </div>
        </div>
      </header>
      
      {/* VIEW TOGGLE REMOVED - Admin is now in header */}
      <div className="flex flex-col gap-4 p-5 bg-[var(--ink-2)] border border-[var(--line)] shadow-sm mb-8 transition-all">
        {activeTab === 'view' && (
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex bg-[var(--ink)] border border-[var(--line)] p-1 shadow-inner">
                  <button className={`px-5 py-2 font-mono text-[11px] tracking-widest uppercase transition-colors ${viewMode === 'list' ? 'bg-[var(--accent)] text-[var(--ink)] font-medium shadow-sm' : 'text-[var(--muted)] hover:text-[var(--paper)] hover:bg-[var(--ink-3)]'}`} onClick={() => setViewMode('list')}>List</button>
                  <button className={`px-5 py-2 font-mono text-[11px] tracking-widest uppercase transition-colors ${viewMode === 'graph' ? 'bg-[var(--accent)] text-[var(--ink)] font-medium shadow-sm' : 'text-[var(--muted)] hover:text-[var(--paper)] hover:bg-[var(--ink-3)]'}`} onClick={() => setViewMode('graph')}>Graph</button>
                  <button className={`px-5 py-2 font-mono text-[11px] tracking-widest uppercase transition-colors ${viewMode === 'lookup' ? 'bg-[var(--accent)] text-[var(--ink)] font-medium shadow-sm' : 'text-[var(--muted)] hover:text-[var(--paper)] hover:bg-[var(--ink-3)]'}`} onClick={() => setViewMode('lookup')}>Lookup</button>
              </div>
              {viewMode !== 'lookup' && (
                <div className="flex bg-[var(--ink)] border border-[var(--line)] p-1 shadow-inner">                
                    {(['Leads', 'Launch', 'Plus'] as const).map(plan => (
                      <button 
                          key={plan}
                          className={`px-5 py-2 font-mono text-[11px] tracking-widest uppercase transition-colors ${config.activePlan === plan ? 'bg-[var(--accent)] text-[var(--ink)] font-medium shadow-sm' : 'text-[var(--muted)] hover:text-[var(--paper)] hover:bg-[var(--ink-3)]'}`} 
                          onClick={() => setActivePlan(plan)}
                      >
                        {plan}
                      </button>
                    ))}
                </div>
              )}
            </div>

            <div className="flex-1 max-w-2xl text-[14px] font-serif text-[var(--muted)] leading-relaxed xl:border-l border-[var(--line)] xl:pl-6">
              <p>
                <strong className="font-medium text-[var(--paper)] font-sans">List</strong> / <strong className="font-medium text-[var(--paper)] font-sans">Graph</strong>: explore our communications by stage. <strong className="font-medium text-[var(--paper)] font-sans">Lookup</strong>: view a specific user's email history.
              </p>
              {viewMode !== 'lookup' && (
                 <p className="mt-1">
                   <strong className="font-medium text-[var(--paper)] font-sans">Leads</strong>, <strong className="font-medium text-[var(--paper)] font-sans">Launch</strong>, and <strong className="font-medium text-[var(--paper)] font-sans">Plus</strong> filter which flows you see.
                 </p>
              )}
            </div>
          </div>
        )}

        {viewMode !== 'lookup' && activeTab === 'view' && (
          <div className="flex gap-6 font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--muted)] pt-3 mt-1 border-t border-[var(--line)]">
            <span><strong className="text-[var(--accent)] text-[12px] font-medium mr-2">{totalVisible}</strong>visible</span>
            <span><strong className="text-[var(--accent)] text-[12px] font-medium mr-2">{DATA.edges.length}</strong>connections</span>
          </div>
        )}
      </div>

      {activeTab === 'admin' ? (
        !isAdmin ? (
            <div className="p-20 text-center border border-[var(--line)] bg-[var(--ink-2)]">
                <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="bg-[var(--ink)] border border-[var(--line)] text-[var(--paper)] p-2 mb-4 w-64 block mx-auto" placeholder="Enter Admin Password" />
                <button onClick={() => { if(adminPassword === 'UENI2026') setIsAdmin(true); }} className="px-4 py-2 bg-[var(--accent)] text-[var(--ink)] font-mono uppercase">Login</button>
            </div>
        ) : (
            <AdminView config={config} presets={presets} savePreset={savePreset} applyPreset={applyPreset} toggleVisibility={toggleVisibility} setStage={setStage} setMetadata={setMetadata} setActivePlan={setActivePlan} setNodePosition={setNodePosition} addCampaign={addCampaign} updateCampaign={updateCampaign} addCustomEdge={addCustomEdge} removeCustomEdge={removeCustomEdge} />
        )
      ) : viewMode === 'graph' ? (
        <CampaignGraph config={config} onNodeClick={openPanel} />
      ) : viewMode === 'lookup' ? (
        <CustomerLookup />
      ) : (
        <>
            <div className="flex flex-col gap-6">
                {filteredData.map(({sc, items}, idx) => (
                <section key={sc} className="stage border border-[var(--line)] bg-gradient-to-b from-[var(--ink-3)]/40 to-[var(--ink-2)]/40" data-stage={sc}>
                    <div className="p-5 border-b border-[var(--line)] grid grid-cols-[auto_1fr_auto] gap-5 items-center cursor-pointer hover:bg-[var(--ink-3)]/50" onClick={() => toggleStage(sc)}>
                    <div className="font-serif italic text-sm min-w-16" style={{color: sc === 'CHURN' ? 'var(--hot)' : 'var(--muted-2)'}}>§ {String(idx).padStart(2, '0')}</div>
                    <div className="font-serif text-[22px] font-normal tracking-tighter text-[var(--paper)]">{DATA.stageLabels[sc]}</div>
                    <div className="flex items-center gap-4">
                        <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--muted)]">
                        <strong className="text-[var(--accent-2)] font-medium">{items.length}</strong> {items.length === 1 ? 'campaign' : 'campaigns'}
                        </div>
                        <ChevronDown className={`text-[var(--muted)] transition-transform ${expandedStages.has(sc) ? 'rotate-180' : ''}`} size={16} />
                    </div>
                </div>
                {expandedStages.has(sc) && (
                    items.length > 0 ? (
                        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {items.map(code => (
                            <div key={code} className="card bg-[var(--ink-2)] border border-[var(--line)] p-4 cursor-pointer relative transition-all duration-150 flex flex-col gap-2 hover:border-[var(--accent)] hover:bg-[var(--ink-3)] hover:-translate-y-[1px]" onClick={() => openPanel(code)}>
                            {config.campaignMetadata[code]?.label && (
                                <div className="font-mono text-[9px] tracking-[0.2em] text-[var(--accent)] uppercase">{config.campaignMetadata[code]?.label}</div>
                            )}
                            <div className="font-mono text-[13px] text-[var(--paper)] leading-[1.35]">
                              {config.campaignMetadata[code]?.customName || DATA.nodes[code]}
                            </div>
                            {config.campaignMetadata[code]?.description && (
                                <div className="font-serif italic text-xs text-[var(--muted)] leading-[1.4] line-clamp-2">
                                    {config.campaignMetadata[code]?.description}
                                </div>
                            )}
                            
                            {(config.campaignMetadata[code]?.metrics?.volume || config.campaignMetadata[code]?.metrics?.openRate || config.campaignMetadata[code]?.metrics?.clickRate) && (
                              <div className="flex flex-col gap-1 font-mono text-[10px] text-[var(--paper)] tracking-[0.05em] mt-3">
                                {config.campaignMetadata[code]?.metrics?.volume && (
                                    <div className="flex items-center gap-2">
                                        <TrendingUp size={12} className="text-[var(--accent)]"/>
                                        <span className="text-[var(--muted)]">Monthly Volume:</span> {config.campaignMetadata[code]?.metrics?.volume}
                                    </div>
                                )}
                                {config.campaignMetadata[code]?.metrics?.openRate && (
                                    <div className="flex items-center gap-2">
                                        <Eye size={12} className="text-[var(--accent)]"/>
                                        <span className="text-[var(--muted)]">Open:</span> {config.campaignMetadata[code]?.metrics?.openRate}
                                    </div>
                                )}
                                {config.campaignMetadata[code]?.metrics?.clickRate && (
                                    <div className="flex items-center gap-2">
                                        <MousePointer size={12} className="text-[var(--accent)]"/>
                                        <span className="text-[var(--muted)]">Click:</span> {config.campaignMetadata[code]?.metrics?.clickRate}
                                    </div>
                                )}
                              </div>
                            )}
                            {maxVolumeCode === code && (
                                <div className="absolute top-2 right-2 flex items-center gap-1 bg-[var(--accent)]/10 text-[var(--accent)] px-1.5 py-0.5 rounded text-[9px] font-mono uppercase">
                                    <Award size={10} /> Top
                                </div>
                            )}
                            </div>
                        ))}
                        </div>
                    ) : null
                    )}
                </section>
                ))}
            </div>

            {totalVisible === 0 && <div className="text-center py-20 text-[var(--muted)] font-serif italic text-lg">No campaigns match that search or stage filter.</div>}
            </>
      )}

      <div className="mt-12 pt-8 border-t border-[#243556] flex gap-8 flex-wrap font-mono text-[10px] tracking-[0.15em] uppercase text-[#7d8aa3]">
        <div className="flex items-center gap-2"><span className="w-3 h-3 border border-[#e9b949] bg-[#e9b949]/10"></span>Selected</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 border border-[#6ec3c9]"></span>Feeds into selected</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 border border-[#a3c98f]"></span>Triggered by selected</div>
      </div>

      <footer className="mt-12 pt-6 border-t border-[#243556] font-serif italic text-[13px] text-[#5a6781] flex justify-between">
        <div>Reconstructed from your Customer.io flowchart export.</div>
        <div className="text-[#e9b949] font-mono not-italic tracking-[0.2em] text-[10px]">v.01 · 2026</div>
      </footer>

      {panelOpen && activeCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-[var(--ink)]/80 backdrop-blur-sm" onClick={() => setPanelOpen(false)}></div>
            <div className="bg-[var(--ink)] border border-[var(--line)] w-full max-w-4xl max-h-[90vh] overflow-y-auto z-60 p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--accent)] mb-2">{DATA.stageLabels[activeCampaign.stage] || '—'}</div>
                        <div className="font-serif text-4xl text-[var(--paper)] tracking-tighter">{activeCampaign.name}</div>
                        {config.campaignMetadata[activeCampaign.code]?.description && (
                          <div className="font-serif italic text-base text-[var(--muted)] mt-2 leading-[1.5]">
                            {config.campaignMetadata[activeCampaign.code]?.description}
                          </div>
                        )}
                    </div>
                    <button className="border border-[var(--line)] text-[var(--muted)] w-8 h-8 cursor-pointer text-base hover:border-[var(--hot)] hover:text-[var(--hot)]" onClick={() => setPanelOpen(false)}>×</button>
                </div>
                {/* Metrics + Flow */}
                <FlowVisualizer campaignCode={activeCampaign.code} metrics={config.campaignMetadata[activeCampaign.code]?.metrics} flow={config.campaignMetadata[activeCampaign.code]?.flow} onNavigate={openPanel} />
            </div>
        </div>
      )}
    </div>
  );
}
