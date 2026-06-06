interface FlagProps {
  code: string
  size?: 'sm' | 'md' | 'lg'
}

const sizes = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-14 h-14' }

export function Flag({ code, size = 'md' }: FlagProps) {
  return (
    <img
      src={`https://flagcdn.com/w80/${code.toLowerCase()}.png`}
      alt={code}
      className={`${sizes[size]} rounded-full object-cover border border-olive`}
    />
  )
}
