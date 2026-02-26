'use client';

import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { Copy, Check, X, ZoomIn, ZoomOut, Maximize2, ArrowRight, ArrowLeft, ChevronRight, ExternalLink } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   FLOW DATA
   ═══════════════════════════════════════════════════════════════ */

type NodeType = 'prompt' | 'data-source' | 'output' | 'manual';

type FlowNode = {
  id: string;
  label: string;
  subtitle: string;
  type: NodeType;
  column: number; // 0=public, 1=internal, 2=action
  row: number;
  color: string;
  bg: string;
  border: string;
  description: string;
  next: string[];
  manualInput?: boolean;
};

const NODE_W = 220;
const NODE_H = 80;
const COL_W = 320;
const ROW_H = 130;
const PAD_X = 80;
const PAD_Y = 120;

const columnHeaders = [
  { label: '🌐 Customer Landscape — Public Data', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
  { label: '🔒 Ivanti Landscape — Internal Data', color: '#06b6d4', bg: '#ecfeff', border: '#a5f3fc' },
  { label: '⚡ Action Item Prompts', color: '#7c3aed', bg: '#faf5ff', border: '#ddd6fe' },
];

const nodes: FlowNode[] = [
  { id: 'p1', label: '1. Market Research', subtitle: 'Company, financials, leadership', type: 'prompt', column: 0, row: 0, color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', description: 'Research the customer: company overview, revenue, leadership, competitors, recent news. Uses public data only — just need the company name.', next: ['p2'] },
  { id: 'p2', label: '2. Vertical & Trends', subtitle: 'Industry challenges, IT trends', type: 'prompt', column: 0, row: 1, color: '#ea580c', bg: '#fff7ed', border: '#fed7aa', description: 'Industry-specific IT challenges, regulatory pressures (HIPAA, SOX, etc.), digital transformation trends, and common maturity gaps for their vertical.', next: ['p3'] },
  { id: 'sf1', label: '⚠️ Salesforce Pull', subtitle: 'Account data required', type: 'manual', column: 0, row: 2.5, color: '#d97706', bg: '#fffbeb', border: '#fde68a', description: 'Manual step: pull products licensed, seat count, renewal dates, open opportunities, and adoption status from Salesforce.', next: ['p3'] },
  { id: 'p3', label: '3. Existing Ivanti Solutions', subtitle: 'Current customer footprint', type: 'prompt', column: 0, row: 3, color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', description: 'Summarize which Ivanti products are active vs underutilized, upcoming renewal risks, and gaps relative to the full portfolio. Requires Salesforce data.', manualInput: true, next: ['p4', 'p5'] },
  { id: 'sf2', label: '⚠️ Customer 360 Pull', subtitle: 'Tenant data required', type: 'manual', column: 1, row: 0, color: '#d97706', bg: '#fffbeb', border: '#fde68a', description: 'Manual step: pull tenant data (active modules, user count, adoption %), renewals, open opportunities, and CSM health score.', next: ['p4'] },
  { id: 'p4', label: '4. Tenant & Renewal Data', subtitle: '360 + Salesforce intelligence', type: 'prompt', column: 1, row: 1, color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc', description: 'Analyze account health, adoption gaps, churn signals, and expansion readiness from internal tenant data and Salesforce renewals.', manualInput: true, next: ['p5', 'renew'] },
  { id: 'renew', label: '📊 Renewals & Opps', subtitle: 'Timing + risk signals', type: 'data-source', column: 1, row: 2, color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd', description: 'Renewal dates, ARR, risk levels, and open opportunity stages — used to inform urgency of cross-sell recommendations.', next: ['p5'] },
  { id: 'p5', label: '5. Cross-Sell / Up-Sell', subtitle: 'Opportunities + talk tracks', type: 'prompt', column: 2, row: 0.5, color: '#7c3aed', bg: '#faf5ff', border: '#ddd6fe', description: 'Top 3-5 cross-sell/up-sell opportunities with business justification, urgency level, and a 2-sentence talk track per recommendation.', next: ['p6'] },
  { id: 'p6', label: '6. Executive Readout', subtitle: 'Presentation-ready slides', type: 'prompt', column: 2, row: 1.5, color: '#e11d48', bg: '#fff1f2', border: '#fecdd3', description: 'Generate slide-ready content: customer overview, strategic objectives, Crawl/Walk/Run roadmap, value hypotheses, and next steps.', next: ['revenue'] },
  { id: 'revenue', label: '💰 Revenue', subtitle: 'Commercial outcome', type: 'output', column: 2, row: 2.5, color: '#059669', bg: '#ecfdf5', border: '#6ee7b7', description: 'The ultimate goal: cross-sell pipeline, renewal protection, and executive buy-in leading to commercial deals.', next: [] },
];

// Extra cross-connections (dashed)
const crossLinks: { from: string; to: string; label?: string }[] = [
  { from: 'p1', to: 'p5', label: 'company context' },
  { from: 'p2', to: 'p5', label: 'vertical challenges' },
  { from: 'p1', to: 'p6', label: 'overview' },
  { from: 'p2', to: 'p6', label: 'trends' },
  { from: 'p3', to: 'p6', label: 'stack' },
  { from: 'p4', to: 'p6', label: 'health' },
];

function getPos(node: FlowNode) {
  return {
    x: PAD_X + node.column * COL_W + (COL_W - NODE_W) / 2,
    y: PAD_Y + node.row * ROW_H,
  };
}

const totalW = PAD_X * 2 + 3 * COL_W;
const totalH = PAD_Y + 4 * ROW_H + 40;

/* ═══════════════════════════════════════════════════════════════
   DETAIL SIDEBAR
   ═══════════════════════════════════════════════════════════════ */

function DetailSidebar({ node, onSelectNode, onClose }: {
  node: FlowNode; onSelectNode: (id: string) => void; onClose: () => void;
}) {
  const targets = node.next.map(id => nodes.find(n => n.id === id)).filter(Boolean) as FlowNode[];
  const sources = nodes.filter(n => n.next.includes(node.id));
  const fromCross = crossLinks.filter(c => c.to === node.id).map(c => ({ ...c, node: nodes.find(n => n.id === c.from)! })).filter(c => c.node);
  const toCross = crossLinks.filter(c => c.from === node.id).map(c => ({ ...c, node: nodes.find(n => n.id === c.to)! })).filter(c => c.node);

  return (
    <div className="w-[380px] flex-shrink-0 bg-white border-l border-gray-200 overflow-y-auto shadow-lg">
      <div className="sticky top-0 bg-white border-b border-gray-100 p-5 z-10">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{node.label}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{node.subtitle}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
        </div>
      </div>
      <div className="p-5 space-y-5">
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
          <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</h4>
          <p className="text-sm text-gray-700 leading-relaxed">{node.description}</p>
        </div>

        {node.manualInput && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs text-amber-700 font-medium">⚠️ Requires manual data input from Salesforce / Customer 360 before running this prompt.</p>
          </div>
        )}

        {/* Direct connections */}
        {sources.length > 0 && (
          <div>
            <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1"><ArrowLeft size={10} /> Direct Input From ({sources.length})</h4>
            <div className="space-y-1.5">
              {sources.map(s => (
                <button key={s.id} onClick={() => onSelectNode(s.id)} className="w-full text-left bg-gray-50 hover:bg-gray-100 border border-gray-100 hover:border-gray-300 rounded-lg p-3 transition-all group">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{s.label}</span>
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500" />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">{s.subtitle}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Cross-connections in */}
        {fromCross.length > 0 && (
          <div>
            <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">🔗 Also Feeds From</h4>
            <div className="space-y-1.5">
              {fromCross.map(c => (
                <button key={c.from} onClick={() => onSelectNode(c.from)} className="w-full text-left bg-purple-50/50 hover:bg-purple-50 border border-purple-100 hover:border-purple-300 rounded-lg p-3 transition-all group">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{c.node.label}</span>
                    <ChevronRight size={14} className="text-gray-300" />
                  </div>
                  {c.label && <p className="text-[10px] text-purple-500 mt-0.5">provides: {c.label}</p>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Direct outputs */}
        {targets.length > 0 && (
          <div>
            <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1"><ArrowRight size={10} /> Goes To ({targets.length})</h4>
            <div className="space-y-1.5">
              {targets.map(t => (
                <button key={t.id} onClick={() => onSelectNode(t.id)} className="w-full text-left bg-gray-50 hover:bg-gray-100 border border-gray-100 hover:border-gray-300 rounded-lg p-3 transition-all group">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{t.label}</span>
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500" />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">{t.subtitle}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Cross-connections out */}
        {toCross.length > 0 && (
          <div>
            <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">🔗 Also Feeds Into</h4>
            <div className="space-y-1.5">
              {toCross.map(c => (
                <button key={c.to} onClick={() => onSelectNode(c.to)} className="w-full text-left bg-purple-50/50 hover:bg-purple-50 border border-purple-100 hover:border-purple-300 rounded-lg p-3 transition-all group">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{c.node.label}</span>
                    <ChevronRight size={14} className="text-gray-300" />
                  </div>
                  {c.label && <p className="text-[10px] text-purple-500 mt-0.5">sends: {c.label}</p>}
                </button>
              ))}
            </div>
          </div>
        )}

        {node.type === 'output' && (
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
            <span className="text-3xl">💰</span>
            <p className="text-sm font-semibold text-green-700 mt-2">Pipeline Outcome</p>
            <p className="text-xs text-green-600 mt-1">Cross-sell pipeline, renewal protection, and executive buy-in.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FULLSCREEN MAP
   ═══════════════════════════════════════════════════════════════ */

export default function FullscreenPromptMap() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0.85);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panOrigin, setPanOrigin] = useState({ x: 0, y: 0 });
  const [showMermaid, setShowMermaid] = useState(false);
  const [mermaidCopied, setMermaidCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeNodeId = selectedNodeId || hoveredNode;

  const connectedSet = useMemo(() => {
    if (!activeNodeId) return new Set<string>();
    const set = new Set<string>();
    set.add(activeNodeId);
    // Forward
    const queue = [activeNodeId];
    const visited = new Set<string>();
    while (queue.length) {
      const id = queue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);
      const n = nodes.find(n => n.id === id);
      if (n) n.next.forEach(nid => { set.add(nid); queue.push(nid); });
    }
    // Backward
    nodes.forEach(n => { if (n.next.includes(activeNodeId)) set.add(n.id); });
    // Cross-links
    crossLinks.forEach(c => {
      if (c.from === activeNodeId) set.add(c.to);
      if (c.to === activeNodeId) set.add(c.from);
    });
    return set;
  }, [activeNodeId]);

  // Mouse wheel zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      setZoom(z => Math.min(Math.max(z + (e.deltaY > 0 ? -0.05 : 0.05), 0.3), 2.0));
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
    setPanOrigin({ ...pan });
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({ x: panOrigin.x + (e.clientX - panStart.x), y: panOrigin.y + (e.clientY - panStart.y) });
  }, [isPanning, panStart, panOrigin]);

  const handleMouseUp = useCallback(() => { setIsPanning(false); }, []);

  const selectedNode = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) || null : null;

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Toolbar */}
      <div className="flex-shrink-0 h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-3">
          <a href="/" className="text-xs text-gray-400 hover:text-purple-600 flex items-center gap-1">
            <ArrowLeft size={14} /> Back to Toolkit
          </a>
          <div className="w-px h-5 bg-gray-200" />
          <h1 className="text-sm font-bold text-gray-800">🔗 Prompt Chain — Flow Map</h1>
          <span className="text-[10px] text-gray-400">{nodes.length} nodes · 6 prompts · 3 data columns</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.3))} className="p-1.5 bg-gray-100 rounded hover:bg-gray-200"><ZoomIn size={14} className="text-gray-500 rotate-180" /></button>
          <span className="text-[10px] text-gray-400 w-10 text-center font-mono">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(z + 0.1, 2.0))} className="p-1.5 bg-gray-100 rounded hover:bg-gray-200"><ZoomIn size={14} className="text-gray-500" /></button>
          <button onClick={() => { setPan({ x: 0, y: 0 }); setZoom(0.85); }} className="p-1.5 bg-gray-100 rounded hover:bg-gray-200 text-[10px] text-gray-500 font-medium px-2">Reset</button>
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <button onClick={() => setShowMermaid(true)} className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-50 border border-purple-200 rounded hover:bg-purple-100 text-[10px] text-purple-700 font-medium">
            📋 Copy for Lucidchart
          </button>
        </div>
      </div>

      {/* Canvas + Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        <div ref={containerRef} className="flex-1 overflow-hidden bg-[#fafbfc] relative"
          style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
          onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>

          {/* Grid */}
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
            backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
            backgroundPosition: `${pan.x % (20 * zoom)}px ${pan.y % (20 * zoom)}px`,
          }} />

          <svg className="absolute top-0 left-0 select-none" width="100%" height="100%" style={{ overflow: 'visible' }}>
            <defs>
              <marker id="arr" viewBox="0 0 10 8" refX="10" refY="4" markerWidth="8" markerHeight="6" orient="auto">
                <path d="M0 0 L10 4 L0 8 Z" fill="#94a3b8" />
              </marker>
              <marker id="arr-hl" viewBox="0 0 10 8" refX="10" refY="4" markerWidth="8" markerHeight="6" orient="auto">
                <path d="M0 0 L10 4 L0 8 Z" fill="#7c3aed" />
              </marker>
            </defs>

            <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
              {/* Column backgrounds */}
              {columnHeaders.map((col, i) => (
                <g key={i}>
                  <rect x={PAD_X + i * COL_W - 10} y={10} width={COL_W - 10} height={totalH - 30} rx={12} fill={col.bg} stroke={col.border} strokeWidth={1} opacity={0.5} />
                  <text x={PAD_X + i * COL_W + COL_W / 2 - 15} y={40} fill={col.color} fontSize={13} fontWeight="bold" textAnchor="middle" fontFamily="system-ui">{col.label}</text>
                </g>
              ))}

              {/* Direct edges */}
              {nodes.flatMap(n => n.next.map(toId => {
                const to = nodes.find(nn => nn.id === toId);
                if (!to) return null;
                const fp = getPos(n);
                const tp = getPos(to);
                const isHl = activeNodeId && connectedSet.has(n.id) && connectedSet.has(toId);
                const isDim = activeNodeId && !isHl;

                const x1 = fp.x + NODE_W, y1 = fp.y + NODE_H / 2;
                const x2 = tp.x, y2 = tp.y + NODE_H / 2;
                const dx = x2 - x1;
                const path = `M${x1},${y1} C${x1 + dx * 0.4},${y1} ${x2 - dx * 0.4},${y2} ${x2},${y2}`;

                return <path key={`${n.id}-${toId}`} d={path} fill="none"
                  stroke={isHl ? '#7c3aed' : '#cbd5e1'} strokeWidth={isHl ? 2.5 : 1.5}
                  opacity={isDim ? 0.1 : isHl ? 1 : 0.4}
                  markerEnd={isHl ? 'url(#arr-hl)' : 'url(#arr)'} />;
              }))}

              {/* Cross-links (dashed) */}
              {crossLinks.map((c, idx) => {
                const from = nodes.find(n => n.id === c.from);
                const to = nodes.find(n => n.id === c.to);
                if (!from || !to) return null;
                const fp = getPos(from);
                const tp = getPos(to);
                const isHl = activeNodeId && connectedSet.has(c.from) && connectedSet.has(c.to);
                const isDim = activeNodeId && !isHl;

                const x1 = fp.x + NODE_W, y1 = fp.y + NODE_H / 2;
                const x2 = tp.x, y2 = tp.y + NODE_H / 2;
                const dx = x2 - x1;
                const path = `M${x1},${y1} C${x1 + dx * 0.4},${y1} ${x2 - dx * 0.4},${y2} ${x2},${y2}`;

                return <path key={`cross-${idx}`} d={path} fill="none"
                  stroke={isHl ? '#a78bfa' : '#d1d5db'} strokeWidth={isHl ? 2 : 1}
                  strokeDasharray="6,4"
                  opacity={isDim ? 0.05 : isHl ? 0.8 : 0.25}
                  markerEnd={isHl ? 'url(#arr-hl)' : 'url(#arr)'} />;
              })}

              {/* Nodes */}
              {nodes.map(node => {
                const pos = getPos(node);
                const isSelected = selectedNodeId === node.id;
                const isHov = hoveredNode === node.id;
                const isConn = connectedSet.has(node.id);
                const isDim = activeNodeId && !isSelected && !isHov && !isConn;

                return (
                  <g key={node.id} transform={`translate(${pos.x},${pos.y})`}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={(e) => { e.stopPropagation(); setSelectedNodeId(prev => prev === node.id ? null : node.id); }}
                    style={{ cursor: 'pointer', opacity: isDim ? 0.1 : 1, transition: 'opacity 0.15s' }}>

                    {isSelected && <rect x={-4} y={-4} width={NODE_W + 8} height={NODE_H + 8} rx={16} fill="none" stroke="#7c3aed" strokeWidth={3} />}
                    {isHov && !isSelected && <rect x={-2} y={-2} width={NODE_W + 4} height={NODE_H + 4} rx={14} fill="none" stroke={node.border} strokeWidth={2} opacity={0.6} />}

                    <rect width={NODE_W} height={NODE_H}
                      rx={node.type === 'output' ? NODE_H / 2 : node.type === 'manual' ? 6 : 12}
                      fill={node.bg} stroke={isSelected ? '#7c3aed' : node.border}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      strokeDasharray={node.type === 'manual' ? '5,3' : 'none'} />

                    <text x={NODE_W / 2} y={NODE_H / 2 - 8} fill={isSelected ? '#7c3aed' : node.color}
                      fontSize={13} fontWeight="bold" textAnchor="middle" fontFamily="system-ui">{node.label}</text>
                    <text x={NODE_W / 2} y={NODE_H / 2 + 12} fill="#94a3b8"
                      fontSize={10} textAnchor="middle" fontFamily="system-ui">{node.subtitle}</text>

                    {node.manualInput && (
                      <g transform={`translate(${NODE_W - 20}, 4)`}>
                        <rect width={18} height={16} rx={4} fill="#fef3c7" />
                        <text x={9} y={12} fontSize={9} fill="#d97706" textAnchor="middle" fontFamily="system-ui">⚠️</text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>

          {!selectedNodeId && (
            <div className="absolute bottom-4 right-4 bg-white/90 border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
              <p className="text-[10px] text-gray-400">
                <span className="font-medium text-gray-500">Scroll</span> to zoom · <span className="font-medium text-gray-500">Drag</span> to pan · <span className="font-medium text-gray-500">Click</span> any node to inspect
              </p>
            </div>
          )}
        </div>

        {selectedNode && (
          <DetailSidebar node={selectedNode} onSelectNode={(id) => setSelectedNodeId(id)} onClose={() => setSelectedNodeId(null)} />
        )}
      </div>

      {/* Mermaid Copy Modal */}
      {showMermaid && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[70] flex items-center justify-center p-4" onClick={() => setShowMermaid(false)}>
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">📋 Copy to Lucidchart</h3>
                  <p className="text-xs text-gray-500 mt-1">3 steps — takes 10 seconds</p>
                </div>
                <button onClick={() => setShowMermaid(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-lg px-3 py-2">
                  <span className="text-sm font-bold text-purple-600">1</span>
                  <span className="text-xs text-purple-700">Click <strong>Copy Code</strong></span>
                </div>
                <ArrowRight size={14} className="text-gray-300" />
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                  <span className="text-sm font-bold text-blue-600">2</span>
                  <span className="text-xs text-blue-700">Lucidchart → <strong>Insert → Advanced → Mermaid</strong></span>
                </div>
                <ArrowRight size={14} className="text-gray-300" />
                <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                  <span className="text-sm font-bold text-green-600">3</span>
                  <span className="text-xs text-green-700"><strong>Paste</strong> and click Generate</span>
                </div>
              </div>
            </div>
            <div className="p-4 flex justify-between items-center bg-gray-50 border-b border-gray-100">
              <span className="text-[10px] text-gray-400 font-mono">prompt-chain.mmd</span>
              <button onClick={() => {
                fetch('/prompt-chain.mmd').then(r => r.text()).then(text => {
                  navigator.clipboard.writeText(text);
                  setMermaidCopied(true);
                  setTimeout(() => setMermaidCopied(false), 3000);
                });
              }} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${mermaidCopied ? 'bg-green-500 text-white' : 'bg-purple-600 text-white hover:bg-purple-500'}`}>
                {mermaidCopied ? <><Check size={14} /> Copied! Paste in Lucidchart</> : <><Copy size={14} /> Copy Code</>}
              </button>
            </div>
            <div className="overflow-y-auto max-h-[45vh]">
              <MermaidPreview />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MermaidPreview() {
  const [code, setCode] = useState<string>('Loading...');
  useEffect(() => { fetch('/prompt-chain.mmd').then(r => r.text()).then(setCode).catch(() => setCode('Failed to load')); }, []);
  return <pre className="text-[11px] text-gray-600 whitespace-pre font-mono leading-relaxed p-5 bg-gray-50">{code}</pre>;
}
