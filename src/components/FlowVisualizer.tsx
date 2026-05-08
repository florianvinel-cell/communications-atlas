
import { useState, useEffect } from 'react';
import { campaignFlows } from '../flowData';
import { Clock, Mail, LogOut, Eye, X, Phone } from 'lucide-react';

export default function FlowVisualizer({ campaignCode, metrics, flow, onNavigate }: { campaignCode: string, metrics?: Record<string, string>, flow?: any, onNavigate: (code: string) => void }) {
  const campaignData = campaignFlows[campaignCode];
  console.log('FlowVisualizer campaignCode:', campaignCode, 'campaignData:', campaignData);
  const [steps, setSteps] = useState<any[]>(
      (campaignData && !campaignData.dynamic) ? campaignData.steps : (flow ? flow : [])
  );
  const [loading, setLoading] = useState(!flow && !!campaignData?.dynamic && !campaignData?.steps);
  const [preview, setPreview] = useState<any>(null);

  const branchMap: Record<string, string> = {
    'Launch Retention - Domain': 'LDO970',
    'Launch Retention - Email': 'LEI971',
    'Launch Retention - Stripe': 'LST972',
    'Launch Retention - PayPal': 'LPP973',
  };

  useEffect(() => {
    if (campaignData && !campaignData.dynamic) {
        setSteps(campaignData.steps);
        setLoading(false);
        return;
    }
    if (flow) {
        setSteps(flow);
        setLoading(false);
        return;
    }
    if (campaignData?.dynamic) {
      setLoading(true);
      console.log('Fetching actions for:', campaignData.campaignId);
      fetch(`/api/campaigns/${campaignData.campaignId}/actions`)
        .then(res => res.json())
        .then(data => {
           const actions = data.actions || [];
           console.log('Actions fetched:', actions);
           setSteps(actions.map((a: any, i: number) => ({
             type: 'email',
             title: a.subject,
             label: a.name,
             sublabel: a.preheader || '',
             campaignId: campaignData.campaignId,
             actionId: a.id
           })));
           setLoading(false);
        })
        .catch(err => {
          console.error('Fetch error:', err);
          setLoading(false);
        });
    }
  }, [campaignCode, campaignData]);

  if (loading) return <div className="text-[var(--muted)] font-mono text-xs">Loading flow...</div>;
  if (!steps) return <div className="text-[var(--muted)] font-mono text-xs">No flow visualization available for this campaign.</div>;

  const handleEmailClick = async (campaignId: string, actionId: string, title: string) => {
    try {
      const response = await fetch(`/api/email-preview/${campaignId}/${actionId}`);
      if (!response.ok) throw new Error('Failed to fetch preview');
      const data = await response.json();
      setPreview({ ...data, title });
    } catch (err) {
      console.error(err);
      alert('Failed to load email preview.');
    }
  };

  const metricLabels: Record<string, string> = {
      volume: 'Monthly Volume',
      openRate: 'Open Rate',
      clickRate: 'Click Rate',
  };

  return (
    <div className="flex flex-col items-center py-4 relative">
      {metrics && (
        <div className="w-full max-w-[600px] mb-12">
            <div className="grid grid-cols-3 gap-4 mb-4">
                {Object.entries(metrics).map(([key, value]) => (
                    <div key={key} className="bg-[var(--ink-3)] p-4 border border-[var(--line)]">
                        <div className="text-[var(--muted)] text-[10px] uppercase font-mono">{metricLabels[key] || key}</div>
                        <div className="text-[var(--paper)] text-2xl font-light">{value}</div>
                    </div>
                ))}
            </div>
            {campaignData && !campaignData.dynamic && (
                <div className="text-[var(--accent)] font-mono text-xs italic text-center w-full">
                    {campaignData.steps.filter((s:any) => s.type === 'email').length} emails sent over {
                        campaignData.steps.filter((s:any) => s.type === 'delay').reduce((acc: number, s: any) => {
                            if (s.duration.includes('day')) return acc + parseInt(s.duration);
                            if (s.duration.includes('hour')) return acc + (parseInt(s.duration) / 24);
                            return acc;
                        }, 0).toFixed(1)
                    } days
                </div>
            )}
        </div>
      )}
      
      {steps.length === 0 ? (
        <div className="text-[var(--muted)] font-mono text-md">No actions found for this campaign.</div>
      ) : (
        <div className="w-full max-w-[500px]">
          {steps.map((step: any, index: number) => {
            const actionIndex = steps.filter((s:any, i:number) => i <= index && (s.type === 'email' || s.type === 'sms')).length;
            return (
            <div key={index} className="flex flex-col">
              {step.type === 'email' && (
                <button 
                  onClick={() => handleEmailClick(step.campaignId, step.actionId, step.title)}
                  className="w-full bg-[var(--ink-2)] border border-[var(--line)] p-5 rounded-lg flex gap-5 items-center my-3 hover:border-[var(--accent)] transition-colors cursor-pointer text-left group"
                >
                    <div className="relative w-16 h-16 bg-[var(--ink-3)] flex items-center justify-center rounded-sm text-[var(--accent)]">
                      <Mail size={32} />
                      <div className="absolute -top-2 -left-2 w-6 h-6 bg-[var(--accent)] text-[var(--ink)] font-bold text-xs rounded-full flex items-center justify-center">
                          {actionIndex}
                      </div>
                    </div>
                    <div className="flex-1">
                        <div className="text-[var(--paper)] font-medium text-lg tracking-tight">{step.title}</div>
                        {step.sublabel && step.sublabel !== step.title && (
                            <div className="text-[var(--muted)] text-sm italic mt-1">{step.sublabel}</div>
                        )}
                        <div className="text-[var(--accent)] text-xs font-mono font-medium mt-2 flex items-center gap-1 opacity-70 group-hover:opacity-100 italic">
                          <Eye size={12} /> Click to view preview
                        </div>
                    </div>
                </button>
              )}
              
              {step.type === 'sms' && (
                <button 
                  onClick={() => handleEmailClick(step.campaignId, step.actionId, step.title)}
                  className="w-full bg-[var(--ink-2)] border border-[var(--line)] p-5 rounded-lg flex gap-5 items-center my-3 hover:border-[var(--accent)] transition-colors cursor-pointer text-left group"
                >
                    <div className="relative w-16 h-16 bg-[var(--ink-3)] flex items-center justify-center rounded-sm text-[var(--accent)]">
                      <Phone size={32} />
                      <div className="absolute -top-2 -left-2 w-6 h-6 bg-[var(--accent)] text-[var(--ink)] font-bold text-xs rounded-full flex items-center justify-center">
                          {actionIndex}
                      </div>
                    </div>
                    <div className="flex-1">
                        <div className="text-[var(--paper)] font-medium text-lg tracking-tight">{step.title.replace(/^SMS:\s*/, '')}</div>
                        <div className="text-[var(--accent)] text-xs font-mono font-medium mt-2 flex items-center gap-1 opacity-70 group-hover:opacity-100 italic">
                          <Eye size={12} /> Click to view preview
                        </div>
                    </div>
                </button>
              )}
              
              {step.type === 'exit' && (
                  <div className="text-[var(--muted)] flex items-center justify-center gap-2 py-4 font-mono text-xs my-2">
                      <LogOut size={16} /> End of flow
                  </div>
              )}

              {step.type === 'branch' && (
                  <button
                        onClick={() => onNavigate(branchMap[step.condition] || '')}
                        className="w-full bg-[var(--ink-2)] border-l-4 border-[var(--accent)] p-4 my-3 text-[var(--paper)] font-mono text-sm flex items-center gap-3 hover:bg-[var(--ink-3)] cursor-pointer text-left"
                  >
                       <div className="font-bold text-[var(--accent)]">Branch:</div> {step.condition}
                       <Eye size={14} className="ml-auto text-[var(--accent)]" />
                  </button>
              )}

              {step.type === 'delay' && steps[index + 1] && (
                  <div className="flex justify-center items-center py-2 text-[var(--muted)] font-mono text-xs gap-2">
                      <Clock size={14} /> Wait {step.duration}
                  </div>
              )}
            </div>
            );
          })}
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--ink)]/90 backdrop-blur-md">
            <div className="bg-[var(--ink)] border border-[var(--line)] w-full max-w-5xl h-[80vh] flex flex-col">
                <div className="p-4 border-b border-[var(--line)] flex justify-between items-center">
                    <div>
                        <div className="text-[var(--paper)] font-bold">{preview.subject}</div>
                        <div className="text-[var(--muted)] text-sm">{preview.preheader}</div>
                    </div>
                    <button className="text-[var(--muted)] hover:text-[var(--hot)]" onClick={() => setPreview(null)}><X /></button>
                </div>
                <iframe srcDoc={`<body style="background: white; color: black; padding: 20px;">${preview.body}</body>`} className="w-full flex-1" />
            </div>
        </div>
      )}
    </div>
  );
}
