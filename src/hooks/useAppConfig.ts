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
};

export type AppConfig = {
  hiddenCampaigns: Record<string, boolean>;
  campaignStages: Record<string, string>;
  campaignMetadata: Record<string, CampaignMetadata>;
  nodePositions: Record<string, { x: number, y: number }>;
  activePlan: 'Leads' | 'Launch' | 'Plus';
  customNodes: Record<string, { label: string, type: 'campaign' | 'source' | 'milestone' }>;
  customEdges?: Array<{ id: string, source: string, target: string }>;
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

  return { config, graphConfig, presets, savePreset, applyPreset, toggleVisibility, setStage, setMetadata, setActivePlan, setNodePosition, addCampaign, updateCampaign, addCustomEdge, removeCustomEdge, commitChanges, loading };
}
