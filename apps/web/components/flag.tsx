import { getFlagCode } from '@/lib/fifa-codes'

interface FlagProps {
  code: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'w-6 h-6 text-base',
  md: 'w-10 h-10 text-2xl',
  lg: 'w-14 h-14 text-4xl',
}

export function Flag({ code, size = 'md' }: FlagProps) {
  const isoCode = getFlagCode(code) // from lib/fifa-codes.ts

  return (
    <span
      className={`fi fi-${isoCode} fis inline-block rounded-full border border-olive/40 bg-cover ${sizeClasses[size]}`}
      role="img"
      aria-label={code}
      title={code}
    />
  )
}
