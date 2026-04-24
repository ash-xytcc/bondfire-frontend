import { useMemo } from 'react'
import {
  DEFAULT_PUBLIC_CONFIG,
  normalizePublicConfig,
} from './publicConfigSchema'

export function useResolvedConfig(config) {
  return useMemo(() => {
    return normalizePublicConfig(config || DEFAULT_PUBLIC_CONFIG || {})
  }, [config])
}
