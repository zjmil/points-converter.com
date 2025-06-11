import { useRef } from 'react'

let idCounter = 0

export function useId(prefix = 'id') {
  const idRef = useRef(null)
  
  if (idRef.current === null) {
    idRef.current = `${prefix}-${++idCounter}`
  }
  
  return idRef.current
}