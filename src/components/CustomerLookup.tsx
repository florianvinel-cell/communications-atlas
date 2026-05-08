import React, { useState, useEffect } from 'react';
import { Search, Loader2, AlertCircle, Mail, Clock, Eye, AlertTriangle, LayoutTemplate, X } from 'lucide-react';

interface Delivery {
  id: string;
  subject: string;
  created: number;
  campaign_id: number;
  action_id?: number;
  newsletter_id?: number;
  metric: string;
  // Enriched data
  campaign_name?: string;
}

const BADGE_MAP: Record<string, { label: string, color: string, bg: string, border: string, tooltip: string }> = {
  'delivered': { label: 'Delivered', color: 'var(--green)', bg: 'color-mix(in srgb, var(--green) 10%, transparent)', border: 'color-mix(in srgb, var(--green) 30%, transparent)', tooltip: 'This email reached the inbox.' },
  'opened': { label: 'Opened', color: 'var(--green)', bg: 'color-mix(in srgb, var(--green) 10%, transparent)', border: 'color-mix(in srgb, var(--green) 30%, transparent)', tooltip: 'The customer opened this email.' },
  'clicked': { label: 'Clicked', color: 'var(--green)', bg: 'color-mix(in srgb, var(--green) 10%, transparent)', border: 'color-mix(in srgb, var(--green) 30%, transparent)', tooltip: 'The customer clicked a link in this email.' },
  'bounced': { label: 'Not sent · Bounce', color: 'var(--hot)', bg: 'color-mix(in srgb, var(--hot) 10%, transparent)', border: 'color-mix(in srgb, var(--hot) 30%, transparent)', tooltip: 'This customer\'s email address has previously bounced (the email server rejected a message). Customer.io automatically stops sending to bounced addresses to protect our sending reputation. To fix this, the bounce on their profile needs to be manually cleared.' },
  'dropped': { label: 'Not sent · Blocked', color: 'var(--accent)', bg: 'color-mix(in srgb, var(--accent) 10%, transparent)', border: 'color-mix(in srgb, var(--accent) 30%, transparent)', tooltip: 'Delivery dropped.' },
  'failed': { label: 'Failed', color: 'var(--hot)', bg: 'color-mix(in srgb, var(--hot) 10%, transparent)', border: 'color-mix(in srgb, var(--hot) 30%, transparent)', tooltip: 'Delivery failed. The email was not sent.' },
  'drafted': { label: 'Draft', color: 'var(--muted)', bg: 'color-mix(in srgb, var(--muted) 10%, transparent)', border: 'color-mix(in srgb, var(--muted) 30%, transparent)', tooltip: 'Queued but not yet sent.' },
  'unsubscribed': { label: 'Unsubscribed', color: 'var(--muted)', bg: 'color-mix(in srgb, var(--muted) 10%, transparent)', border: 'color-mix(in srgb, var(--muted) 30%, transparent)', tooltip: 'Customer has unsubscribed.' },
  'spammed': { label: 'Marked Spam', color: 'var(--hot)', bg: 'color-mix(in srgb, var(--hot) 10%, transparent)', border: 'color-mix(in srgb, var(--hot) 30%, transparent)', tooltip: 'Customer marked this as spam.' },
  'sent': { label: 'Sent', color: 'var(--cool)', bg: 'color-mix(in srgb, var(--cool) 10%, transparent)', border: 'color-mix(in srgb, var(--cool) 30%, transparent)', tooltip: 'The email was sent but not yet confirmed delivered.' },
};

function getBadgeProps(metric: string) {
  return BADGE_MAP[metric] || { label: metric, color: 'var(--muted)', bg: 'color-mix(in srgb, var(--muted) 10%, transparent)', border: 'color-mix(in srgb, var(--muted) 30%, transparent)', tooltip: '' };
}

export default function CustomerLookup() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [customerInfo, setCustomerInfo] = useState<{ id: string, email: string } | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [segmentMembers, setSegmentMembers] = useState<Array<{ id: string, email: string, plan: string }>>([]);
  const [segmentLoading, setSegmentLoading] = useState(true);
  const [segmentError, setSegmentError] = useState<string | null>(null);

  const fetchProxy = async (path: string) => {
    const res = await fetch(`/api/customer-lookup${path}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  };

  const fetchSegmentMembers = async () => {
    setSegmentLoading(true);
    setSegmentError(null);
    try {
      const res = await fetchProxy('/segment-latest/775');
      if (res.customers) setSegmentMembers(res.customers);
    } catch (err: any) {
       setSegmentError("Failed to fetch segment members.");
       console.error(err);
    } finally {
       setSegmentLoading(false);
    }
  };

  useEffect(() => {
    fetchSegmentMembers();
  }, []);

  const doSearch = async (searchEmail: string) => {
    if (!searchEmail) return;
    
    setEmail(searchEmail);
    setLoading(true);
    setError(null);
    setCustomerInfo(null);
    setDeliveries([]);

    try {
      // Step 1: Customer lookup
      const custResp = await fetchProxy(`/customers?email=${encodeURIComponent(searchEmail)}`);
      
      if (!custResp?.results?.length) {
        setError(`No customer found with email: ${searchEmail}`);
        setLoading(false);
        return;
      }
      
      const customer = custResp.results[0];
      const cioId = customer.id || customer.cio_id || customer.identifiers?.id || customer.identifiers?.cio_id;
      
      if (!cioId) {
        console.log("Customer response:", customer);
        setError(`Found customer but missing id for: ${searchEmail}`);
        setLoading(false);
        return;
      }
      
      setCustomerInfo({ id: cioId, email: searchEmail });

      // Step 2: Fetch deliveries
      const delivResp = await fetchProxy(`/messages?customer_id=${cioId}`);
      const rawMessages = delivResp.messages || delivResp.results || [];
      
      let fetchedDeliveries: Delivery[] = rawMessages
        .filter((d: any) => d.type === 'email')
        .map((d: any) => {
          const precedence = ['clicked', 'opened', 'bounced', 'spammed', 'unsubscribed', 'delivered', 'failed', 'dropped', 'sent', 'drafted'];
          let computedMetric = 'unknown';
          if (d.metrics) {
            for (const m of precedence) {
              if (d.metrics[m]) {
                computedMetric = m;
                break;
              }
            }
          }
          return {
            ...d,
            metric: computedMetric
          };
        });

      console.log("Deliveries fetched: ", fetchedDeliveries);
      
      // Step 4: Optional Enrichment (Campaign names)
      const campaignIds = Array.from(new Set(fetchedDeliveries.map(d => d.campaign_id).filter(Boolean)));
      if (campaignIds.length > 0) {
        try {
          // Fetch campaign names in parallel
          const campaignNames: Record<number, string> = {};
          await Promise.all(campaignIds.map(async (id) => {
            try {
              const camp = await fetchProxy(`/campaigns/${id}`);
              if (camp.campaign?.name) campaignNames[id] = camp.campaign.name;
            } catch (ignored) { }
          }));

          fetchedDeliveries = fetchedDeliveries.map(d => ({
            ...d,
            campaign_name: d.campaign_id ? campaignNames[d.campaign_id] : undefined
          }));
        } catch (ignored) {}
      }

      setDeliveries(fetchedDeliveries);
    } catch (err: any) {
      console.error(err);
      setError("Something went wrong — check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await doSearch(email);
  };

  const loadPreview = async (delivery: Delivery) => {
    setPreviewId(delivery.id);
    setPreviewContent(null);
    setPreviewLoading(true);

    try {
      // With App API we cannot fetch personalized delivery details, fetch campaign default template instead
      if (!delivery.campaign_id && !delivery.action_id) {
        setPreviewContent("<div style='color:#333; font-family:sans-serif; text-align:center; padding: 40px;'>No campaign associated with this message to fetch template.</div>");
        return;
      }
      
      let endpoint = `/campaign_template/${delivery.campaign_id}`;
      if (delivery.action_id) {
        endpoint += `?actionId=${delivery.action_id}`;
      }
      
      const resp = await fetchProxy(endpoint);
      if (resp.body) {
         setPreviewContent(resp.body);
      } else {
        setPreviewContent("<div style='color:#333; font-family:sans-serif; text-align:center; padding: 40px;'>No HTML template available.</div>");
      }
    } catch (err) {
      console.error(err);
      setPreviewContent("<div style='color:red; font-family:sans-serif; text-align:center; padding: 40px;'>Failed to load email preview template.</div>");
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    setPreviewId(null);
    setPreviewContent(null);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Search Bar */}
      <section className="bg-[var(--ink-2)] border border-[var(--line)] p-8 max-w-2xl mx-auto w-full">
        <div className="font-serif italic text-sm text-[var(--muted)] mb-2 text-center">
          Find exactly what we sent a customer
        </div>
        <h2 className="font-serif text-3xl text-[var(--paper)] text-center mb-6 tracking-tight">Customer Email Lookup</h2>
        
        <form onSubmit={handleSearch} className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]">
            <Search size={18} />
          </span>
          <input 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Search by email address..."
            className="w-full bg-[var(--ink)] border border-[var(--line)] text-[var(--text)] p-4 pl-12 pr-24 outline-none focus:border-[var(--accent)] font-mono text-[14px]"
            required
          />
          <button 
            type="submit" 
            disabled={loading}
            className="absolute right-2 top-2 bottom-2 px-6 font-mono text-xs uppercase bg-[var(--ink-3)] text-[var(--paper)] hover:bg-[var(--accent)] hover:text-[var(--ink)] disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
          </button>
        </form>
      </section>

      {/* Segment 775 Viewer */}
      <section className="bg-[var(--ink-2)] border border-[var(--line)] p-8 max-w-2xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-serif text-xl text-[var(--paper)]">5 most recent customers</h2>
          {segmentLoading && <Loader2 size={16} className="animate-spin text-[var(--muted)]" />}
        </div>
        
        {segmentError && (
          <div className="mb-4 border border-[var(--hot)]/50 bg-[var(--hot)]/10 text-[var(--hot)] p-4 font-mono text-xs flex items-center gap-3">
             <AlertCircle size={14} />
             {segmentError}
          </div>
        )}

        {segmentMembers.length > 0 && (
          <div className="space-y-3">
            {segmentMembers.map(member => (
              <div key={member.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center border border-[var(--line)] bg-[var(--ink)] p-4 gap-4 hover:border-[var(--muted-2)] transition-colors">
                <div>
                  <div className="font-mono text-sm text-[var(--paper)] mb-1">{member.email || '(No email)'}</div>
                  <div className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-wider">Plan: <span className="text-[var(--accent)]">{member.plan || '(None)'}</span></div>
                </div>
                <button
                  onClick={() => doSearch(member.email)}
                  disabled={loading || !member.email}
                  className="px-4 py-2 font-mono text-[10px] uppercase tracking-wider border border-[var(--line)] bg-[var(--ink-2)] text-[var(--paper)] hover:bg-[var(--accent)] hover:text-[var(--ink)] hover:border-[var(--accent)] disabled:opacity-50 transition-colors whitespace-nowrap self-start sm:self-auto flex items-center gap-2"
                >
                  <Search size={12} />
                  Search
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* States */}
      {error && (
        <div className="max-w-4xl mx-auto w-full border border-[var(--hot)]/50 bg-[var(--hot)]/10 text-[var(--hot)] p-6 font-mono text-sm flex items-center gap-3">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {customerInfo && deliveries.length === 0 && !loading && !error && (
        <div className="max-w-4xl mx-auto w-full border border-[var(--line)] bg-[var(--ink-2)] p-12 text-center font-serif text-lg text-[var(--muted)]">
          No emails sent to this customer yet.
        </div>
      )}

      {customerInfo && deliveries.length > 0 && !loading && (
        <div className="max-w-5xl mx-auto w-full space-y-4">
          <div className="font-mono text-[10px] tracking-widest text-[var(--muted)] uppercase mb-4 flex items-center justify-between">
            <span>Results for {customerInfo.email}</span>
            <span>Customer ID: {customerInfo.id}</span>
          </div>

          <div className="flex flex-col gap-3">
            {deliveries.map(d => {
              const { label, color, bg, border, tooltip } = getBadgeProps(d.metric);
              const date = new Date(d.created * 1000);
              
              return (
                <div key={d.id} className="bg-[var(--ink-2)] border border-[var(--line)] p-4 grid grid-cols-1 md:grid-cols-[200px_1fr_150px_auto] gap-4 items-center hover:border-[var(--muted-2)] transition-colors">
                  
                  <div className="font-mono text-xs text-[var(--muted)] flex items-center gap-2">
                    <Clock size={12} />
                    <div>
                      <div className="text-[var(--paper)]">{date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      <div className="text-[10px]">{date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="font-serif text-[18px] text-[var(--paper)] truncate font-medium mb-1" title={d.subject}>
                      {d.subject || '(No subject)'}
                    </div>
                    <div className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-wider flex items-center gap-1.5 truncate">
                      <LayoutTemplate size={10} />
                      {d.campaign_name || `Campaign ID: ${d.campaign_id}`}
                    </div>
                  </div>

                  <div>
                     <div 
                        className="inline-flex items-center justify-center border font-mono text-[10px] uppercase tracking-wide px-2 py-1 cursor-help"
                        style={{ color: color, backgroundColor: bg, borderColor: border }}
                        title={tooltip}
                      >
                        {label}
                     </div>
                  </div>

                  <div>
                    <button 
                      onClick={() => loadPreview(d)}
                      className="border border-[var(--line)] bg-[var(--ink)] text-[var(--paper)] font-mono text-[10px] uppercase px-3 py-2 flex items-center gap-1.5 hover:bg-[var(--accent)] hover:text-[var(--ink)] hover:border-[var(--accent)] transition-all whitespace-nowrap"
                    >
                       <Eye size={12} />
                       Preview
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
            <div className="fixed inset-0 bg-[var(--ink)]/90 backdrop-blur-sm" onClick={closePreview}></div>
            <div className="bg-white text-black w-full max-w-4xl h-[80vh] flex flex-col relative z-60 shadow-2xl border border-[var(--line)]">
               <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50 text-gray-800 font-mono text-sm">
                 <div className="flex items-center gap-2">
                    <Mail size={16} />
                    HTML Preview
                 </div>
                 <button onClick={closePreview} className="p-1 hover:bg-gray-200 rounded transition-colors">
                   <X size={18} />
                 </button>
               </div>
               
               <div className="flex-1 overflow-hidden relative bg-white flex flex-col">
                 <div className="bg-yellow-50 p-4 border-b border-yellow-200 text-sm text-yellow-800 font-serif">
                   This is the template as designed — variable fields like the customer's name will appear as placeholders since we can't retrieve the personalised version sent to this specific customer.
                 </div>
                 <div className="flex-1 relative">
                 {previewLoading ? (
                   <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 font-mono text-sm">
                      <Loader2 size={32} className="animate-spin mb-4" />
                      Loading rendered email...
                   </div>
                 ) : previewContent ? (
                   <iframe 
                     srcDoc={previewContent} 
                     className="w-full h-full border-none"
                     title="Email Preview"
                     sandbox="allow-same-origin"
                   />
                 ) : null}
                 </div>
               </div>
            </div>
        </div>
      )}
    </div>
  );
}
