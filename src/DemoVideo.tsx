import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
  Sequence,
} from 'remotion'

const VOID = '#0A0A0B'
const SURFACE = '#141415'
const SURFACE_RAISED = '#1E1E20'
const BORDER = '#2A2A2D'
const EMBER = '#F97316'
const TEXT = '#F5F5F5'
const TEXT_SEC = '#A1A1AA'
const TEXT_MUTED = '#71717A'
const SUCCESS = '#22C55E'
const DANGER = '#EF4444'

const MODELS_DATA = [
  { name: 'Gemini 3 Flash Preview', provider: 'Google', correct: 98, p95: 1.8, cost: '$0.0008' },
  { name: 'Claude Sonnet 4.5', provider: 'Anthropic', correct: 96, p95: 2.1, cost: '$0.0052' },
  { name: 'GPT-5.2', provider: 'OpenAI', correct: 96, p95: 2.5, cost: '$0.0058' },
  { name: 'GPT-4o', provider: 'OpenAI', correct: 94, p95: 1.9, cost: '$0.0048' },
  { name: 'Gemini 3 Pro', provider: 'Google', correct: 94, p95: 2.8, cost: '$0.0041' },
  { name: 'Claude Opus 4.6', provider: 'Anthropic', correct: 92, p95: 4.2, cost: '$0.0180' },
  { name: 'GPT-5 Nano', provider: 'OpenAI', correct: 88, p95: 0.9, cost: '$0.0003' },
  { name: 'Llama 4 Scout', provider: 'Meta', correct: 82, p95: 1.4, cost: '$0.0004' },
]

const ALL_MODELS = [
  'GPT-5.2', 'GPT-4o', 'GPT-5 Nano', 'GPT-5 Image', 'Claude Opus 4.6',
  'Claude Sonnet 4.5', 'Claude Haiku 4.5', 'Gemini 3 Pro', 'Gemini 3 Flash',
  'Gemini 2.5 Flash Lite', 'Llama 4 Scout', 'Llama 4 Maverick', 'Mistral Small 3.2',
  'Pixtral 12B', 'Nova Lite', 'Qwen3 VL 8B', 'Qwen2.5 VL 72B', 'Seed 1.6 Flash',
  'InternVL3 78B', 'Gemma 3 27B',
]

// Scene 1: Upload Images + Expected JSON (frames 0-90)
function InputScene() {
  const frame = useCurrentFrame()

  const containerOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' })
  const labelOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' })

  // Receipt icon appears
  const receiptScale = interpolate(frame, [8, 18], [0, 1], { extrapolateRight: 'clamp' })

  const expectedText = `{
  "merchant": "Trader Joe's",
  "date": "2026-02-08",
  "items": [
    {"name": "Organic Milk", "price": 5.49},
    {"name": "Sourdough Bread", "price": 4.99},
    {"name": "Avocados (3pk)", "price": 3.99}
  ],
  "tax": 2.74,
  "total": 34.52
}`
  const expectedStart = 30
  const expectedChars = Math.max(0, Math.min(Math.floor((frame - expectedStart) * 4), expectedText.length))
  const expectedVisible = expectedText.slice(0, expectedChars)
  const expectedLabelOp = interpolate(frame, [25, 30], [0, 1], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{ background: VOID, padding: 48, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ display: 'flex', gap: 24 }}>
        {/* Left: Upload */}
        <div style={{ flex: 1 }}>
          <div style={{ opacity: labelOpacity, fontSize: 14, color: TEXT_MUTED, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 8 }}>
            📷 SAMPLE IMAGE
          </div>
          <div style={{
            opacity: containerOpacity,
            background: SURFACE,
            border: `1px solid ${BORDER}`,
            borderRadius: 12,
            padding: 24,
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 200,
          }}>
            <div style={{ fontSize: 64, transform: `scale(${receiptScale})` }}>🧾</div>
            <div style={{
              opacity: interpolate(frame, [18, 25], [0, 1], { extrapolateRight: 'clamp' }),
              fontSize: 14,
              color: TEXT_SEC,
              fontFamily: 'JetBrains Mono, monospace',
              marginTop: 8,
            }}>receipt_001.jpg</div>
            <div style={{
              opacity: interpolate(frame, [20, 28], [0, 1], { extrapolateRight: 'clamp' }),
              fontSize: 12,
              color: TEXT_MUTED,
              marginTop: 4,
            }}>Trader Joe's — Feb 8, 2026</div>
          </div>
        </div>

        {/* Right: Expected JSON */}
        <div style={{ flex: 1 }}>
          <div style={{ opacity: expectedLabelOp, fontSize: 14, color: TEXT_MUTED, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 8 }}>
            ✅ EXPECTED JSON
          </div>
          <div style={{
            opacity: expectedLabelOp,
            background: SURFACE,
            border: `1px solid ${BORDER}`,
            borderRadius: 12,
            padding: 20,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 13,
            color: SUCCESS,
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap' as const,
            minHeight: 200,
          }}>
            {expectedVisible}
            {expectedChars < expectedText.length && expectedChars > 0 && (
              <span style={{ opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0, color: EMBER }}>▌</span>
            )}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}

// Scene 2: Model Selection (frames 90-150)
function ModelSelectionScene() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  return (
    <AbsoluteFill style={{ background: VOID, padding: 48, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ fontSize: 14, color: TEXT_MUTED, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 16 }}>
        SELECTING VISION MODELS
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 10 }}>
        {ALL_MODELS.map((model, i) => {
          const delay = i * 2
          const isVisible = frame > delay
          const scale = isVisible ? spring({ frame: frame - delay, fps, config: { damping: 15, stiffness: 200 } }) : 0
          const isChecked = frame > delay + 8

          return (
            <div key={model} style={{
              transform: `scale(${scale})`,
              background: isChecked ? `${EMBER}15` : SURFACE,
              border: `1px solid ${isChecked ? EMBER : BORDER}`,
              borderRadius: 8,
              padding: '10px 16px',
              fontSize: 13,
              color: isChecked ? TEXT : TEXT_SEC,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <div style={{
                width: 18,
                height: 18,
                borderRadius: 4,
                border: `2px solid ${isChecked ? EMBER : BORDER}`,
                background: isChecked ? EMBER : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                color: 'white',
                fontWeight: 700,
              }}>
                {isChecked ? '✓' : ''}
              </div>
              {model}
            </div>
          )
        })}
      </div>
      <div style={{
        marginTop: 24,
        fontSize: 16,
        color: TEXT_SEC,
        opacity: interpolate(frame, [40, 50], [0, 1], { extrapolateRight: 'clamp' }),
      }}>
        {Math.min(ALL_MODELS.length, Math.floor(frame / 2.5))} of {ALL_MODELS.length} vision models selected · 50 runs each
      </div>
    </AbsoluteFill>
  )
}

// Scene 3: Processing (frames 150-270)
function ProcessingScene() {
  const frame = useCurrentFrame()
  const totalFrames = 120
  const modelsToShow = MODELS_DATA.slice(0, 8)

  const progress = interpolate(frame, [0, totalFrames - 10], [0, 100], { extrapolateRight: 'clamp' })
  const modelsComplete = Math.min(20, Math.floor(frame / 5.5))
  const runsComplete = Math.min(1000, Math.floor(frame * 9))

  return (
    <AbsoluteFill style={{ background: VOID, padding: 48, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ fontSize: 20, fontWeight: 600, color: TEXT, marginBottom: 4 }}>
        Running your benchmark...
      </div>
      <div style={{ fontSize: 14, color: TEXT_SEC, marginBottom: 6 }}>
        Testing model {Math.min(20, modelsComplete + 1)} of 20 · {runsComplete} / 1,000 total runs
      </div>
      <div style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 16 }}>
        50 runs per model for statistical significance
      </div>

      {/* Progress bar */}
      <div style={{ background: BORDER, borderRadius: 6, height: 8, overflow: 'hidden', marginBottom: 28 }}>
        <div style={{
          background: EMBER,
          height: '100%',
          width: `${progress}%`,
          borderRadius: 6,
          transition: 'width 0.1s',
          boxShadow: `0 0 12px ${EMBER}80`,
        }} />
      </div>

      {/* Model list */}
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
        {modelsToShow.map((model, i) => {
          const modelFrame = i * 12
          const isDone = frame > modelFrame + 15
          const isRunning = frame > modelFrame && !isDone

          const rowStart = Math.max(0, modelFrame - 5)
          const rowEnd = Math.max(rowStart + 1, modelFrame)
          const rowOp = interpolate(frame, [rowStart, rowEnd], [0.4, 1], { extrapolateRight: 'clamp' })
          const runCount = isDone ? 50 : isRunning ? Math.min(50, Math.floor((frame - modelFrame) * 3.5)) : 0

          return (
            <div key={model.name} style={{
              opacity: rowOp,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '8px 12px',
              background: isDone ? `${SUCCESS}08` : isRunning ? `${EMBER}08` : 'transparent',
              borderRadius: 8,
              fontSize: 14,
            }}>
              <span style={{ fontSize: 16 }}>
                {isDone ? '✅' : isRunning ? '⏳' : '⬜'}
              </span>
              <span style={{ color: TEXT, fontWeight: 500, width: 200 }}>{model.name}</span>
              <span style={{ color: TEXT_MUTED, fontFamily: 'JetBrains Mono, monospace', fontSize: 13, width: 70 }}>
                {runCount}/50 runs
              </span>
              <span style={{ color: isDone ? SUCCESS : isRunning ? EMBER : TEXT_MUTED, fontSize: 12 }}>
                {isDone ? `${model.correct}% correct` : isRunning ? 'Running...' : 'Queued'}
              </span>
            </div>
          )
        })}
      </div>
    </AbsoluteFill>
  )
}

// Scene 4: Results (frames 270-400)
function ResultsScene() {
  const frame = useCurrentFrame()

  const headerOp = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' })
  const headerY = interpolate(frame, [0, 15], [10, 0], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{ background: VOID, padding: 40, fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Winner banner */}
      <div style={{
        opacity: headerOp,
        transform: `translateY(${headerY}px)`,
        background: `${EMBER}12`,
        border: `1px solid ${EMBER}`,
        borderRadius: 12,
        padding: '16px 20px',
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 12, color: EMBER, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
            🏆 RECOMMENDED
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: TEXT, marginTop: 4 }}>
            Gemini 3 Flash Preview
          </div>
        </div>
        <div style={{ display: 'flex', gap: 24, fontSize: 14 }}>
          <div style={{ textAlign: 'center' as const }}>
            <div style={{ color: TEXT_MUTED, fontSize: 11, fontWeight: 600, textTransform: 'uppercase' as const }}>% Correct</div>
            <div style={{ color: SUCCESS, fontWeight: 700, fontSize: 20, fontFamily: 'JetBrains Mono, monospace' }}>
              {Math.min(98, Math.round(interpolate(frame, [15, 40], [0, 98], { extrapolateRight: 'clamp' })))}%
            </div>
          </div>
          <div style={{ textAlign: 'center' as const }}>
            <div style={{ color: TEXT_MUTED, fontSize: 11, fontWeight: 600, textTransform: 'uppercase' as const }}>P95</div>
            <div style={{ color: TEXT, fontWeight: 700, fontSize: 20, fontFamily: 'JetBrains Mono, monospace' }}>1.8s</div>
          </div>
          <div style={{ textAlign: 'center' as const }}>
            <div style={{ color: TEXT_MUTED, fontSize: 11, fontWeight: 600, textTransform: 'uppercase' as const }}>Cost/Run</div>
            <div style={{ color: SUCCESS, fontWeight: 700, fontSize: 20, fontFamily: 'JetBrains Mono, monospace' }}>$0.0008</div>
          </div>
        </div>
      </div>

      {/* Results table */}
      <div style={{ background: SURFACE, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
        {/* Header row */}
        <div style={{
          display: 'flex',
          padding: '10px 16px',
          background: SURFACE_RAISED,
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.05em',
          color: TEXT_MUTED,
        }}>
          <div style={{ width: 36 }}>#</div>
          <div style={{ flex: 1 }}>Model</div>
          <div style={{ width: 80, textAlign: 'center' as const }}>% Correct</div>
          <div style={{ width: 70, textAlign: 'center' as const }}>P95</div>
          <div style={{ width: 90, textAlign: 'right' as const }}>Cost/Run</div>
        </div>

        {MODELS_DATA.slice(0, 7).map((model, i) => {
          const delay = 15 + i * 6
          const rowOp = interpolate(frame, [delay, delay + 8], [0, 1], { extrapolateRight: 'clamp' })
          const rowY = interpolate(frame, [delay, delay + 8], [8, 0], { extrapolateRight: 'clamp' })
          const isWinner = i === 0

          const correctColor = model.correct >= 95 ? SUCCESS : model.correct >= 90 ? '#EAB308' : DANGER

          return (
            <div key={model.name} style={{
              opacity: rowOp,
              transform: `translateY(${rowY}px)`,
              display: 'flex',
              alignItems: 'center',
              padding: '10px 16px',
              fontSize: 14,
              borderBottom: `1px solid ${BORDER}`,
              background: isWinner ? `${EMBER}08` : 'transparent',
              borderLeft: isWinner ? `3px solid ${EMBER}` : '3px solid transparent',
            }}>
              <div style={{ width: 36, color: isWinner ? EMBER : TEXT_MUTED, fontWeight: 600 }}>
                {isWinner ? '🏆' : i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ color: TEXT, fontWeight: 500 }}>{model.name}</span>
                <span style={{ color: TEXT_MUTED, fontSize: 12, marginLeft: 8 }}>{model.provider}</span>
              </div>
              <div style={{ width: 80, textAlign: 'center' as const }}>
                <span style={{
                  background: `${correctColor}20`,
                  color: correctColor,
                  borderRadius: 9999,
                  padding: '2px 8px',
                  fontSize: 12,
                  fontWeight: 600,
                }}>{model.correct}%</span>
              </div>
              <div style={{ width: 70, textAlign: 'center' as const, fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: TEXT_SEC }}>
                {model.p95}s
              </div>
              <div style={{ width: 90, textAlign: 'right' as const, fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: TEXT_SEC }}>
                {model.cost}
              </div>
            </div>
          )
        })}
      </div>

      {/* Error diff preview */}
      <div style={{
        opacity: interpolate(frame, [65, 80], [0, 1], { extrapolateRight: 'clamp' }),
        marginTop: 12,
        background: SURFACE,
        border: `1px solid ${BORDER}`,
        borderRadius: 8,
        padding: '12px 16px',
        fontSize: 12,
        fontFamily: 'JetBrains Mono, monospace',
      }}>
        <div style={{ fontSize: 11, color: TEXT_MUTED, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 8, fontFamily: 'Inter, system-ui, sans-serif' }}>
          ⚠️ GPT-5 Nano — Where it missed
        </div>
        <div style={{ color: TEXT_MUTED }}>
          <span style={{ color: DANGER, textDecoration: 'line-through' }}>"tax": 2.47</span>
          {'  →  '}
          <span style={{ color: SUCCESS }}>"tax": 2.74</span>
          <span style={{ color: TEXT_MUTED, fontSize: 11 }}> (digit transposition)</span>
        </div>
      </div>

      {/* Savings callout */}
      <div style={{
        opacity: interpolate(frame, [80, 95], [0, 1], { extrapolateRight: 'clamp' }),
        marginTop: 12,
        background: `${SUCCESS}10`,
        border: `1px solid ${SUCCESS}30`,
        borderRadius: 8,
        padding: '12px 16px',
        fontSize: 14,
        color: SUCCESS,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        💰 Switch from GPT-4o → save <strong style={{ fontWeight: 700 }}>$144/mo</strong> at 1,000 extractions/day
      </div>
    </AbsoluteFill>
  )
}

export const DemoVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: VOID }}>
      <Sequence from={0} durationInFrames={90}>
        <InputScene />
      </Sequence>
      <Sequence from={90} durationInFrames={60}>
        <ModelSelectionScene />
      </Sequence>
      <Sequence from={150} durationInFrames={120}>
        <ProcessingScene />
      </Sequence>
      <Sequence from={270} durationInFrames={130}>
        <ResultsScene />
      </Sequence>
    </AbsoluteFill>
  )
}
