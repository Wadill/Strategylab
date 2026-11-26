"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  Download,
  FlaskConical,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Wallet,
  WandSparkles,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type View = "overview" | "studio" | "backtests" | "paper" | "settings";
type Strategy = {
  id: string;
  name: string;
  pair: string;
  category: string;
  returnPct: number;
  winRate: number;
  drawdown: number;
  trades: number;
  status: "Ready" | "Draft" | "Paper live";
};

type ChartPoint = { date: string; strategy: number; benchmark: number };

const BASE_STRATEGIES: Strategy[] = [
  { id: "sma", name: "Golden Cross Momentum", pair: "BTC / USD", category: "Trend following", returnPct: 18.42, winRate: 63.8, drawdown: 8.24, trades: 42, status: "Paper live" },
  { id: "rsi", name: "RSI Mean Reversion", pair: "ETH / USD", category: "Mean reversion", returnPct: 12.76, winRate: 58.4, drawdown: 6.17, trades: 68, status: "Ready" },
  { id: "breakout", name: "Breakout Confirmation", pair: "SOL / USD", category: "Momentum", returnPct: -2.31, winRate: 46.2, drawdown: 14.50, trades: 25, status: "Draft" },
];

const CHART_DATA: ChartPoint[] = [
  { date: "Jan 03", strategy: 10000, benchmark: 10000 },
  { date: "Jan 10", strategy: 10350, benchmark: 10180 },
  { date: "Jan 17", strategy: 10210, benchmark: 10040 },
  { date: "Jan 24", strategy: 10850, benchmark: 10530 },
  { date: "Jan 31", strategy: 11120, benchmark: 10380 },
  { date: "Feb 07", strategy: 10790, benchmark: 10440 },
  { date: "Feb 14", strategy: 11240, benchmark: 10850 },
  { date: "Feb 21", strategy: 11030, benchmark: 10940 },
  { date: "Feb 28", strategy: 11640, benchmark: 10670 },
  { date: "Mar 07", strategy: 11490, benchmark: 10860 },
  { date: "Mar 14", strategy: 12010, benchmark: 11180 },
  { date: "Mar 21", strategy: 11842, benchmark: 10990 },
];

const DEFAULT_PROMPT =
  "Buy BTC when the 10-day simple moving average crosses above the 30-day average. Exit when it crosses below. Use 2% risk per trade and a 5% stop loss.";

const PROMPTS = [
  { label: "SMA crossover", text: DEFAULT_PROMPT },
  { label: "RSI reversion", text: "Buy ETH when the 14-day RSI crosses below 30. Exit when it crosses above 70. Use a 3% stop loss." },
  { label: "Breakout", text: "Buy SOL when the daily closing price breaks above the previous 20-day high. Exit when price closes below the 10-day SMA." },
];

const USD = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

function EquityTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name?: string; value?: number; color?: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <strong>{label}</strong>
      {payload.map((item) => (
        <div key={item.name} className="tooltip-line"><span style={{ backgroundColor: item.color }} /> {item.name}: <b>{USD(item.value ?? 0)}</b></div>
      ))}
    </div>
  );
}

function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="brand">
      <div className="brand-mark"><Activity size={23} strokeWidth={2.6} /></div>
      {!collapsed && <div className="brand-name">strategy<span>lab</span><small>AI</small></div>}
    </div>
  );
}

function StatusPill({ status }: { status: Strategy["status"] }) {
  return <span className={`status-pill ${status === "Paper live" ? "status-live" : status === "Ready" ? "status-ready" : "status-draft"}`}><span className="status-dot" />{status}</span>;
}

function MetricCard({ label, value, change, positive, note, icon: Icon }: { label: string; value: string; change?: string; positive?: boolean; note: string; icon: typeof Activity }) {
  return (
    <article className="metric-card">
      <div className="metric-top"><span>{label}</span><span className="metric-icon"><Icon size={17} /></span></div>
      <div className="metric-value">{value}</div>
      <div className="metric-bottom">
        {change && <span className={positive ? "metric-trend positive" : "metric-trend negative"}>{positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{change}</span>}
        <span>{note}</span>
      </div>
    </article>
  );
}

export default function StrategyLabDashboard() {
  const [view, setView] = useState<View>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [pair, setPair] = useState("BTC/USD");
  const [capital, setCapital] = useState("10000");
  const [fee, setFee] = useState("0.10");
  const [strategyName, setStrategyName] = useState("Golden Cross Momentum");
  const [strategyType, setStrategyType] = useState("Trend following");
  const [selectedStrategy, setSelectedStrategy] = useState("sma");
  const [strategies, setStrategies] = useState(BASE_STRATEGIES);
  const [notice, setNotice] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");
  const [liveSimulation, setLiveSimulation] = useState(true);
  const [demoRun, setDemoRun] = useState(false);
  const [demoResult, setDemoResult] = useState<ChartPoint[]>(CHART_DATA);
  const [risk, setRisk] = useState("2");

  const activeStrategy = strategies.find((s) => s.id === selectedStrategy) ?? strategies[0];
  const ending = demoResult.at(-1)?.strategy ?? 10000;
  const starting = demoResult[0]?.strategy ?? 10000;
  const displayReturn = ((ending / starting - 1) * 100).toFixed(2);
  const filteredStrategies = useMemo(() => strategies.filter((s) => `${s.name} ${s.pair} ${s.category}`.toLowerCase().includes(search.toLowerCase())), [strategies, search]);

  function go(next: View) { setView(next); setSidebarOpen(false); setNotice(""); }
  function toast(message: string) { setNotice(message); window.setTimeout(() => setNotice(""), 4500); }
  function loadTemplate(text: string) { setPrompt(text); toast("Template loaded. Edit the instructions before continuing."); }
  function parseDraft() {
    const normalized = prompt.toLowerCase();
    if (!prompt.trim()) { toast("Describe your strategy before generating a draft."); return; }
    const type = normalized.includes("rsi") || normalized.includes("reversion") ? "Mean reversion" : normalized.includes("breakout") || normalized.includes("break") ? "Momentum" : "Trend following";
    const asset = normalized.includes("eth") ? "ETH" : normalized.includes("sol") ? "SOL" : "BTC";
    setPair(`${asset}/USD`);
    setStrategyType(type);
    setStrategyName(type === "Mean reversion" ? "RSI Reversion Draft" : type === "Momentum" ? "Momentum Breakout Draft" : "Moving Average Draft");
    toast("Demo rule parser updated your strategy fields. Connect OpenAI to enable real natural-language parsing.");
  }
  function saveDraft() {
    const id = `draft-${Date.now()}`;
    const draft: Strategy = { id, name: strategyName || "Untitled strategy", pair: pair.replace("/", " / "), category: strategyType, returnPct: 0, winRate: 0, drawdown: 0, trades: 0, status: "Draft" };
    setStrategies((existing) => [draft, ...existing]);
    setSelectedStrategy(id);
    toast("Draft saved in this browser session. Database persistence is not connected yet.");
  }
  function runDemo() {
    // Deliberately illustrative values: not calculated from historic market candles.
    const seed = strategyType === "Mean reversion" ? 0.94 : strategyType === "Momentum" ? 1.08 : 1;
    const cost = Math.max(0, Math.min(5, Number(fee) || 0));
    const costScale = (1 - cost / 100);
    const start = Math.max(100, Number(capital) || 10000);
    setDemoResult(CHART_DATA.map((p, index) => ({ date: p.date, strategy: Math.round(start * (1 + ((p.strategy / 10000 - 1) * seed) - index * (1 - costScale) * 0.12)), benchmark: Math.round(start * p.benchmark / 10000) })));
    setDemoRun(true);
    go("backtests");
    toast("Illustrative demo scenario generated — no historical-data backtest was executed.");
  }
  function exportDemo() {
    const headers = "date,strategy_equity,benchmark_equity";
    const csv = [headers, ...demoResult.map((point) => `${point.date},${point.strategy},${point.benchmark}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "strategylab-illustrative-demo.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  const nav: Array<{ label: string; icon: typeof Activity; view: View }> = [
    { label: "Overview", icon: LayoutDashboard, view: "overview" },
    { label: "Strategy Studio", icon: WandSparkles, view: "studio" },
    { label: "Backtesting", icon: FlaskConical, view: "backtests" },
    { label: "Paper Trading", icon: Wallet, view: "paper" },
  ];
  const title: Record<View, string> = { overview: "Overview", studio: "Strategy Studio", backtests: "Backtesting", paper: "Paper Trading", settings: "Workspace Settings" };
  const subtitle: Record<View, string> = { overview: "Your trading intelligence, in one place.", studio: "Translate trading ideas into structured strategy drafts.", backtests: "Explore illustrative performance before connecting real market data.", paper: "Track your risk-free simulation workspace.", settings: "Manage your research workspace preferences." };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header"><Brand /><button className="mobile-close icon-button" aria-label="Close navigation" onClick={() => setSidebarOpen(false)}><X size={18} /></button></div>
        <div className="workspace-picker"><div className="workspace-avatar">S</div><div className="workspace-copy"><strong>My Workspace</strong><small>Personal account</small></div><ChevronDown size={16} /></div>
        <div className="nav-caption">WORKSPACE</div>
        <nav className="sidebar-nav" aria-label="Primary navigation">
          {nav.map(({ label, icon: Icon, view: target }) => (
            <button key={target} onClick={() => go(target)} className={`nav-link ${view === target ? "active" : ""}`}><Icon size={19} strokeWidth={1.9} /><span>{label}</span>{target === "studio" && <span className="nav-ai">AI</span>}</button>
          ))}
        </nav>
        <div className="nav-caption tools-caption">GENERAL</div>
        <nav className="sidebar-nav" aria-label="General navigation">
          <button onClick={() => go("settings")} className={`nav-link ${view === "settings" ? "active" : ""}`}><Settings2 size={19}/><span>Settings</span></button>
          <button className="nav-link" onClick={() => toast("Documentation is included with the frontend starter and repository README.")}><BookOpen size={19}/><span>Documentation</span><ArrowUpRight size={15} className="nav-end"/></button>
          <button className="nav-link" onClick={() => toast("This is a frontend prototype. Support contact details will be added later.")}><CircleHelp size={19}/><span>Help & Support</span></button>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-promo"><span className="promo-icon"><Sparkles size={19}/></span><strong>Ideas → Evidence</strong><p>Build smarter strategies with transparent research.</p><button onClick={() => go("studio")}>Open Studio <ArrowRight size={15}/></button></div>
          <div className="sidebar-profile"><div className="profile-avatar">SL</div><div><strong>StrategyLab User</strong><small>Demo workspace</small></div><MoreHorizontal size={19}/></div>
        </div>
      </aside>
      {sidebarOpen && <button aria-label="Close navigation overlay" className="mobile-overlay" onClick={() => setSidebarOpen(false)} />}
      <main className="main-area">
        <header className="topbar">
          <div className="topbar-start"><button className="mobile-menu icon-button" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}><Menu size={21}/></button><div className="breadcrumbs"><span>Workspace</span><ChevronRight size={14}/><strong>{title[view]}</strong></div></div>
          <div className="topbar-actions">
            {showSearch && <input autoFocus aria-label="Search strategies" className="top-search-input" placeholder="Search strategies..." value={search} onChange={(event) => setSearch(event.target.value)} />}
            <button className="icon-button" aria-label="Search strategies" onClick={() => { setShowSearch(!showSearch); if (view !== "overview") go("overview"); }}><Search size={20}/></button>
            <button className="icon-button notifications" aria-label="Notifications" onClick={() => toast("No new notifications in this demo.")}><Bell size={20}/><i/></button>
            <div className="top-divider"/><span className="top-avatar">SL</span>
          </div>
        </header>
        <div className="page-content">
          <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-dot"/> STRATEGYLAB WORKSPACE <span className="dot-separator">·</span> DEMO MODE</div><h1>{title[view]}<span className="heading-spark">✦</span></h1><p>{subtitle[view]}</p></div><button className="primary-button heading-button" onClick={() => go("studio")}><Plus size={17}/> New Strategy</button></div>
          {view === "overview" && <>
            <div className="hero-banner"><div className="hero-copy"><div className="hero-tag"><Sparkles size={14}/> YOUR AI STRATEGY WORKBENCH</div><h2>Better strategies start<br/>with <em>better questions.</em></h2><p>Describe your idea. Explore the rules. Test the possibilities — all in one intelligent workspace.</p><button className="hero-button" onClick={() => go("studio")}>Launch Strategy Studio <ArrowRight size={17}/></button></div><div className="hero-art" aria-hidden="true"><div className="art-grid"/><svg viewBox="0 0 440 230" preserveAspectRatio="none"><defs><linearGradient id="artStroke" x1="0" x2="1"><stop stopColor="#50d6b1" stopOpacity="0.1"/><stop offset="1" stopColor="#76f5cf"/></linearGradient></defs><path d="M0 190 L44 180 L78 198 L120 122 L160 155 L197 118 L235 138 L277 71 L314 103 L349 38 L383 75 L440 14" fill="none" stroke="url(#artStroke)" strokeWidth="3"/><path d="M0 190 L44 180 L78 198 L120 122 L160 155 L197 118 L235 138 L277 71 L314 103 L349 38 L383 75 L440 14 L440 230 L0 230Z" fill="#66e6be" opacity=".05"/><circle cx="349" cy="38" r="7" fill="#80f1d3"/><circle cx="349" cy="38" r="15" fill="#80f1d3" opacity=".15"/></svg><div className="art-pill"><span>↗</span> Evolving strategy intelligence</div></div></div>
            <div className="section-top"><div><h2>Performance snapshot</h2><p>Illustrative sample results — not live trading data.</p></div><span className="muted-chip"><Clock3 size={14}/> Example period: Jan–Mar</span></div>
            <div className="metrics-grid"><MetricCard label="Demo portfolio equity" value="$11,842" change="18.42%" positive note="vs. starting $10,000" icon={Wallet}/><MetricCard label="Strategy win rate" value="63.8%" change="5.4%" positive note="sample trades" icon={TrendingUp}/><MetricCard label="Max drawdown" value="8.24%" change="2.1%" note="sample peak-to-trough" icon={Activity}/><MetricCard label="Saved strategies" value={String(strategies.length).padStart(2,"0")} note="in current browser session" icon={FlaskConical}/></div>
            <div className="dashboard-grid"><div className="panel chart-panel"><div className="panel-header"><div><h3>Equity performance</h3><p>Strategy vs. buy-and-hold benchmark</p></div><span className="demo-label">ILLUSTRATIVE DATA</span></div><div className="chart-stats"><strong>+$1,842 <span>+18.42%</span></strong><small>Sample net growth</small></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={CHART_DATA} margin={{ top: 10, right: 5, left: -13, bottom: 0 }}><defs><linearGradient id="equityArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#55dab8" stopOpacity={0.18}/><stop offset="95%" stopColor="#55dab8" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#263142" vertical={false} strokeDasharray="3 5"/><XAxis dataKey="date" tickLine={false} axisLine={false} tick={{fill:"#7d8b9b",fontSize:11}} interval={2} dy={10}/><YAxis domain={[9600,12300]} tickFormatter={(v: number) => `$${(v/1000).toFixed(0)}k`} tickLine={false} axisLine={false} tick={{fill:"#7d8b9b",fontSize:11}}/><Tooltip content={<EquityTooltip/>}/><Area type="monotone" dataKey="strategy" name="Strategy" stroke="#63e0b8" strokeWidth={2.5} fill="url(#equityArea)" activeDot={{r:5}}/><Area type="monotone" dataKey="benchmark" name="Benchmark" stroke="#7790a8" strokeWidth={1.6} strokeDasharray="4 5" fillOpacity={0}/></AreaChart></ResponsiveContainer></div><div className="chart-legend"><span><i className="legend-strategy"/> Strategy equity</span><span><i className="legend-benchmark"/> Buy & hold</span></div></div><div className="panel insight-panel"><div className="panel-header"><div><h3><Sparkles size={17} className="mint-icon"/> Research notes</h3><p>Important checks before going live</p></div><MoreHorizontal size={19}/></div><div className="insight-list"><div className="insight-item"><div className="insight-icon good"><ShieldCheck size={19}/></div><div><strong>Validate risk assumptions</strong><p>Model fees, slippage and the delay between signals and fills.</p><span>BACKTEST QUALITY</span></div></div><div className="insight-item"><div className="insight-icon neutral"><Activity size={19}/></div><div><strong>Watch for overfitting</strong><p>Compare your strategy on unseen data before trusting a pattern.</p><span>MODEL ROBUSTNESS</span></div></div><div className="insight-item"><div className="insight-icon violet"><FlaskConical size={19}/></div><div><strong>Paper trade first</strong><p>Track virtual execution and check how signals behave in practice.</p><span>DEPLOYMENT READINESS</span></div></div></div><button className="text-button" onClick={() => go("studio")}>Open strategy studio <ArrowRight size={15}/></button></div></div>
            <div className="section-top strategies-title"><div><h2>Your strategies</h2><p>A starting point for testing and refining trading ideas.</p></div><button className="subtle-button" onClick={() => go("studio")}><Plus size={16}/> Create new</button></div>
            <StrategyTable strategies={filteredStrategies} onSelect={(s) => { setSelectedStrategy(s.id); go("backtests"); }} />
          </>}
          {view === "studio" && <div className="studio-grid"><section className="panel studio-editor"><div className="panel-header"><div><h3><WandSparkles size={19} className="mint-icon"/> Natural-language strategy builder</h3><p>Start with an idea — refine it into a structured rule set.</p></div><span className="demo-label">DEMO PARSER</span></div><label htmlFor="strategy-prompt" className="field-label">Describe your trading idea</label><textarea id="strategy-prompt" className="prompt-textarea" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe entry, exit and risk rules in plain English..."/><div className="field-hint"><Sparkles size={14}/> Include the asset, entry condition, exit condition and risk controls.</div><div className="template-title">QUICK START TEMPLATES</div><div className="template-row">{PROMPTS.map((item) => <button key={item.label} className="template-button" onClick={() => loadTemplate(item.text)}>{item.label}<ArrowRight size={13}/></button>)}</div><div className="form-divider"/><div className="form-grid"><div><label className="field-label" htmlFor="strategy-name">Strategy name</label><input id="strategy-name" value={strategyName} onChange={(e) => setStrategyName(e.target.value)} className="input-field"/></div><div><label className="field-label" htmlFor="trading-pair">Trading pair</label><select id="trading-pair" value={pair} onChange={(e) => setPair(e.target.value)} className="input-field"><option>BTC/USD</option><option>ETH/USD</option><option>SOL/USD</option></select></div><div><label className="field-label" htmlFor="starting-capital">Starting capital ($)</label><input id="starting-capital" type="number" min="100" value={capital} onChange={(e) => setCapital(e.target.value)} className="input-field"/></div><div><label className="field-label" htmlFor="trading-fee">Fee per trade (%)</label><input id="trading-fee" type="number" min="0" step="0.01" value={fee} onChange={(e) => setFee(e.target.value)} className="input-field"/></div></div><div className="editor-actions"><button className="subtle-button" onClick={saveDraft}><Plus size={16}/> Save draft</button><button className="primary-button" onClick={parseDraft}><Sparkles size={17}/> Generate rule draft</button></div></section><aside className="studio-side"><div className="panel rule-preview"><div className="panel-header"><div><h3>Strategy configuration</h3><p>Preview of editable rules</p></div><span className="status-pill status-draft"><span className="status-dot"/>Draft</span></div><div className="preview-label">STRATEGY NAME</div><h4>{strategyName || "Untitled strategy"}</h4><div className="rule-line"><span>Asset</span><strong>{pair}</strong></div><div className="rule-line"><span>Category</span><strong>{strategyType}</strong></div><div className="rule-line"><span>Timeframe</span><strong>1 day</strong></div><div className="rule-line"><span>Starting capital</span><strong>{USD(Number(capital) || 0)}</strong></div><div className="rule-line"><span>Trading fee</span><strong>{fee}%</strong></div><div className="rule-line"><span>Risk per trade</span><strong>{risk}%</strong></div><label className="field-label risk-label" htmlFor="risk-slider">Risk per trade <span>{risk}%</span></label><input type="range" id="risk-slider" min="0.5" max="5" step="0.5" value={risk} onChange={(e) => setRisk(e.target.value)}/><div className="info-note"><ShieldCheck size={18}/><span>Actual risk controls must be enforced by the Python backend when connected.</span></div><button className="run-button" onClick={runDemo}><Play size={17} fill="currentColor"/> Run illustrative demo <ArrowRight size={16}/></button></div><div className="side-tip"><Sparkles size={20}/><div><strong>Design principle</strong><p>AI proposes the rules. A deterministic engine calculates the results. This prototype uses illustrative outcomes only.</p></div></div></aside></div>}
          {view === "backtests" && <><div className="backtest-intro"><div><span className="eyebrow">SIMULATION RESULTS</span><h2>{demoRun ? strategyName : activeStrategy.name}</h2><p>Illustrative equity chart for interface testing. No SoSoValue historical candle data has been fetched.</p></div><div className="inline-actions"><button className="subtle-button" onClick={exportDemo}><Download size={16}/> Export demo CSV</button><button className="primary-button" onClick={() => go("studio")}><SlidersHorizontal size={16}/> Edit strategy</button></div></div><div className="warning-strip"><CircleHelp size={19}/><span><b>Demo results only.</b> These values are fabricated interface fixtures, not verified returns or a real backtest. Connect the market data and Python engine for genuine results.</span></div><div className="metrics-grid"><MetricCard label="Illustrative return" value={`${Number(displayReturn)>=0?"+":""}${displayReturn}%`} change="Sample" positive note="not actual performance" icon={TrendingUp}/><MetricCard label="Illustrative win rate" value="63.8%" note="sample only" icon={BarChart3}/><MetricCard label="Illustrative drawdown" value="8.24%" note="sample only" icon={Activity}/><MetricCard label="Illustrative trades" value="42" note="sample only" icon={FlaskConical}/></div><div className="panel backtest-chart"><div className="panel-header"><div><h3>Equity curve</h3><p>Simulated data fixture • strategy vs benchmark</p></div><span className="demo-label">ILLUSTRATIVE DATA</span></div><div className="large-chart"><ResponsiveContainer width="100%" height="100%"><LineChart data={demoResult} margin={{top: 16,right:12,left:0,bottom:4}}><CartesianGrid stroke="#263142" vertical={false} strokeDasharray="3 5"/><XAxis dataKey="date" tickLine={false} axisLine={false} tick={{fill:"#7d8b9b",fontSize:12}} dy={10}/><YAxis tickFormatter={(v:number)=>`$${(v/1000).toFixed(1)}k`} tickLine={false} axisLine={false} tick={{fill:"#7d8b9b",fontSize:12}}/><Tooltip content={<EquityTooltip/>}/><Legend wrapperStyle={{fontSize:12,color:"#b0bdcc"}}/><Line type="monotone" dataKey="strategy" name="Strategy" stroke="#63e0b8" strokeWidth={3} dot={false} activeDot={{r:5}}/><Line type="monotone" dataKey="benchmark" name="Benchmark" stroke="#8b96b7" strokeDasharray="5 5" strokeWidth={2} dot={false}/></LineChart></ResponsiveContainer></div></div><div className="results-details"><div className="panel"><h3>Assumptions to implement</h3><div className="check-row"><CheckCircle2 size={17}/> Next-bar order execution</div><div className="check-row"><CheckCircle2 size={17}/> Fee and slippage modelling</div><div className="check-row"><CheckCircle2 size={17}/> Indicator warm-up windows</div><div className="check-row"><CheckCircle2 size={17}/> No look-ahead bias</div></div><div className="panel"><h3>Backtest status</h3><div className="rule-line"><span>Market data source</span><strong>Not connected</strong></div><div className="rule-line"><span>Engine</span><strong>Not connected</strong></div><div className="rule-line"><span>Results</span><strong>Demo fixture</strong></div><div className="rule-line"><span>Historical coverage</span><strong>Not available</strong></div></div></div></>}
          {view === "paper" && <><div className="warning-strip"><CircleHelp size={19}/><span>This is a <b>front-end paper-trading mockup</b>. Virtual positions and balances shown below are examples and are not being updated by live prices.</span></div><div className="paper-hero"><div><span className="eyebrow">VIRTUAL PORTFOLIO</span><div className="paper-balance">$11,842.00 <span className="paper-gain">+18.42% demo</span></div><p>Starting balance $10,000 · Sample portfolio only</p></div><button className={liveSimulation ? "subtle-button" : "primary-button"} onClick={() => { setLiveSimulation(!liveSimulation); toast("Demo strategy status toggled. No trading worker is running."); }}>{liveSimulation ? <Pause size={16}/> : <Play size={16}/>} {liveSimulation ? "Pause demo" : "Resume demo"}</button></div><div className="metrics-grid paper-stats"><MetricCard label="Open positions" value={liveSimulation ? "02" : "00"} note="illustrative" icon={Wallet}/><MetricCard label="Unrealized P&L" value="+$184" change="+1.56%" positive note="illustrative" icon={TrendingUp}/><MetricCard label="Virtual available cash" value="$4,280" note="illustrative" icon={BarChart3}/><MetricCard label="Active demo strategies" value={liveSimulation ? "01" : "00"} note="not connected to executor" icon={Activity}/></div><div className="panel"><div className="panel-header"><div><h3>Simulated open positions</h3><p>Static sample positions to demonstrate the portfolio layout</p></div><span className="demo-label">DEMO POSITIONS</span></div><div className="table-scroll"><table className="strategy-table"><thead><tr><th>Asset</th><th>Side</th><th>Quantity</th><th>Entry price</th><th>Demo P&L</th><th>Status</th></tr></thead><tbody><tr><td><strong>BTC / USD</strong></td><td>Long</td><td>0.035</td><td>$91,500</td><td className="positive">+$124.00</td><td><span className="status-pill status-live"><span className="status-dot"/>Illustrative</span></td></tr><tr><td><strong>ETH / USD</strong></td><td>Long</td><td>0.82</td><td>$2,840</td><td className="positive">+$60.00</td><td><span className="status-pill status-live"><span className="status-dot"/>Illustrative</span></td></tr></tbody></table></div></div></>}
          {view === "settings" && <div className="settings-layout"><div className="panel"><h3>Workspace preferences</h3><p className="setting-description">This prototype does not connect to user accounts or persist settings.</p><div className="setting-row"><div><strong>Theme</strong><small>Midnight graphite</small></div><span className="settings-chip">Dark</span></div><div className="setting-row"><div><strong>Market data</strong><small>SoSoValue integration</small></div><span className="settings-chip disconnected">Not connected</span></div><div className="setting-row"><div><strong>Backtesting engine</strong><small>FastAPI + Python service</small></div><span className="settings-chip disconnected">Not connected</span></div><div className="setting-row"><div><strong>Authentication</strong><small>Supabase Auth</small></div><span className="settings-chip disconnected">Not connected</span></div><button className="subtle-button" onClick={() => toast("This frontend starter doesn't have saved account settings yet.")}><RotateCcw size={16}/> Check connection status</button></div><div className="side-tip"><ShieldCheck size={21}/><div><strong>Built for trustworthy research</strong><p>Always distinguish sample data from actual backtests and simulated orders from live trades.</p></div></div></div>}
          <footer className="app-footer"><span>© StrategyLab AI · Research workspace prototype</span><span><span className="footer-dot"/> Demo mode · No real trading</span></footer>
        </div>
      </main>
      {notice && <div role="status" className="toast-notice"><Check size={17}/><span>{notice}</span><button onClick={()=>setNotice("")} aria-label="Dismiss"><X size={15}/></button></div>}
    </div>
  );
}

function StrategyTable({ strategies, onSelect }: { strategies: Strategy[]; onSelect: (strategy: Strategy) => void }) {
  return <div className="panel table-panel"><div className="table-scroll"><table className="strategy-table"><thead><tr><th>STRATEGY</th><th>ASSET</th><th>DEMO RETURN</th><th>DEMO WIN RATE</th><th>STATUS</th><th></th></tr></thead><tbody>{strategies.map((s) => <tr key={s.id}><td><div className="strategy-info"><div className="strategy-icon"><Activity size={17}/></div><div><strong>{s.name}</strong><small>{s.category}</small></div></div></td><td><span className="asset-label">{s.pair}</span></td><td className={s.returnPct > 0 ? "positive" : s.returnPct < 0 ? "negative" : ""}>{s.status === "Draft" ? "—" : `${s.returnPct > 0 ? "+" : ""}${s.returnPct.toFixed(2)}%`}</td><td>{s.status === "Draft" ? "—" : `${s.winRate}%`}</td><td><StatusPill status={s.status}/></td><td><button className="table-arrow" aria-label={`View ${s.name}`} onClick={() => onSelect(s)}><ChevronRight size={18}/></button></td></tr>)}</tbody></table>{strategies.length === 0 && <div className="empty-list">No strategies match your search.</div>}</div></div>;
}
