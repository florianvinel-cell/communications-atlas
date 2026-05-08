import React, { useMemo, useCallback, useEffect } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Node, 
  Edge, 
  MarkerType,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { DATA, nodeTypes as nodeTypeDefinitions } from '../constants';
import { AppConfig, CampaignMetadata } from '../hooks/useAppConfig';

const nodeTypes = {};
const edgeTypes = {};

export default function CampaignGraph({ 
  onNodeClick,
  config,
  setNodePosition,
  addCampaign,
  updateCampaign,
  setMetadata,
  setStage,
  addCustomEdge,
  removeCustomEdge
}: { 
  onNodeClick: (code: string) => void,
  config: AppConfig,
  setNodePosition?: (code: string, position: { x: number, y: number }) => void,
  addCampaign?: (code: string, label: string, type: 'campaign' | 'source' | 'milestone') => void,
  updateCampaign?: (code: string, label: string, type: 'campaign' | 'source' | 'milestone') => void,
  setMetadata?: (code: string, metadata: CampaignMetadata) => void,
  setStage?: (code: string, stage: string) => void,
  addCustomEdge?: (edge: { id: string, source: string, target: string }) => void,
  removeCustomEdge?: (id: string) => void
}) {
  const { nodes, edges } = useMemo(() => {
    const nodesMap: Node[] = [];
    const edgesMap: Edge[] = [];
    
    // Combine DATA.nodes, config.customNodes, and config.campaignMetadata custom names
    const allNodes = { 
        ...DATA.nodes, 
        ...Object.entries(config.customNodes).reduce((acc, [code, val]) => { acc[code] = val.label; return acc; }, {} as Record<string, string>),
        ...Object.entries(config.campaignMetadata).reduce((acc, [code, val]) => { if (val.customName) acc[code] = val.customName; return acc; }, {} as Record<string, string>)
    };

    // Group campaigns by their current stage
    const stageGroups: Record<string, string[]> = {};
    DATA.stages.forEach(s => stageGroups[s] = []);
    
    Object.keys(allNodes).forEach(code => {
      if (DATA.stages.includes(code)) return; // skip if it's a stage node itself
      
      // Filter based on plan
      const plan = config.campaignMetadata[code]?.plan || 'Leads';
      if (config.activePlan === 'Leads') {
          if (plan !== 'Leads') return;
      } else if (config.activePlan === 'Launch') {
          if (plan !== 'Launch' && plan !== 'Launch & Plus') return;
      } else if (config.activePlan === 'Plus') {
          if (plan !== 'Plus' && plan !== 'Launch & Plus') return;
      }

      const stage = config.campaignStages[code] || DATA.stages[0];
      if (!stageGroups[stage]) return; // Fallback if stage not present
      
      if (!config.hiddenCampaigns[code]) {
        stageGroups[stage].push(code);
      }
    });

    // Create nodes
    DATA.stages.forEach((stage, stageIdx) => {
        stageGroups[stage].forEach((code, idx) => {
          const storedPos = config.nodePositions[code];
          const type = config.customNodes[code]?.type || nodeTypeDefinitions[code] || 'campaign';
          
          let style: React.CSSProperties = { 
            padding: '10px',
            fontSize: '11px',
            border: '1px solid var(--line)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            zIndex: 1
          };

          if (type === 'milestone') {
            style = { 
                ...style, 
                borderRadius: '50%', 
                background: 'var(--accent)', 
                color: 'var(--ink)', 
                width: 90, 
                height: 90,
                fontWeight: 'bold'
            };
          } else if (type === 'source') {
            style = { 
                ...style, 
                borderRadius: '20px', 
                background: 'var(--ink-3)', 
                color: 'var(--muted)', 
                borderColor: 'var(--muted)',
                width: 150
            };
          } else {
            style = { 
                ...style, 
                borderRadius: '4px', 
                background: 'var(--ink-2)', 
                color: 'var(--text)',
                width: 200
            };
          }

          nodesMap.push({
            id: code,
            data: { label: allNodes[code] || code, type },
            position: storedPos || { x: idx * 250, y: stageIdx * 150 },
            style,
          });
        });
    });

    // Only include edges where both source and target are visible
    DATA.edges.forEach(([source, target], idx) => {
      // Check if both exist in our nodesMap (because they might be hidden)
      const sourceNode = nodesMap.find(n => n.id === source);
      const targetNode = nodesMap.find(n => n.id === target);

      if (sourceNode && targetNode) {
        edgesMap.push({
            id: `e${idx}`,
            source,
            target,
            markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--muted)' },
            style: { stroke: 'var(--line)', strokeWidth: 2 },
        });
      }
    });

    if (config.customEdges) {
      config.customEdges.forEach((edge, idx) => {
        const sourceNode = nodesMap.find(n => n.id === edge.source);
        const targetNode = nodesMap.find(n => n.id === edge.target);

        if (sourceNode && targetNode) {
          edgesMap.push({
              id: edge.id || `custom-e${idx}`,
              source: edge.source,
              target: edge.target,
              markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--muted)' },
              style: { stroke: 'var(--line)', strokeWidth: 2 },
          });
        }
      });
    }

    return { nodes: nodesMap, edges: edgesMap };
  }, [config]);

  const [nodesState, setNodes, onNodesChange] = useNodesState(nodes);
  const [edgesState, setEdges, onEdgesChange] = useEdgesState(edges);
  const [editingNodeId, setEditingNodeId] = React.useState<string | null>(null);
  const [addingNode, setAddingNode] = React.useState<boolean>(false);

  const [formState, setFormState] = React.useState({
     code: '',
     label: '',
     type: 'campaign',
     stage: DATA.stages[0]
  });

  // Update reactflow state when memoized nodes/edges change
  useEffect(() => {
      setNodes(nodes);
      setEdges((prevEds) => {
          const newEdgeIds = new Set(edges.map(e => e.id));
          // keep previously existing edges that aren't part of the default config (meaning they were manually drawn)
          // also wait, let's just make sure we only preserve edges that look like manual ones or just any that aren't in newEdgeIds
          const customEdges = prevEds.filter(e => !newEdgeIds.has(e.id) && String(e.id).includes('reactflow__edge'));
          return [...edges, ...customEdges];
      });
  }, [nodes, edges, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Edge | Connection) => {
        const newEdgeId = `custom-${params.source}-${params.target}-${Date.now()}`;
        const enhancedParams = { ...params, id: newEdgeId };
        setEdges((eds) => addEdge(enhancedParams, eds));
        if (addCustomEdge && params.source && params.target) {
            addCustomEdge({
                id: newEdgeId,
                source: params.source,
                target: params.target
            });
        }
    },
    [setEdges, addCustomEdge]
  );

  const onEdgesDelete = useCallback(
    (edgesToRemove: Edge[]) => {
        if (removeCustomEdge) {
            edgesToRemove.forEach(edge => {
                removeCustomEdge(edge.id);
            });
        }
    },
    [removeCustomEdge]
  );

  const handleNodeClick = useCallback((_: any, node: Node) => {
    if (updateCampaign) {
        // Find existing data
        const customName = config.campaignMetadata[node.id]?.customName || config.customNodes[node.id]?.label || DATA.nodes[node.id] || node.id;
        const type = config.customNodes[node.id]?.type || nodeTypeDefinitions[node.id] || 'campaign';
        const stage = config.campaignStages[node.id] || DATA.stages[0];

        setFormState({
            code: node.id,
            label: customName,
            type: type,
            stage: stage
        });
        setEditingNodeId(node.id);
        setAddingNode(false);
    } else {
        onNodeClick(node.id);
    }
  }, [onNodeClick, updateCampaign, config.customNodes, config.campaignMetadata, config.campaignStages]);

  const onNodeDragStop = useCallback((_: any, node: Node) => {
      if (setNodePosition) {
          setNodePosition(node.id, node.position);
      }
  }, [setNodePosition]);

  const handleAddNodeClick = useCallback(() => {
    setFormState({
        code: `node-${Math.random().toString(36).substring(2, 8)}`,
        label: 'New Node',
        type: 'campaign',
        stage: DATA.stages[0]
    });
    setAddingNode(true);
    setEditingNodeId(null);
  }, []);

  const handleFormSave = () => {
      if (addingNode && addCampaign) {
          addCampaign(formState.code, formState.label, formState.type as any);
          if (setStage) {
              setStage(formState.code, formState.stage);
          }
      } else if (editingNodeId && updateCampaign && setMetadata) {
          updateCampaign(editingNodeId, formState.label, formState.type as any);
          
          const existingMeta = config.campaignMetadata[editingNodeId] || { metrics: {} };
          setMetadata(editingNodeId, { ...existingMeta, customName: formState.label });
          
          if (setStage) {
              setStage(editingNodeId, formState.stage);
          }
      }
      setAddingNode(false);
      setEditingNodeId(null);
  };

  return (
    <div style={{ height: '70vh', width: '100%', background: 'var(--ink)', position: 'relative' }}>
      {!!addCampaign && (
        <button 
          onClick={handleAddNodeClick} 
          style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }} 
          className="p-2 bg-[var(--accent)] text-[var(--ink)] text-xs font-mono uppercase hover:opacity-80 active:opacity-60 transition-opacity"
        >
            Add Node
        </button>
      )}

      {(addingNode || editingNodeId) && (
          <div style={{ position: 'absolute', top: 50, right: 10, width: 300, zIndex: 20 }} className="bg-[var(--ink-2)] border border-[var(--line)] shadow-lg p-4 flex flex-col gap-4">
              <h3 className="text-lg text-[var(--paper)] font-serif border-b border-[var(--line)] pb-2">
                  {addingNode ? 'Add New Node' : 'Edit Node'}
              </h3>
              
              <div className="flex flex-col gap-1">
                  <label className="text-[var(--muted)] text-xs font-mono uppercase">Code (ID)</label>
                  <input 
                      value={formState.code}
                      onChange={(e) => setFormState({...formState, code: e.target.value})}
                      disabled={!addingNode}
                      className="bg-[var(--ink)] border border-[var(--line)] text-[var(--paper)] p-2 text-sm font-mono"
                  />
              </div>

              <div className="flex flex-col gap-1">
                  <label className="text-[var(--muted)] text-xs font-mono uppercase">Label</label>
                  <input 
                      value={formState.label}
                      onChange={(e) => setFormState({...formState, label: e.target.value})}
                      className="bg-[var(--ink)] border border-[var(--line)] text-[var(--paper)] p-2 text-sm"
                  />
              </div>

              <div className="flex flex-col gap-1">
                  <label className="text-[var(--muted)] text-xs font-mono uppercase">Type</label>
                  <select 
                      value={formState.type}
                      onChange={(e) => setFormState({...formState, type: e.target.value})}
                      className="bg-[var(--ink)] border border-[var(--line)] text-[var(--paper)] p-2 text-sm"
                  >
                      <option value="campaign">Campaign (Rectangle)</option>
                      <option value="source">Source (Pill)</option>
                      <option value="milestone">Milestone (Circle)</option>
                  </select>
              </div>

              <div className="flex flex-col gap-1">
                  <label className="text-[var(--muted)] text-xs font-mono uppercase">Stage</label>
                  <select 
                      value={formState.stage}
                      onChange={(e) => setFormState({...formState, stage: e.target.value})}
                      className="bg-[var(--ink)] border border-[var(--line)] text-[var(--paper)] p-2 text-sm"
                  >
                      {DATA.stages.map(s => (
                          <option key={s} value={s}>{DATA.stageLabels[s] || s}</option>
                      ))}
                  </select>
              </div>

              <div className="flex gap-2 justify-end mt-2 border-t border-[var(--line)] pt-4">
                  <button onClick={() => { setAddingNode(false); setEditingNodeId(null); }} className="px-4 py-2 text-xs font-mono uppercase text-[var(--muted)] hover:text-[var(--paper)]">Cancel</button>
                  <button onClick={handleFormSave} className="px-4 py-2 text-xs font-mono uppercase bg-[var(--accent)] text-[var(--ink)]">Save</button>
              </div>
          </div>
      )}

      <ReactFlow
        nodes={nodesState}
        edges={edgesState}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onEdgesDelete={onEdgesDelete}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onNodeDragStop={onNodeDragStop}
        fitView
      >
        <Background color="var(--line)" gap={20} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
