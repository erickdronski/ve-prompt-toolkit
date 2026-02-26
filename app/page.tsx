'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Copy, Check, Download, ChevronDown, ChevronUp, ArrowDown, ArrowRight, AlertTriangle, Lightbulb, Wrench, Fullscreen } from 'lucide-react';

/* ── prompt data ── */
export const prompts = [
  {
    id: 1,
    title: 'Market Research',
    subtitle: 'Customer Financial & Market Analysis',
    column: 'public',
    color: 'from-blue-500 to-blue-700',
    lightColor: 'text-blue-600',
    lightBg: 'bg-blue-50',
    lightBorder: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
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
    lightColor: 'text-orange-600',
    lightBg: 'bg-orange-50',
    lightBorder: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-700',
    prereqs: 'Output from Prompt 1 (or customer name + industry)',
    manualInput: false,
    prompt: `Based on [CUSTOMER NAME] operating in the [INDUSTRY/VERTICAL] space, provide: (1) Top 5 IT and security challenges facing this vertical in 2025-2026. (2) Regulatory and compliance pressures specific to this vertical (e.g., HIPAA, SOX, PCI-DSS, GDPR). (3) Digital transformation trends — where is this industry investing (cloud migration, AI/automation, endpoint modernization, zero trust)? (4) Common IT maturity gaps in this vertical based on industry benchmarks. (5) How organizations in this space typically structure their IT and security teams. Keep it concise and actionable for a pre-sales conversation.`,
  },
  {
    id: 3,
    title: 'Existing Ivanti Solutions',
    subtitle: 'Current Customer Ivanti Footprint',
    column: 'internal',
    color: 'from-green-500 to-green-700',
    lightColor: 'text-green-600',
    lightBg: 'bg-green-50',
    lightBorder: 'border-green-200',
    badge: 'bg-green-100 text-green-700',
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
    color: 'from-cyan-500 to-cyan-700',
    lightColor: 'text-cyan-600',
    lightBg: 'bg-cyan-50',
    lightBorder: 'border-cyan-200',
    badge: 'bg-cyan-100 text-cyan-700',
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
    color: 'from-purple-500 to-purple-700',
    lightColor: 'text-purple-600',
    lightBg: 'bg-purple-50',
    lightBorder: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-700',
    prereqs: 'Outputs from Prompts 1–4',
    manualInput: false,
    prompt: `Based on everything we know about [CUSTOMER NAME]:\n- Industry: [VERTICAL]\n- IT Challenges: [TOP 3 FROM PROMPT 2]\n- Current Ivanti Products: [FROM PROMPT 3]\n- Adoption Gaps: [FROM PROMPT 4]\n- Renewal Date: [DATE]\n\nIdentify the top 3-5 cross-sell or up-sell opportunities from Ivanti's portfolio. For each: (1) Recommended solution and why it fits their needs. (2) Business problem it solves tied to their vertical challenges. (3) Urgency level (tie to renewal timing or pain point severity). (4) Talk track — a 2-sentence pitch an SE can use in conversation. Prioritize by revenue potential and customer readiness.`,
  },
  {
    id: 6,
    title: 'Executive Readout',
    subtitle: 'Presentation-Ready Slide Content',
    column: 'action',
    color: 'from-rose-500 to-rose-700',
    lightColor: 'text-rose-600',
    lightBg: 'bg-rose-50',
    lightBorder: 'border-rose-200',
    badge: 'bg-rose-100 text-rose-700',
    prereqs: 'Outputs from Prompts 1–5',
    manualInput: false,
    prompt: `Create an executive readout for [CUSTOMER NAME] using these inputs:\n- Market Position: [KEY POINTS FROM PROMPT 1]\n- Industry Trends: [KEY POINTS FROM PROMPT 2]\n- Current Ivanti Stack: [FROM PROMPT 3]\n- Account Health: [FROM PROMPT 4]\n- Recommended Solutions: [FROM PROMPT 5]\n\nGenerate presentation-ready content for these slides: (1) Customer Overview — who they are, industry, scale. (2) Our Path Together — timeline of the Ivanti relationship. (3) Strategic Objectives — top 3-5 goals based on their challenges. (4) Recommended Roadmap — Crawl/Walk/Run phased approach. (5) Value Hypothesis — business benefits per solution. (6) Next Steps. Keep language executive-level, concise, and benefit-focused.`,
  },
];

export const recommendations = [
  { title: 'Unified Prompt Orchestrator', desc: 'Build a single-page internal app that chains all 6 prompts with auto-carried context. Power App or Ivy-based. Turns 30-min workflow → 10 min.' },
  { title: 'Salesforce-to-Prompt Bridge', desc: 'Pre-formatted Salesforce report exporting exactly what Prompts 3-4 need in copy-paste format. Removes the #1 adoption blocker.' },
  { title: 'Prompt → PowerPoint Automation', desc: 'Feed Prompt 6 output into branded templates via Copilot for PowerPoint, Gamma, or python-pptx. Hours → minutes.' },
  { title: 'Knowledge Base Integration', desc: 'Upload Capability & Maturity Content Master into Ivy/Copilot so AI references YOUR framework, not generic suggestions.' },
  { title: 'Customer Portal for YoY Tracking', desc: 'Persistent assessment scores + roadmap per customer. Year 2 revisits show growth instead of starting from scratch.' },
  { title: 'n8n / Power Automate Orchestration', desc: 'One-click end-to-end: Salesforce pull → AI prompts → slide generation → delivery. Already in your Microsoft stack.' },
];

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <button onClick={copy}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
        copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
      }`}>
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? 'Copied!' : (label || 'Copy Prompt')}
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
  recommendations.forEach((r, i) => { text += `${i + 1}. ${r.title}\n   ${r.desc}\n\n`; });
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'ivanti-ve-prompt-toolkit.txt'; a.click();
  URL.revokeObjectURL(url);
}

/* ── Flow Diagram ── */
function FlowDiagram() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900 text-center flex-1">Prompt Chain Flow</h2>
        <Link href="/map" className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 text-xs text-purple-700 font-medium">
          <Fullscreen size={12} /> Fullscreen Map
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="space-y-3">
          <div className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Customer Landscape — Public Data</div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <div className="text-sm font-semibold text-blue-600">1. Market Research</div>
            <div className="text-xs text-gray-500 mt-1">Company, financials, leadership</div>
          </div>
          <div className="flex justify-center"><ArrowDown size={18} className="text-blue-300" /></div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
            <div className="text-sm font-semibold text-orange-600">2. Vertical & Trends</div>
            <div className="text-xs text-gray-500 mt-1">Industry challenges, regulations</div>
          </div>
          <div className="flex justify-center"><ArrowDown size={18} className="text-orange-300" /></div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <div className="text-sm font-semibold text-green-600">3. Existing Ivanti Solutions</div>
            <div className="text-xs text-amber-600 mt-1">⚠️ Manual Salesforce input</div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Customer Ivanti Landscape — Internal Data</div>
          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3 text-center">
            <div className="text-sm font-semibold text-cyan-600">4. Tenant & Renewal Data</div>
            <div className="text-xs text-amber-600 mt-1">⚠️ 360 + Salesforce input</div>
          </div>
          <div className="flex justify-center"><ArrowDown size={18} className="text-cyan-300" /></div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center opacity-80">
            <div className="text-sm font-semibold text-amber-600">Renewals & Opportunities</div>
            <div className="text-xs text-gray-500 mt-1">Fed from Salesforce</div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
            <div className="w-8 h-px bg-green-300"></div>
            <span>Prompts 3+4 feed into →</span>
            <div className="w-8 h-px bg-purple-300"></div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Action Item Prompts</div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
            <div className="text-sm font-semibold text-purple-600">5. Cross-Sell / Up-Sell</div>
            <div className="text-xs text-gray-500 mt-1">Opportunities + talk tracks</div>
          </div>
          <div className="flex justify-center"><ArrowDown size={18} className="text-purple-300" /></div>
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-center">
            <div className="text-sm font-semibold text-rose-600">6. Executive Readout</div>
            <div className="text-xs text-gray-500 mt-1">Presentation-ready content</div>
          </div>
          <div className="flex justify-center"><ArrowDown size={18} className="text-green-400" /></div>
          <div className="bg-green-50 border border-green-300 rounded-lg p-3 text-center">
            <div className="text-sm font-bold text-green-600">💰 Revenue</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function PromptToolkitPage() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">On Demand Sales Knowledge Toolkit</h1>
            <p className="text-sm text-gray-500 mt-0.5">6-prompt chain for SEs, CSMs & VEs — copy-paste into Copilot or Ivy</p>
          </div>
          <button onClick={downloadAllPrompts}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
            <Download size={16} /> Download All
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
        <FlowDiagram />

        {/* How to Use */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">How to Use</h3>
          <p className="text-sm text-gray-600">
            Run prompts <span className="text-gray-900 font-medium">1 → 6</span> in order. Each builds on the last.
            Copy-paste into <span className="font-medium text-gray-900">Copilot</span> or <span className="font-medium text-gray-900">Ivy</span>.
            Replace <code className="bg-purple-50 px-1.5 py-0.5 rounded text-purple-700 text-xs">[BRACKETS]</code> with your customer info.
            Prompts marked with ⚠️ require manual data from Salesforce / Customer 360 first.
          </p>
        </div>

        {/* Prompt Cards */}
        <div className="space-y-4">
          {prompts.map((p) => {
            const isOpen = expanded === p.id;
            return (
              <div key={p.id} className={`bg-white border ${isOpen ? p.lightBorder : 'border-gray-200'} rounded-xl overflow-hidden shadow-sm transition-all`}>
                <button onClick={() => setExpanded(isOpen ? null : p.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${p.color} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                      {p.id}
                    </div>
                    <div>
                      <div className="text-gray-900 font-semibold">{p.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{p.subtitle}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {p.manualInput && (
                      <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded">
                        <AlertTriangle size={12} /> Manual Input
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded ${p.badge}`}>
                      {p.column === 'public' ? 'Public Data' : p.column === 'internal' ? 'Internal Data' : 'Action'}
                    </span>
                    {isOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 space-y-4 border-t border-gray-100">
                    <div className="pt-4 flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        <span className="text-gray-700">Pre-reqs:</span> {p.prereqs}
                      </div>
                      <CopyButton text={p.prompt} />
                    </div>

                    {p.manualInput && p.inputFields && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="text-xs font-semibold text-amber-700 mb-2 flex items-center gap-1.5">
                          <AlertTriangle size={12} /> Gather this data from Salesforce before running:
                        </div>
                        <ul className="space-y-1">
                          {p.inputFields.map((f, i) => (
                            <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                              <span className="text-amber-400 mt-0.5">•</span> {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">{p.prompt}</pre>
                    </div>
                    <div className="text-right text-xs text-gray-400">{p.prompt.length} characters</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Recommendations */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={18} className="text-amber-500" />
            <h2 className="text-lg font-bold text-gray-900">Tool & Process Recommendations</h2>
          </div>
          <p className="text-sm text-gray-500 mb-5">Ways to make this toolkit even more seamless across your org.</p>
          <div className="grid grid-cols-2 gap-4">
            {recommendations.map((r, i) => (
              <div key={i} className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wrench size={14} className="text-purple-500" />
                  <div className="text-sm font-semibold text-gray-900">{r.title}</div>
                </div>
                <div className="text-xs text-gray-600 leading-relaxed">{r.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
