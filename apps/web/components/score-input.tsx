'use client'

interface ScoreInputProps {
  value: number
  onChange: (v: number) => void
  disabled?: boolean
}

export function ScoreInput({ value, onChange, disabled }: ScoreInputProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.min(99, value + 1))}
        disabled={disabled}
        className="w-10 h-10 rounded-full bg-olive text-cream font-display text-xl disabled:opacity-40"
      >
        +
      </button>
      <input
        type="number"
        value={value}
        onChange={e => onChange(Math.max(0, Math.min(99, Number(e.target.value))))}
        disabled={disabled}
        className="w-16 h-16 text-center text-3xl font-display text-cream bg-bg-card border-2 border-gold rounded-xl disabled:opacity-40 outline-none"
        min={0}
        max={99}
      />
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        disabled={disabled}
        className="w-10 h-10 rounded-full bg-olive text-cream font-display text-xl disabled:opacity-40"
      >
        −
      </button>
    </div>
  )
}
