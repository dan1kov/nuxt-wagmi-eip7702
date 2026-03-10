import { VueQueryPlugin } from '@tanstack/vue-query'
import { WagmiPlugin } from '@wagmi/vue'
import { http, createConfig } from '@wagmi/core'
import { mainnet, base, sepolia, bsc, arbitrum, optimism, polygon } from '@wagmi/vue/chains'
import { injected } from '@wagmi/connectors'

export const wagmiConfig = createConfig({
  chains: [mainnet, base, sepolia, bsc, arbitrum, optimism, polygon],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [sepolia.id]: http(),
    [bsc.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
  },
})

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(WagmiPlugin, { config: wagmiConfig })
  nuxtApp.vueApp.use(VueQueryPlugin)
})
