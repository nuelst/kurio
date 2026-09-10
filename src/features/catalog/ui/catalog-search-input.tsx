import { useEffect, useState } from 'react'

import { Input } from '@/components/ui/input'
import { useDebounce } from '@/shared/hooks/use-debounce'

interface CatalogSearchInputProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function CatalogSearchInput({ value, onChange, className }: CatalogSearchInputProps) {
  const [text, setText] = useState(value)
  const debouncedText = useDebounce(text, 400)

  useEffect(() => {
    setText(value)
  }, [value])

  useEffect(() => {
    if (debouncedText !== value) {
      onChange(debouncedText)
    }
  }, [debouncedText, value, onChange])

  return (
    <Input
      type="search"
      placeholder="Buscar NFTs"
      aria-label="Buscar NFTs"
      value={text}
      onChange={(event) => setText(event.target.value)}
      className={className}
    />
  )
}
