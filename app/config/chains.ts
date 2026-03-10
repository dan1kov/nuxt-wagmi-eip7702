import { mainnet, base, sepolia, bsc, arbitrum, optimism, polygon } from 'viem/chains'
import type { Chain } from 'viem'

export const SUPPORTED_CHAINS = [
  mainnet,
  base,
  sepolia,
  bsc,
  arbitrum,
  optimism,
  polygon,
] as const

export function recordByChainId<V>(fn: (chain: Chain) => V): Record<number, V> {
  return Object.fromEntries(SUPPORTED_CHAINS.map((c) => [c.id, fn(c)]))
}

export const CHAINS_BY_ID = recordByChainId((c) => c)
