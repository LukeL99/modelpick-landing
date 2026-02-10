import { useState } from 'react'
import {
  Zap, DollarSign, Target, Trophy, CheckCircle, Clock,
  ChevronDown, ChevronUp, Menu, X, ArrowRight, Play, Shield, Upload,
  AlertTriangle, Eye
} from 'lucide-react'

const MODELS = [
  { rank: 1, model: 'Gemini 3 Flash Preview', provider: 'Google', correct: 98, p95: '1.8s', p99: '2.4s', ttft: '0.3s', cost: '$0.0008', winner: true },
  { rank: 2, model: 'Claude Sonnet 4.5', provider: 'Anthropic', correct: 96, p95: '2.1s', p99: '3.0s', ttft: '0.4s', cost: '$0.0052', winner: false },
  { rank: 3, model: 'GPT-5.2', provider: 'OpenAI', correct: 96, p95: '2.5s', p99: '3.8s', ttft: '0.5s', cost: '$0.0058', winner: false },
  { rank: 4, model: 'GPT-4o', provider: 'OpenAI', correct: 94, p95: '1.9s', p99: '2.6s', ttft: '0.3s', cost: '$0.0048', winner: false },
  { rank: 5, model: 'Gemini 3 Pro', provider: 'Google', correct: 94, p95: '2.8s', p99: '4.1s', ttft: '0.6s', cost: '$0.0041', winner: false },
  { rank: 6, model: 'Claude Opus 4.6', provider: 'Anthropic', correct: 92, p95: '4.2s', p99: '5.8s', ttft: '0.8s', cost: '$0.0180', winner: false },
  { rank: 7, model: 'GPT-5 Nano', provider: 'OpenAI', correct: 88, p95: '0.9s', p99: '1.2s', ttft: '0.2s', cost: '$0.0003', winner: false },
  { rank: 8, model: 'Llama 4 Scout', provider: 'Meta', correct: 82, p95: '1.4s', p99: '2.0s', ttft: '0.3s', cost: '$0.0004', winner: false },
]

const FAQS = [
  {
    q: 'How does accuracy scoring work?',
    a: 'We compare each model\'s JSON output field-by-field against your expected output. A run only counts as "correct" if every field matches exactly. No fuzzy scoring — it either nailed it or it didn\'t.'
  },
  {
    q: 'Which models do you test?',
    a: '20 vision models from 9 providers: GPT-5.2, GPT-4o, GPT-5 Nano, GPT-5 Image (OpenAI), Claude Opus 4.6, Claude Sonnet 4.5, Claude Haiku 4.5 (Anthropic), Gemini 3 Pro, Gemini 3 Flash, Gemini 2.5 Flash Lite (Google), Llama 4 Scout, Llama 4 Maverick (Meta), Mistral Small 3.2, Pixtral 12B (Mistral), Nova Lite (Amazon), Qwen3 VL 8B, Qwen2.5 VL 72B (Qwen), Seed 1.6 Flash (ByteDance), InternVL3 78B, Gemma 3 27B (Google).'
  },
  {
    q: 'How long does a benchmark take?',
    a: 'About 8-12 minutes. We run each model 50 times to give you statistically reliable results.'
  },
  {
    q: 'What file types can I upload?',
    a: 'Images (JPEG, PNG, WebP), PDFs, and scanned documents. If a vision model can read it, we can test it.'
  },
  {
    q: 'Why 50 runs per model?',
    a: 'LLMs are non-deterministic. Running once tells you nothing about reliability. 50 runs gives you a true accuracy percentage you can trust for production decisions.'
  },
  {
    q: 'What structured formats are supported?',
    a: 'JSON is our primary format. We\'re adding CSV, XML, and custom schema validation soon.'
  },
  {
    q: 'Do I need an API key?',
    a: 'Nope. We handle everything. Just upload your images and pay.'
  },
  {
    q: 'Is my data private?',
    a: 'Your images and data are only used for benchmarking and deleted after 30 days. We never train on your data or share it.'
  },
  {
    q: 'What if I\'m not satisfied?',
    a: 'If we fail to deliver your report, full refund. No questions asked.'
  },
]

function CorrectBadge({ pct }: { pct: number }) {
  const color = pct >= 95 ? 'bg-success/15 text-success' : pct >= 90 ? 'bg-success/15 text-success' : pct >= 85 ? 'bg-warning/15 text-warning' : 'bg-danger/15 text-danger'
  return <span className={`${color} rounded-full px-2 py-0.5 text-xs font-semibold`}>{pct}%</span>
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-surface-border">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between py-5 text-left">
        <span className="font-medium text-text-primary pr-4">{q}</span>
        {open ? <ChevronUp className="shrink-0 text-text-muted" size={20} /> : <ChevronDown className="shrink-0 text-text-muted" size={20} />}
      </button>
      {open && <p className="pb-5 text-text-secondary leading-relaxed">{a}</p>}
    </div>
  )
}

function WhereItMissed() {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-8 mx-auto max-w-3xl">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-xl border border-surface-border bg-surface p-5 hover:bg-surface-raised transition-colors"
      >
        <div className="flex items-center gap-3">
          <AlertTriangle size={20} className="text-warning" />
          <div className="text-left">
            <div className="font-semibold text-text-primary">Where GPT-5 Nano missed (88% correct)</div>
            <div className="text-sm text-text-muted mt-0.5">See exactly which fields it got wrong</div>
          </div>
        </div>
        {open ? <ChevronUp className="text-text-muted" size={20} /> : <ChevronDown className="text-text-muted" size={20} />}
      </button>
      {open && (
        <div className="mt-2 rounded-xl border border-surface-border bg-surface p-6 overflow-x-auto">
          <p className="text-sm text-text-secondary mb-4">6 of 50 runs had errors. Here's a typical failure:</p>
          <div className="font-mono text-sm leading-relaxed space-y-1">
            <div className="text-text-muted">{'{'}</div>
            <div className="text-text-muted pl-4">{'"merchant":'} <span className="text-text-secondary">"Trader Joe's",</span></div>
            <div className="pl-4 flex items-start gap-2 flex-wrap">
              <span className="text-text-muted">{'"merchant":'}</span>
              <span className="text-red-400 line-through">"Trader Joes"</span>
              <span className="text-green-400">"Trader Joe's"</span>
              <span className="ml-2 text-xs text-red-400 bg-red-400/10 rounded px-1.5 py-0.5">missing apostrophe</span>
            </div>
            <div className="text-text-muted pl-4">{'"date":'} <span className="text-text-secondary">"2026-02-08",</span></div>
            <div className="text-text-muted pl-4">{'"items":'} <span className="text-text-secondary">[...],</span></div>
            <div className="pl-4 flex items-start gap-2 flex-wrap">
              <span className="text-text-muted">{'"tax":'}</span>
              <span className="text-red-400 line-through">2.47</span>
              <span className="text-green-400">2.74</span>
              <span className="ml-2 text-xs text-red-400 bg-red-400/10 rounded px-1.5 py-0.5">digit transposition</span>
            </div>
            <div className="text-text-muted pl-4">{'"total":'} <span className="text-text-secondary">34.52</span></div>
            <div className="text-text-muted">{'}'}</div>
          </div>
          <div className="mt-4 pt-4 border-t border-surface-border">
            <p className="text-sm text-text-muted">
              This is what "88% correct" looks like — the model gets <em>most</em> fields right, but transposes digits and drops punctuation under pressure. For production receipt parsing, that 12% failure rate means ~120 bad extractions per 1,000.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [mobileMenu, setMobileMenu] = useState(false)

  return (
    <div className="min-h-screen bg-void text-text-primary font-sans">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-surface-border/50 bg-void/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-4 md:px-6">
          <a href="#" className="text-xl font-bold tracking-tight">
            <span className="text-ember">Model</span>Pick
          </a>
          <div className="hidden items-center gap-6 md:flex">
            <a href="#how" className="text-sm text-text-secondary hover:text-text-primary transition-colors">How it Works</a>
            <a href="#pricing" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Pricing</a>
            <a href="#faq" className="text-sm text-text-secondary hover:text-text-primary transition-colors">FAQ</a>
            <a href="#cta" className="inline-flex items-center gap-2 rounded-lg bg-ember px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors">
              Run a Benchmark <ArrowRight size={16} />
            </a>
          </div>
          <button className="md:hidden text-text-secondary" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {mobileMenu && (
          <div className="flex flex-col gap-4 border-t border-surface-border px-4 pb-4 md:hidden">
            <a href="#how" onClick={() => setMobileMenu(false)} className="text-sm text-text-secondary">How it Works</a>
            <a href="#pricing" onClick={() => setMobileMenu(false)} className="text-sm text-text-secondary">Pricing</a>
            <a href="#faq" onClick={() => setMobileMenu(false)} className="text-sm text-text-secondary">FAQ</a>
            <a href="#cta" onClick={() => setMobileMenu(false)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-ember px-4 py-2.5 text-sm font-semibold text-white">
              Run a Benchmark <ArrowRight size={16} />
            </a>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(249,115,22,0.08)_0%,_transparent_60%)]" />
        <div className="relative mx-auto max-w-[1200px] px-4 pt-20 pb-16 md:px-6 md:pt-28 md:pb-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight md:text-[56px] lg:text-[64px]">
              Find the best vision model for your data extraction.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-text-secondary md:text-xl">
              Upload your images. Define your schema. We test 20 vision models, 50 times each. Get exact-match accuracy, latency, and cost — for receipts, invoices, documents, and forms.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <a href="#cta" className="inline-flex items-center gap-2 rounded-lg bg-ember px-6 py-3.5 text-base font-semibold text-white hover:bg-orange-600 transition-colors shadow-lg shadow-ember/20">
                Run a Benchmark — $14.99 <ArrowRight size={18} />
              </a>
              <a href="#how" className="inline-flex items-center gap-2 rounded-lg border border-surface-border px-6 py-3.5 text-base font-semibold text-text-secondary hover:bg-surface-raised hover:text-text-primary transition-colors">
                See how it works
              </a>
            </div>
            <p className="mt-6 text-sm text-text-muted">No API keys needed · Results in ~10 minutes · No account required</p>
          </div>

          {/* Demo Video */}
          <div className="mt-12 md:mt-16 mx-auto max-w-4xl">
            <div className="relative rounded-xl border border-surface-border bg-surface overflow-hidden shadow-2xl shadow-black/40">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-surface-border bg-surface-raised">
                <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                <span className="ml-3 text-xs text-text-muted font-mono">modelpick.ai — benchmark report</span>
              </div>
              <video
                src="/demo.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full"
                poster="/demo-poster.png"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="border-t border-surface-border bg-surface/50">
        <div className="mx-auto max-w-[1200px] px-4 py-16 md:px-6 md:py-24">
          <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl">How it works</h2>
          <p className="mt-4 text-center text-text-secondary">Three steps. Ten minutes. Done.</p>
          <div className="mt-12 grid gap-8 md:grid-cols-3 md:gap-12">
            {[
              { icon: <Upload size={28} />, step: '1', title: 'Upload Your Data', desc: 'Upload 3 sample images (receipts, invoices, documents) and the correct JSON representation of each.' },
              { icon: <Play size={28} />, step: '2', title: 'We Test 20 Vision Models', desc: 'Each model processes your images 50 times. We measure exact-match accuracy, latency, and cost.' },
              { icon: <Trophy size={28} />, step: '3', title: 'Get Your Report', desc: 'See which models get it right, where they miss, and what they cost. Plus our recommendation.' },
            ].map(({ icon, step, title, desc }) => (
              <div key={step} className="relative text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-ember/10 text-ember">{icon}</div>
                <div className="mt-1 text-xs font-semibold text-ember">STEP {step}</div>
                <h3 className="mt-3 text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-text-secondary leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example Report Preview */}
      <section className="border-t border-surface-border">
        <div className="mx-auto max-w-[1200px] px-4 py-16 md:px-6 md:py-24">
          <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl">See a real report</h2>
          <p className="mt-4 text-center text-text-secondary">Receipt Data Extraction — 20 vision models, 50 runs each</p>

          {/* Input Example */}
          <div className="mt-12 mx-auto max-w-3xl grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-surface-border bg-surface p-5">
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">📷 Input Image</div>
              <div className="rounded-lg bg-surface-raised border border-surface-border p-4 text-center">
                <div className="text-4xl mb-2">🧾</div>
                <div className="text-sm text-text-secondary font-mono">receipt_001.jpg</div>
                <div className="text-xs text-text-muted mt-1">Trader Joe's — Feb 8, 2026</div>
              </div>
            </div>
            <div className="rounded-xl border border-surface-border bg-surface p-5">
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">✅ Expected JSON</div>
              <pre className="rounded-lg bg-surface-raised border border-surface-border p-4 text-xs font-mono text-green-400 leading-relaxed overflow-x-auto">{`{
  "merchant": "Trader Joe's",
  "date": "2026-02-08",
  "items": [
    {"name": "Organic Milk", "price": 5.49},
    {"name": "Sourdough Bread", "price": 4.99},
    {"name": "Avocados (3pk)", "price": 3.99}
  ],
  "tax": 2.74,
  "total": 34.52
}`}</pre>
            </div>
          </div>

          {/* Recommendation Card */}
          <div className="mt-10 mx-auto max-w-2xl rounded-xl border border-ember bg-surface p-6 md:p-8 shadow-[0_0_30px_rgba(249,115,22,0.08)]">
            <div className="flex items-center gap-2 text-sm font-semibold text-ember uppercase tracking-wider">
              <Trophy size={16} /> Our Recommendation
            </div>
            <h3 className="mt-3 text-2xl font-semibold">Gemini 3 Flash Preview</h3>
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1.5"><Target size={14} className="text-success" /> 98% correct</span>
              <span className="flex items-center gap-1.5"><Zap size={14} className="text-ember-light" /> P95: 1.8s</span>
              <span className="flex items-center gap-1.5"><DollarSign size={14} className="text-success" /> $0.0008/run</span>
            </div>
            <p className="mt-4 text-text-secondary leading-relaxed">
              Gemini 3 Flash Preview achieves 98% exact-match accuracy at just $0.0008/run — 6.5x cheaper than GPT-4o with higher accuracy. At 1,000 extractions/day, that saves you $144/month.
            </p>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
              <DollarSign size={16} />
              <span>Switch from GPT-4o → save <strong>$144/mo</strong> at 1,000 extractions/day</span>
            </div>
          </div>

          {/* Ranked Table */}
          <div className="mt-8 mx-auto max-w-4xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border text-xs font-semibold uppercase tracking-wider text-text-muted">
                  <th className="px-3 py-3 text-left">Rank</th>
                  <th className="px-3 py-3 text-left">Model</th>
                  <th className="px-3 py-3 text-center">% Correct</th>
                  <th className="px-3 py-3 text-center">P95</th>
                  <th className="px-3 py-3 text-center">P99</th>
                  <th className="px-3 py-3 text-center">TTFT</th>
                  <th className="px-3 py-3 text-right">Cost/Run</th>
                </tr>
              </thead>
              <tbody>
                {MODELS.map((m) => (
                  <tr key={m.rank} className={`border-b border-surface-border transition-colors hover:bg-surface-raised ${m.winner ? 'bg-ember/5 border-l-2 border-l-ember' : ''}`}>
                    <td className="px-3 py-3 text-text-muted">{m.winner ? <Trophy size={16} className="text-ember" /> : m.rank}</td>
                    <td className="px-3 py-3">
                      <span className="font-medium">{m.model}</span>
                      <span className="ml-2 text-text-muted text-xs">{m.provider}</span>
                    </td>
                    <td className="px-3 py-3 text-center"><CorrectBadge pct={m.correct} /></td>
                    <td className="px-3 py-3 text-center font-mono text-text-secondary">{m.p95}</td>
                    <td className="px-3 py-3 text-center font-mono text-text-secondary">{m.p99}</td>
                    <td className="px-3 py-3 text-center font-mono text-text-secondary">{m.ttft}</td>
                    <td className="px-3 py-3 text-right font-mono text-text-secondary">{m.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-center text-sm text-text-muted">Showing top 8 of 20 models tested · 50 runs each</p>

          {/* Where It Missed */}
          <WhereItMissed />
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-surface-border bg-surface/50">
        <div className="mx-auto max-w-[1200px] px-4 py-16 md:px-6 md:py-24">
          <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl">What we test</h2>
          <p className="mt-4 text-center text-text-secondary">Every dimension that matters for structured data extraction</p>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: <Target size={24} />, title: 'Exact-Match Accuracy', desc: 'Does the model get it 100% right? We check field-by-field against your expected output across 50 runs.' },
              { icon: <Zap size={24} />, title: 'Latency', desc: 'P95 and P99 response times. Time to first token. Because averages lie.' },
              { icon: <DollarSign size={24} />, title: 'Cost Per Run', desc: 'Actual dollar cost from OpenRouter. Monthly projection at your volume.' },
              { icon: <Eye size={24} />, title: 'Error Analysis', desc: 'When a model fails, we show you exactly which fields it got wrong and how.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-surface-border bg-surface p-6 transition-all hover:translate-y-[-2px] hover:shadow-lg hover:shadow-black/20">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ember/10 text-ember">{icon}</div>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Models Tested */}
      <section className="border-t border-surface-border">
        <div className="mx-auto max-w-[1200px] px-4 py-16 md:px-6 md:py-24">
          <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl">20 vision models tested</h2>
          <p className="mt-4 text-center text-text-secondary">Every vision-capable model worth considering — from $0.0003 to $0.018 per run</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {['OpenAI', 'Anthropic', 'Google', 'Meta', 'Mistral', 'Amazon', 'Qwen', 'ByteDance', 'Baidu'].map((p) => (
              <div key={p} className="rounded-full border border-surface-border bg-surface px-5 py-2.5 text-sm font-medium text-text-secondary">
                {p}
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-text-muted">
            {['GPT-5.2', 'GPT-4o', 'GPT-5 Nano', 'GPT-5 Image', 'Claude Opus 4.6', 'Claude Sonnet 4.5', 'Claude Haiku 4.5', 'Gemini 3 Pro', 'Gemini 3 Flash', 'Gemini 2.5 Flash Lite', 'Llama 4 Scout', 'Llama 4 Maverick', 'Mistral Small 3.2', 'Pixtral 12B', 'Nova Lite', 'Qwen3 VL 8B', 'Qwen2.5 VL 72B', 'Seed 1.6 Flash', 'InternVL3 78B', 'Gemma 3 27B'].map((m) => (
              <span key={m} className="rounded-md bg-surface-raised px-2 py-1">{m}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-surface-border bg-surface/50">
        <div className="mx-auto max-w-[1200px] px-4 py-16 md:px-6 md:py-24">
          <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl">Simple pricing</h2>
          <p className="mt-4 text-center text-text-secondary">Spend $15, save $144/mo. No subscriptions required.</p>

          <div className="mt-12 mx-auto max-w-sm">
            <div className="rounded-xl border border-ember bg-surface p-8 text-center shadow-[0_0_40px_rgba(249,115,22,0.08)]">
              <p className="text-sm font-semibold uppercase tracking-wider text-ember">One Report</p>
              <div className="mt-3 text-5xl font-bold">$14.99</div>
              <p className="mt-2 text-sm text-text-muted">per benchmark report</p>
              <ul className="mt-6 space-y-3 text-left text-sm">
                {[
                  '20 vision models tested',
                  '50 runs per model for statistical significance',
                  'Exact-match accuracy scoring',
                  'P95/P99 latency data',
                  'Error analysis — see where models fail',
                  'Cost comparison at your volume',
                  'Shareable link & PDF export',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle size={16} className="mt-0.5 shrink-0 text-success" />
                    <span className="text-text-secondary">{item}</span>
                  </li>
                ))}
              </ul>
              <a href="#cta" className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ember px-6 py-3.5 text-base font-semibold text-white hover:bg-orange-600 transition-colors">
                Run a Benchmark <ArrowRight size={18} />
              </a>
            </div>
            <p className="mt-6 text-center text-sm text-text-muted">
              Coming soon: $29/mo for monthly re-benchmarking
            </p>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="border-t border-surface-border">
        <div className="mx-auto max-w-[1200px] px-4 py-16 md:px-6 md:py-20">
          <div className="grid gap-8 md:grid-cols-3 text-center">
            {[
              { icon: <Shield size={28} />, title: 'Data stays private', desc: 'Images deleted after 30 days. We never train on or share your data.' },
              { icon: <Clock size={28} />, title: 'Results in ~10 minutes', desc: 'No setup, no CLI, no YAML configs. Upload images and go.' },
              { icon: <DollarSign size={28} />, title: 'Money-back guarantee', desc: 'If we fail to deliver your report, full refund. No questions asked.' },
            ].map(({ icon, title, desc }) => (
              <div key={title}>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-raised text-text-secondary">{icon}</div>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-text-secondary">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-surface-border bg-surface/50">
        <div className="mx-auto max-w-[700px] px-4 py-16 md:px-6 md:py-24">
          <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl">FAQ</h2>
          <div className="mt-10">
            {FAQS.map((faq) => <FAQItem key={faq.q} q={faq.q} a={faq.a} />)}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section id="cta" className="border-t border-surface-border">
        <div className="mx-auto max-w-[1200px] px-4 py-16 md:px-6 md:py-24 text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            You're probably overpaying for GPT-4o to parse receipts.
          </h2>
          <p className="mt-4 text-lg text-text-secondary">Let's find out.</p>
          <a href="#" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-ember px-8 py-4 text-lg font-semibold text-white hover:bg-orange-600 transition-colors shadow-lg shadow-ember/20">
            Run a Benchmark — $14.99 <ArrowRight size={20} />
          </a>
          <p className="mt-6 text-sm text-text-muted">20 vision models · 50 runs each · exact-match accuracy</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-border bg-void">
        <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-sm text-text-muted">
              <span className="font-semibold text-text-secondary"><span className="text-ember">Model</span>Pick</span> © 2026
            </div>
            <div className="flex items-center gap-6 text-sm text-text-muted">
              <a href="#" className="hover:text-text-secondary transition-colors">Privacy</a>
              <a href="#" className="hover:text-text-secondary transition-colors">Terms</a>
              <a href="#" className="hover:text-text-secondary transition-colors">Twitter</a>
              <a href="#" className="hover:text-text-secondary transition-colors">GitHub</a>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-text-muted">Built by indie devs, for indie devs</p>
        </div>
      </footer>
    </div>
  )
}
