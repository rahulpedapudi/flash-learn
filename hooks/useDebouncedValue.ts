import { useEffect, useState } from "react"

/**
 * Debounces a value by `delay` milliseconds.
 * Useful for search inputs to avoid rerendering heavy lists.
 */
export const useDebouncedValue = <T,>(value: T, delay = 300) => {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])

  return debounced
}
