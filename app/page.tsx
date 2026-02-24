'use client';

import { useState } from 'react';
import { Copy, Check, Download, ChevronDown, ChevronUp, ArrowDown, ArrowRight, AlertTriangle, Lightbulb, Wrench } from 'lucide-react';

/* ── prompt data ── */
const prompts = [
  {
    id: 1,
    title: 'Market Research',
    subtitle: 'Customer Financial & Market Analysis',
    column: 'public',
    color: 'from-blue-600 to-blue-800',
    border: 'border-blue-500/30',
    badge: 'bg-blue-500/20 text-blue-400',
    prereqs: 'Customer company name',
    manualInput: false,
    prompt: `Act as a market research analyst. Research [CUSTOMER NAME] and provide: (1) Company overview — what they do, headquarters, employee count, annual revenue, public/private status. (2) Recent financial performance — revenue trends, growth or contraction, earnings highlights, recent acquisitions or divestitures. (3) Key leadership — CEO, CTO/CIO, and IT decision-makers if available. (4) Competitive landscape — top 3 competitors and how [CUSTOMER NAME] differentiates. (5) Recent news — last 6 months of press releases, partnerships, layoffs, or strategic shifts. Format as a structured brief I can reference in a customer meeting.`,
  },
  {
    id: 2,
    title: 'Vertical & Trends',
    subtitle: 'Customer Industry Challenges & IT Trends',
    column: 'public',
    color: 'from-orange-500 to-orange-700',
    border: 'border-orange-500/30',
    badge: 'bg-orange-500/20 text-orange-400',
    prereqs: 'Output from Prompt 1 (or customer name + industry)',
    manualInput: false,
    prompt: `Based on [CUSTOMER NAME] operating in the [INDUSTRY/VERTICAL] space, provide: (1) Top 5 IT and security challenges facing this vertical in 2025-2026. (2) Regulatory and compliance pressures specific to this vertical (e.g., HIPAA, SOX, PCI-DSS, GDPR). (3) Digital transformation trends — where is this industry investing (cloud migration, AI/automation, endpoint modernization, zero trust)? (4) Common IT maturity gaps in this vertical based on industry benchmarks. (5) How organizations in this space typically structure their IT and security teams. Keep it concise and actionable for a pre-sales conversation.`,
  },
  {
    id: 3,
    title: 'Existing Ivanti Solutions',
    subtitle: 'Current Customer Ivanti Footprint',
    column: 'internal',
    color: 'from-green-600 to-green-800',
    border: 'border-green-500/30',
    badge: 'bg-green-500/20 text-green-400',
    prereqs: 'Salesforce account data (manual pull required)',
    manualInput: true,
    inputFields: [
      'Products Licensed (e.g., Neurons for ITSM, UEM, EPM, Patch, DEX, RBVM)',
      'License / Seat Count',
      'Contract Renewal Date(s)',
      'Open Opportunities or Pending Quotes',
      'Product Adoption Status (Active / Underutilized / Not Deployed)',
    ],
    prompt: `I am preparing for an engagement with [CUSTOMER NAME]. Here is their current Ivanti landscape:\n\nProducts Licensed: [LIST PRODUCTS]\nLicense/Seat Count: [COUNT]\nRenewal Date: [DATE]\nOpen Opportunities: [LIST OR "NONE"]\nAdoption Status: [ACTIVE / UNDERUTILIZED / NOT DEPLOYED per product]\n\nSummarize this customer's Ivanti footprint. Identify: (1) Which products are actively used vs underutilized. (2) Upcoming renewal risks or expansion timing. (3) Gaps in their Ivanti stack relative to our full portfolio. Format as a quick-reference account snapshot.`,
  },
  {
    id: 4,
    title: 'Tenant & Renewal Data',
    subtitle: 'Customer 360 + Salesforce Intelligence',
    column: 'internal',
    color: 'from-cyan-600 to-cyan-800',
    border: 'border-cyan-500/30',
    badge: 'bg-cyan-500/20 text-cyan-400',
    prereqs: 'Customer 360 tenant data + Salesforce renewals/opportunities',
    manualInput: true,
    inputFields: [
      'Tenant Data from 360 (active modules, user count, adoption %)',
      'Salesforce: Renewals (date, ARR, risk level)',
      'Salesforce: Open Opportunities (stage + value)',
      'CSM Health Score (Green/Yellow/Red + notes)',
    ],
    prompt: `Here is [CUSTOMER NAME]'s internal Ivanti data:\n\nTenant Data (from 360): [PASTE KEY METRICS — active modules, users, adoption %]\nRenewals: [RENEWAL DATE, ARR, RISK LEVEL]\nOpen Opportunities: [LIST WITH STAGE AND VALUE]\nCSM Health Score: [GREEN/YELLOW/RED + NOTES]\n\nAnalyze this account: (1) Overall health — are they getting value from what they own? (2) Adoption gaps — what's licensed but underused? (3) Revenue risk — any churn signals or renewal concerns? (4) Expansion readiness — based on usage patterns, what are they likely ready for next? Provide a concise account intelligence brief.`,
  },
  {
    id: 5,
    title: 'Cross-Sell / Up-Sell',
    subtitle: 'Opportunity Identification & Talk Tracks',
    column: 'action',
    color: 'from-purple-600 to-purple-800',
    border: 'border-purple-500/30',
    badge: 'bg-purple-500/20 text-purple-400',
    prereqs: 'Outputs from Prompts 1–4',
    manualInput: false,
    prompt: `Based on everything we know about [CUSTOMER NAME]:\n- Industry: [VERTICAL]\n- IT Challenges: [TOP 3 FROM PROMPT 2]\n- Current Ivanti Products: [FROM PROMPT 3]\n- Adoption Gaps: [FROM PROMPT 4]\n- Renewal Date: [DATE]\n\nIdentify the top 3-5 cross-sell or up-sell opportunities from Ivanti's portfolio. For each: (1) Recommended solution and why it fits their needs. (2) Business problem it solves tied to their vertical challenges. (3) Urgency level (tie to renewal timing or pain point severity). (4) Talk track — a 2-sentence pitch an SE can use in conversation. Prioritize by revenue potential and customer readiness.`,
  },
  {
    id: 6,
    title: 'Executive Readout',
    subtitle: 'Presentation-Ready Slide Content',
    column: 'action',
    color: 'from-rose-600 to-rose-800',
    border: 'border-rose-500/30',
    badge: 'bg-rose-500/20 text-rose-400',
    prereqs: 'Outputs from Prompts 1–5',
    manualInput: false,
    prompt: `Create an executive readout for [CUSTOMER NAME] using these inputs:\n- Market Position: [KEY POINTS FROM PROMPT 1]\n- Industry Trends: [KEY POINTS FROM PROMPT 2]\n- Current Ivanti Stack: [FROM PROMPT 3]\n- Account Health: [FROM PROMPT 4]\n- Recommended Solutions: [FROM PROMPT 5]\n\nGenerate presentation-ready content for these slides: (1) Customer Overview — who they are, industry, scale. (2) Our Path Together — timeline of the Ivanti relationship. (3) Strategic Objectives — top 3-5 goals based on their challenges. (4) Recommended Roadmap — Crawl/Walk/Run phased approach. (5) Value Hypothesis — business benefits per solution. (6) Next Steps. Keep language executive-level, concise, and benefit-focused.`,
  },
];

const recommendations = [
  {
    title: 'Unified Prompt Orchestrator',
    desc: 'Build a single-page internal app that chains all 6 prompts with auto-carried context. Power App or Ivy-based. Turns 30-min workflow → 10 min.',
  },
  {
    title: 'Salesforce-to-Prompt Bridge',
    desc: 'Pre-formatted Salesforce report exporting exactly what Prompts 3-4 need in copy-paste format. Removes the #1 adoption blocker.',
  },
  {
    title: 'Prompt → PowerPoint Automation',
    desc: 'Feed Prompt 6 output into branded templates via Copilot for PowerPoint, Gamma, or python-pptx. Hours → minutes.',
  },
  {
    title: 'Knowledge Base Integration',
    desc: 'Upload Capability & Maturity Content Master into Ivy/Copilot so AI references YOUR framework, not generic suggestions.',
  },
  {
    title: 'Customer Portal for YoY Tracking',
    desc: 'Persistent assessment scores + roadmap per customer. Year 2 revisits show growth instead of starting from scratch.',
  },
  {
    title: 'n8n / Power Automate Orchestration',
    desc: 'One-click end-to-end: Salesforce pull → AI prompts → slide generation → delivery. Already in your Microsoft stack.',
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
        copied ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-[#888] hover:bg-white/10 hover:text-white'
      }`}>
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? 'Copied!' : 'Copy Prompt'}
    </button>
  );
}

function downloadAllPrompts() {
  let text = 'ON DEMAND SALES KNOWLEDGE TOOLKIT\n';
  text += 'Ivanti Value Engineering — Prompt Chain\n';
  text += '='.repeat(60) + '\n\n';
  text += 'HOW TO USE: Run prompts 1→6 in order. Each builds on the last.\n';
  text += 'Replace [BRACKETS] with your customer info.\n\n';
  prompts.forEach((p) => {
    text += '—'.repeat(40) + '\n';
    text += `PROMPT ${p.id}: ${p.title.toUpperCase()}\n`;
    text += `${p.subtitle}\n`;
    text += `Pre-reqs: ${p.prereqs}\n`;
    if (p.manualInput && p.inputFields) {
      text += '\n⚠️ Manual input required. Gather from Salesforce:\n';
      p.inputFields.forEach((f) => (text += `  • ${f}\n`));
    }
    text += '\n' + p.prompt + '\n\n';
  });
  text += '='.repeat(60) + '\n';
  text += 'TOOL RECOMMENDATIONS\n';
  text += '='.repeat(60) + '\n\n';
  recommendations.forEach((r, i) => {
    text += `${i + 1}. ${r.title}\n   ${r.desc}\n\n`;
  });
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ivanti-ve-prompt-toolkit.txt';
  a.click();
  URL.revokeObjectURL(url);
}

/* ── flow diagram ── */
function FlowDiagram() {
  return (
    <div className="bg-[#111] border border-[#222] rounded-xl p-6 mb-8">
      <h2 className="text-lg font-bold text-white mb-6 text-center">Prompt Chain Flow</h2>
      <div className="grid grid-cols-3 gap-6">
        {/* Column 1: Public Data */}
        <div className="space-y-3">
          <div className="text-center text-xs font-semibold text-[#555] uppercase tracking-wider mb-4">Customer Landscape — Public Data</div>
          <div className="bg-gradient-to-r from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-lg p-3 text-center">
            <div className="text-sm font-semibold text-blue-400">1. Market Research</div>
            <div className="text-xs text-[#666] mt-1">Company, financials, leadership</div>
          </div>
          <div className="flex justify-center"><ArrowDown size={18} className="text-blue-500/50" /></div>
          <div className="bg-gradient-to-r from-orange-500/20 to-orange-700/20 border border-orange-500/30 rounded-lg p-3 text-center">
            <div className="text-sm font-semibold text-orange-400">2. Vertical & Trends</div>
            <div className="text-xs text-[#666] mt-1">Industry challenges, regulations</div>
          </div>
          <div className="flex justify-center"><ArrowDown size={18} className="text-orange-500/50" /></div>
          <div className="bg-gradient-to-r from-green-600/20 to-green-800/20 border border-green-500/30 rounded-lg p-3 text-center">
            <div className="text-sm font-semibold text-green-400">3. Existing Ivanti Solutions</div>
            <div className="text-xs text-[#666] mt-1">⚠️ Manual Salesforce input</div>
          </div>
        </div>

        {/* Column 2: Internal Data */}
        <div className="space-y-3">
          <div className="text-center text-xs font-semibold text-[#555] uppercase tracking-wider mb-4">Customer Ivanti Landscape — Internal Data</div>
          <div className="bg-gradient-to-r from-cyan-600/20 to-cyan-800/20 border border-cyan-500/30 rounded-lg p-3 text-center">
            <div className="text-sm font-semibold text-cyan-400">4. Tenant & Renewal Data</div>
            <div className="text-xs text-[#666] mt-1">⚠️ 360 + Salesforce input</div>
          </div>
          <div className="flex justify-center"><ArrowDown size={18} className="text-cyan-500/30" /></div>
          <div className="bg-gradient-to-r from-amber-600/20 to-amber-800/20 border border-amber-500/30 rounded-lg p-3 text-center opacity-70">
            <div className="text-sm font-semibold text-amber-400">Renewals & Opportunities</div>
            <div className="text-xs text-[#666] mt-1">Fed from Salesforce</div>
          </div>
          {/* Arrow from col1 prompt3 → col2 */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#555]">
            <div className="w-8 h-px bg-green-500/30"></div>
            <span>Prompts 3+4 feed into →</span>
            <div className="w-8 h-px bg-purple-500/30"></div>
          </div>
        </div>

        {/* Column 3: Action Prompts */}
        <div className="space-y-3">
          <div className="text-center text-xs font-semibold text-[#555] uppercase tracking-wider mb-4">Action Item Prompts</div>
          <div className="bg-gradient-to-r from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-lg p-3 text-center">
            <div className="text-sm font-semibold text-purple-400">5. Cross-Sell / Up-Sell</div>
            <div className="text-xs text-[#666] mt-1">Opportunities + talk tracks</div>
          </div>
          <div className="flex justify-center"><ArrowDown size={18} className="text-purple-500/50" /></div>
          <div className="bg-gradient-to-r from-rose-600/20 to-rose-800/20 border border-rose-500/30 rounded-lg p-3 text-center">
            <div className="text-sm font-semibold text-rose-400">6. Executive Readout</div>
            <div className="text-xs text-[#666] mt-1">Presentation-ready content</div>
          </div>
          <div className="flex justify-center"><ArrowDown size={18} className="text-green-500/50" /></div>
          <div className="bg-gradient-to-r from-emerald-500/20 to-emerald-700/20 border border-emerald-500/40 rounded-lg p-3 text-center">
            <div className="text-sm font-bold text-emerald-400">💰 Revenue</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── main page ── */
export default function ValueEngineeringPage() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">On Demand Sales Knowledge Toolkit</h2>
          <p className="text-sm text-[#555] mt-0.5">6-prompt chain for SEs, CSMs & VEs — copy-paste into Copilot or Ivy</p>
        </div>
        <button onClick={downloadAllPrompts}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors">
          <Download size={16} />
          Download All Prompts
        </button>
      </div>

      {/* Flow Diagram */}
      <FlowDiagram />

      {/* How to Use */}
      <div className="bg-[#111] border border-[#222] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-2">How to Use</h3>
        <p className="text-sm text-[#888]">
          Run prompts <span className="text-white font-medium">1 → 6</span> in order. Each builds on the last.
          Copy-paste into <span className="text-white">Copilot</span> or <span className="text-white">Ivy</span>.
          Replace <code className="bg-white/5 px-1.5 py-0.5 rounded text-purple-400">[BRACKETS]</code> with your customer info.
          Prompts marked with ⚠️ require manual data from Salesforce / Customer 360 first.
        </p>
      </div>

      {/* Prompt Cards */}
      <div className="space-y-4">
        {prompts.map((p) => {
          const isOpen = expanded === p.id;
          return (
            <div key={p.id} className={`bg-[#111] border ${p.border} rounded-xl overflow-hidden transition-all`}>
              {/* Header */}
              <button onClick={() => setExpanded(isOpen ? null : p.id)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${p.color} flex items-center justify-center text-white font-bold text-sm`}>
                    {p.id}
                  </div>
                  <div>
                    <div className="text-white font-semibold">{p.title}</div>
                    <div className="text-xs text-[#666] mt-0.5">{p.subtitle}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {p.manualInput && (
                    <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded">
                      <AlertTriangle size={12} /> Manual Input
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded ${p.badge}`}>
                    {p.column === 'public' ? 'Public Data' : p.column === 'internal' ? 'Internal Data' : 'Action'}
                  </span>
                  {isOpen ? <ChevronUp size={18} className="text-[#555]" /> : <ChevronDown size={18} className="text-[#555]" />}
                </div>
              </button>

              {/* Expanded Content */}
              {isOpen && (
                <div className="px-5 pb-5 space-y-4 border-t border-[#222]">
                  <div className="pt-4 flex items-center justify-between">
                    <div className="text-xs text-[#555]">
                      <span className="text-[#888]">Pre-reqs:</span> {p.prereqs}
                    </div>
                    <CopyButton text={p.prompt} />
                  </div>

                  {/* Manual input fields */}
                  {p.manualInput && p.inputFields && (
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
                      <div className="text-xs font-semibold text-amber-400 mb-2 flex items-center gap-1.5">
                        <AlertTriangle size={12} /> Gather this data from Salesforce before running:
                      </div>
                      <ul className="space-y-1">
                        {p.inputFields.map((f, i) => (
                          <li key={i} className="text-xs text-[#888] flex items-start gap-2">
                            <span className="text-amber-500/50 mt-0.5">•</span> {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Prompt */}
                  <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4">
                    <pre className="text-sm text-[#ccc] whitespace-pre-wrap font-mono leading-relaxed">{p.prompt}</pre>
                  </div>
                  <div className="text-right text-xs text-[#444]">{p.prompt.length} characters</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Recommendations */}
      <div className="mt-12 bg-[#111] border border-[#222] rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb size={18} className="text-yellow-400" />
          <h2 className="text-lg font-bold text-white">Tool & Process Recommendations</h2>
        </div>
        <p className="text-sm text-[#666] mb-5">Ways to make this toolkit even more seamless across your org.</p>
        <div className="grid grid-cols-2 gap-4">
          {recommendations.map((r, i) => (
            <div key={i} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wrench size={14} className="text-purple-400" />
                <div className="text-sm font-semibold text-white">{r.title}</div>
              </div>
              <div className="text-xs text-[#888] leading-relaxed">{r.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
