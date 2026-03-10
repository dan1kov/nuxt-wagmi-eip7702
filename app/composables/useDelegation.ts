import { ref } from 'vue'
import {
  createPublicClient,
  createWalletClient,
  http,
  zeroAddress,
  type Address,
  type Chain,
  type Hash,
  type Hex,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { getChainId, getConnection } from '@wagmi/core'
import { mainnet, base, sepolia, bsc, arbitrum, optimism, polygon } from 'viem/chains'
import { wagmiConfig } from '../plugins/wagmi.client'

const chains: Record<number, Chain> = {
  [mainnet.id]: mainnet,
  [base.id]: base,
  [sepolia.id]: sepolia,
  [bsc.id]: bsc,
  [arbitrum.id]: arbitrum,
  [optimism.id]: optimism,
  [polygon.id]: polygon,
}

export function useDelegation() {
  const delegatedTo = ref<Address | null>(null)
  const isDelegated = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastTxHash = ref<Hash | null>(null)

  function getChain() {
    const chainId = getChainId(wagmiConfig)
    return chains[chainId] ?? sepolia
  }

  function getPublicClient() {
    const chain = getChain()
    return createPublicClient({ chain, transport: http() })
  }

  async function checkDelegation(address: Address) {
    isLoading.value = true
    error.value = null
    try {
      const publicClient = getPublicClient()
      const result = await publicClient.getDelegation({ address })
      if (result) {
        isDelegated.value = true
        delegatedTo.value = result
      } else {
        isDelegated.value = false
        delegatedTo.value = null
      }
    } catch (e: any) {
      error.value = e.message ?? 'Failed to check delegation'
      isDelegated.value = false
      delegatedTo.value = null
    } finally {
      isLoading.value = false
    }
  }

  async function sendWithPrivateKey(contractAddress: Address, privateKey: Hex): Promise<Hash> {
    const chain = getChain()
    const account = privateKeyToAccount(privateKey)

    const walletClient = createWalletClient({
      account,
      chain,
      transport: http(),
    })

    const authorization = await walletClient.signAuthorization({
      contractAddress,
      executor: 'self',
    })

    const hash = await walletClient.sendTransaction({
      authorizationList: [authorization],
      to: account.address,
      data: '0x',
      value: 0n,
    })

    return hash
  }

  async function delegate(contractAddress: Address, privateKey?: Hex): Promise<Hash> {
    isLoading.value = true
    error.value = null
    lastTxHash.value = null
    try {
      let hash: Hash
      let account: Address

      if (privateKey) {
        const acc = privateKeyToAccount(privateKey)
        account = acc.address
        hash = await sendWithPrivateKey(contractAddress, privateKey)
      } else {
        const connection = getConnection(wagmiConfig)
        account = connection.address!
        if (!account) throw new Error('Wallet not connected')

        const provider = (await connection.connector!.getProvider()) as any
        hash = await provider.request({
          method: 'eth_sendTransaction',
          params: [{
            from: account,
            to: account,
            type: '0x4',
            authorizationList: [{ authority: contractAddress }],
            value: '0x0',
            data: '0x',
          }],
        })
      }

      lastTxHash.value = hash

      const publicClient = getPublicClient()
      await publicClient.waitForTransactionReceipt({ hash, confirmations: 10 })
      await checkDelegation(account)
      return hash
    } catch (e: any) {
      error.value = e.shortMessage ?? e.message ?? 'Failed to delegate'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function undelegate(privateKey?: Hex): Promise<Hash> {
    isLoading.value = true
    error.value = null
    lastTxHash.value = null
    try {
      let hash: Hash
      let account: Address

      if (privateKey) {
        const acc = privateKeyToAccount(privateKey)
        account = acc.address
        hash = await sendWithPrivateKey(zeroAddress, privateKey)
      } else {
        const connection = getConnection(wagmiConfig)
        account = connection.address!
        if (!account) throw new Error('Wallet not connected')

        const provider = (await connection.connector!.getProvider()) as any
        hash = await provider.request({
          method: 'eth_sendTransaction',
          params: [{
            from: account,
            to: account,
            type: '0x4',
            authorizationList: [{ authority: zeroAddress }],
            value: '0x0',
            data: '0x',
          }],
        })
      }

      lastTxHash.value = hash

      const publicClient = getPublicClient()
      await publicClient.waitForTransactionReceipt({ hash, confirmations: 10 })
      await checkDelegation(account)
      return hash
    } catch (e: any) {
      error.value = e.shortMessage ?? e.message ?? 'Failed to undelegate'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  return {
    delegatedTo,
    isDelegated,
    isLoading,
    error,
    lastTxHash,
    checkDelegation,
    delegate,
    undelegate,
  }
}
