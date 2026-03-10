import { WagmiPlugin } from '@wagmi/vue'
import { injected } from '@wagmi/connectors'
import { http, createConfig } from '@wagmi/core'
import { VueQueryPlugin } from '@tanstack/vue-query'

import { SUPPORTED_CHAINS, recordByChainId } from '../config/chains'

const transports = recordByChainId(() => http())

export const wagmiConfig = createConfig({
  chains: SUPPORTED_CHAINS,
  connectors: [injected()],
  transports,
})

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(WagmiPlugin, { config: wagmiConfig })
  nuxtApp.vueApp.use(VueQueryPlugin)
})
