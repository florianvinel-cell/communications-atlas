import { useState, useEffect, useCallback } from 'react';
import { DATA } from '../constants';
import { supabase } from '../lib/supabase';
import { initialCampaignMetadata } from '../campaignData';

export type CampaignMetadata = {
  customName?: string;
  description?: string;
  label?: string;
  metrics: {
    volume?: string;
    openRate?: string;
    clickRate?: string;
  };
  plan?: 'Launch' | 'Plus' | 'Leads' | 'Launch & Plus';
  flow?: any;
  cioId?: string;
  campaignId?: number;
};

export type AppConfig = {
  hiddenCampaigns: Record<string, boolean>;
  campaignStages: Record<string, string>;
  campaignMetadata: Record<string, CampaignMetadata>;
  nodePositions: Record<string, { x: number, y: number }>;
  activePlan: 'Leads' | 'Launch' | 'Plus';
  customNodes: Record<string, { label: string, type: 'campaign' | 'source' | 'milestone' }>;
  customEdges?: Array<{ id: string, source: string, target: string }>;
  campaignOrder?: string[];
};

export type SavedPreset = {
  id: string;
  name: string;
  config: AppConfig;
};

const DEFAULT_CONFIG: AppConfig = {
  hiddenCampaigns: {},
  campaignStages: Object.entries(DATA.groups).reduce((acc, [stage, codes]) => {
    codes.forEach(code => { acc[code] = stage; });
    return acc;
  }, {} as Record<string, string>),
  campaignMetadata: initialCampaignMetadata,
  nodePositions: {},
  activePlan: 'Leads',
  customNodes: {},
  customEdges: [],
};

export function useAppConfig() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [graphConfig, setGraphConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [presets, setPresets] = useState<SavedPreset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchConfig = useCallback(async () => {
      const { data, error } = await supabase.from('app_config').select('id,config').in('id', ['global', 'graph']);
      if (error) {
          console.error('Error fetching config:', error);
      }
      if (data) {
        const globalEntry = data.find(item => item.id === 'global');
        const graphEntry = data.find(item => item.id === 'graph');
        
        let initialConfig = DEFAULT_CONFIG;
        if (globalEntry) {
            initialConfig = { 
              ...DEFAULT_CONFIG, 
              ...globalEntry.config,
              campaignMetadata: {
                ...DEFAULT_CONFIG.campaignMetadata,
                ...(globalEntry.config.campaignMetadata || {})
              }
            };
            
            // Deep merge stats and campaignId from newly provided defaults
            for (const key of Object.keys(DEFAULT_CONFIG.campaignMetadata)) {
                if (initialConfig.campaignMetadata[key]) {
                   if (DEFAULT_CONFIG.campaignMetadata[key].campaignId) {
                      initialConfig.campaignMetadata[key].campaignId = DEFAULT_CONFIG.campaignMetadata[key].campaignId;
                   }
                   if (DEFAULT_CONFIG.campaignMetadata[key].metrics) {
                      initialConfig.campaignMetadata[key].metrics = {
                        ...initialConfig.campaignMetadata[key].metrics,
                        ...DEFAULT_CONFIG.campaignMetadata[key].metrics
                      };
                   }
                }
            }
        }
        
        setConfig(initialConfig);

        if (graphEntry) {
            setGraphConfig({ ...DEFAULT_CONFIG, ...graphEntry.config });
        } else {
            setGraphConfig(initialConfig);
        }
      }
      setLoading(false);
  }, []);

  const fetchPresets = useCallback(async () => {
      const { data, error } = await supabase.from('saved_config_states').select('*');
      if (data) {
        setPresets(data as SavedPreset[]);
      }
  }, []);

  useEffect(() => {
    fetchConfig();
    fetchPresets();
  }, [fetchConfig, fetchPresets]);

  const saveToSupabase = useCallback(async (updatedConfig: AppConfig) => {
        await supabase.from('app_config').upsert({ id: 'global', config: updatedConfig });
  }, []);

  const commitChanges = useCallback(async () => {
      await supabase.from('app_config').upsert({ id: 'graph', config: config });
      setGraphConfig(config);
  }, [config]);

  const savePreset = async (name: string) => {
      await supabase.from('saved_config_states').insert({ name, config });
      await fetchPresets();
  };

  const applyPreset = (preset: SavedPreset) => {
      setConfig(preset.config);
      saveToSupabase(preset.config);
  };


  const toggleVisibility = (code: string) => {
    setConfig(prev => {
        const next = {
          ...prev,
          hiddenCampaigns: {
            ...prev.hiddenCampaigns,
            [code]: !prev.hiddenCampaigns[code],
          },
        };
        saveToSupabase(next);
        return next;
    });
  };

  const setStage = (code: string, stage: string) => {
    setConfig(prev => {
        const next = {
          ...prev,
          campaignStages: {
            ...prev.campaignStages,
            [code]: stage,
          },
        };
        saveToSupabase(next);
        return next;
    });
  };

  const setMultipleMetadata = (updates: Record<string, CampaignMetadata>) => {
    setConfig(prev => {
        const next = {
          ...prev,
          campaignMetadata: {
            ...prev.campaignMetadata,
            ...updates,
          },
        };
        saveToSupabase(next);
        return next;
    });
  };

  const setMetadata = (code: string, metadata: CampaignMetadata) => {
    setConfig(prev => {
        const next = {
          ...prev,
          campaignMetadata: {
            ...prev.campaignMetadata,
            [code]: metadata,
          },
        };
        saveToSupabase(next);
        return next;
    });
  };

  const setActivePlan = (plan: 'Leads' | 'Launch' | 'Plus') => {
    setConfig(prev => {
        const next = {
          ...prev,
          activePlan: plan,
        };
        saveToSupabase(next);
        return next;
    });
  };
  
  const setNodePosition = (code: string, position: { x: number, y: number }) => {
    setConfig(prev => {
        const next = {
          ...prev,
          nodePositions: {
            ...prev.nodePositions,
            [code]: position,
          },
        };
        saveToSupabase(next);
        return next;
    });
  };

  const addCampaign = (code: string, label: string, type: 'campaign' | 'source' | 'milestone') => {
    setConfig(prev => {
      const next = {
        ...prev,
        customNodes: {
          ...prev.customNodes,
          [code]: { label, type },
        },
        campaignMetadata: {
          ...prev.campaignMetadata,
          [code]: { 
             plan: prev.activePlan, 
             metrics: {},
             customName: label 
          }
        }
      };
      saveToSupabase(next);
      return next;
    });
  };

  const updateCampaign = (code: string, label: string, type: 'campaign' | 'source' | 'milestone') => {
    setConfig(prev => {
      const next = {
        ...prev,
        customNodes: {
          ...prev.customNodes,
          [code]: { label, type },
        },
      };
      saveToSupabase(next);
      return next;
    });
  };

  const addCustomEdge = (edge: { id: string, source: string, target: string }) => {
    setConfig(prev => {
      const next = {
        ...prev,
        customEdges: [...(prev.customEdges || []), edge],
      };
      saveToSupabase(next);
      return next;
    });
  };

  const removeCustomEdge = (edgeId: string) => {
    setConfig(prev => {
      const next = {
        ...prev,
        customEdges: prev.customEdges?.filter(e => e.id !== edgeId),
      };
      saveToSupabase(next);
      return next;
    });
  };

  const reorderCampaign = (stage: string, code: string, direction: 'up' | 'down') => {
    setConfig(prev => {
      // Get current items in the stage ordered correctly
      const allCodes = Object.keys(DATA.nodes).filter(c => !DATA.stages.includes(c));
      const order = prev.campaignOrder || [];
      
      // Items in this stage
      let currentStageCodes = allCodes.filter(c => (prev.campaignStages[c] || DATA.stages[0]) === stage);
      
      // Sort them by current order
      currentStageCodes.sort((a, b) => {
          const idxA = order.indexOf(a);
          const idxB = order.indexOf(b);
          if (idxA !== -1 || idxB !== -1) {
              if (idxA === -1) return 1;
              if (idxB === -1) return -1;
              return idxA - idxB;
          }
          
          // Fallback logic as in App.tsx
          if (stage === 'ACQUISITION') {
              const volA = parseInt(String(prev.campaignMetadata[a]?.metrics?.volume || '0').replace(/[^\d]/g, ''), 10) || 0;
              const volB = parseInt(String(prev.campaignMetadata[b]?.metrics?.volume || '0').replace(/[^\d]/g, ''), 10) || 0;
              return volB - volA;
          } else if (stage === 'PREBUILD') {
              const defaultOrder = ['PAY', 'LAUNCHPATH', 'PCL580', 'PLUSPATH', 'PCP888', 'SF', 'TFC401', 'DLC402', 'DLC2991', 'SFC879', 'TFD403', 'BUILD', 'WBL287', 'NPS906'];
              const orderA = defaultOrder.indexOf(a);
              const orderB = defaultOrder.indexOf(b);
              if (orderA === -1 && orderB === -1) return 0;
              if (orderA === -1) return 1;
              if (orderB === -1) return -1;
              return orderA - orderB;
          } else if (stage === 'UPGRADES') {
              const defaultOrder = ['UPGRADE918', 'MTA250'];
              const orderA = defaultOrder.indexOf(a);
              const orderB = defaultOrder.indexOf(b);
              if (orderA === -1 && orderB === -1) return 0;
              if (orderA === -1) return 1;
              if (orderB === -1) return -1;
              return orderA - orderB;
          }
          return 0;
      });

      const currentIndex = currentStageCodes.indexOf(code);
      if (currentIndex === -1) return prev;
      if (direction === 'up' && currentIndex === 0) return prev;
      if (direction === 'down' && currentIndex === currentStageCodes.length - 1) return prev;

      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      const newStageCodes = [...currentStageCodes];
      const temp = newStageCodes[currentIndex];
      newStageCodes[currentIndex] = newStageCodes[targetIndex];
      newStageCodes[targetIndex] = temp;

      // Create new global order
      // We take existing order, remove items that are in current stage
      // and append the new customized order for this stage at the end or replace it in place
      
      // Easiest is to just rebuild a new global order array 
      // keeping things we aren't touching intact, but ordering the current stage properly
      const newGlobalOrder = allCodes.sort((a, b) => {
          const stageA = prev.campaignStages[a] || DATA.stages[0];
          const stageB = prev.campaignStages[b] || DATA.stages[0];
          
          if (stageA === stage && stageB === stage) {
              return newStageCodes.indexOf(a) - newStageCodes.indexOf(b);
          }
          if (stageA === stage) return order.includes(a) ? order.indexOf(a) : 9999;
          if (stageB === stage) return order.includes(b) ? order.indexOf(b) : 9999;
          
          const idxA = order.indexOf(a);
          const idxB = order.indexOf(b);
          if (idxA === -1 && idxB === -1) return 0;
          if (idxA === -1) return 1;
          if (idxB === -1) return -1;
          return idxA - idxB;
      });

      const next = { ...prev, campaignOrder: newGlobalOrder };
      saveToSupabase(next);
      return next;
    });
  };

  return { config, graphConfig, presets, savePreset, applyPreset, toggleVisibility, setStage, setMetadata, setMultipleMetadata, setActivePlan, setNodePosition, addCampaign, updateCampaign, addCustomEdge, removeCustomEdge, reorderCampaign, commitChanges, loading };
}
