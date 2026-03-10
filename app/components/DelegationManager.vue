<script setup lang="ts">
import type { Address, Hex } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import { CHAINS_BY_ID } from '../config/chains'
import { selectedChainId } from '../composables/useDelegation'

const { address, isConnected, chain } = useConnection()
const {
  delegatedTo,
  isDelegated,
  isLoading,
  error,
  lastTxHash,
  checkDelegation,
  delegate,
  undelegate,
} = useDelegation()

const contractAddress = ref('')
const privateKey = ref('')
const usePrivateKey = ref(false)
const pkAddress = ref<Address | null>(null)

watch(privateKey, (val) => {
  try {
    if (val && val.startsWith('0x') && val.length === 66) {
      pkAddress.value = privateKeyToAccount(val as Hex).address
    } else {
      pkAddress.value = null
    }
  } catch {
    pkAddress.value = null
  }
})

const activeAddress = computed(() => {
  return usePrivateKey.value ? pkAddress.value : address.value
})

watch(
  [activeAddress, () => chain.value?.id, selectedChainId],
  ([addr]) => {
    if (addr) checkDelegation(addr as Address)
  },
  { immediate: true },
)

async function handleDelegate() {
  if (!contractAddress.value) return
  try {
    const pk = usePrivateKey.value ? (privateKey.value as Hex) : undefined
    await delegate(contractAddress.value as Address, pk)
  } catch {}
}

async function handleUndelegate() {
  try {
    const pk = usePrivateKey.value ? (privateKey.value as Hex) : undefined
    await undelegate(pk)
  } catch {}
}

function refresh() {
  const addr = activeAddress.value
  if (addr) checkDelegation(addr as Address)
}

const explorerUrl = computed(() => {
  const activeChain = usePrivateKey.value
    ? CHAINS_BY_ID[selectedChainId.value]
    : chain.value
  return activeChain?.blockExplorers?.default?.url ?? 'https://etherscan.io'
})
</script>

<template>
  <div class="delegation-manager">
    <!-- Signing Mode -->
    <div class="card">
      <h2>Signing Mode</h2>
      <div class="toggle-row">
        <label class="toggle-label">
          <input v-model="usePrivateKey" type="checkbox" />
          Use private key
        </label>
        <span class="hint">{{ usePrivateKey ? 'Sign with private key directly' : 'Sign via connected wallet' }}</span>
      </div>
      <div v-if="usePrivateKey" class="pk-input-group">
        <input
          v-model="privateKey"
          type="password"
          placeholder="0x... private key"
          class="input"
          autocomplete="off"
        />
        <div v-if="pkAddress" class="pk-address">
          Account: <span class="address-link">{{ pkAddress }}</span>
        </div>
      </div>
    </div>

    <!-- Current Status -->
    <div v-if="usePrivateKey ? pkAddress : isConnected" class="card">
      <h2>Delegation Status</h2>
      <div class="status-row">
        <span class="label">Status:</span>
        <span :class="['badge', isDelegated ? 'badge-active' : 'badge-inactive']">
          {{ isDelegated ? 'Delegated' : 'Not delegated' }}
        </span>
        <button class="btn btn-icon" title="Refresh" :disabled="isLoading" @click="refresh">
          ↻
        </button>
      </div>
      <div v-if="isDelegated && delegatedTo" class="status-row">
        <span class="label">Contract:</span>
        <a
          :href="`${explorerUrl}/address/${delegatedTo}`"
          target="_blank"
          class="address-link"
        >
          {{ delegatedTo }}
        </a>
      </div>
    </div>

    <!-- Delegate -->
    <div v-if="usePrivateKey ? pkAddress : isConnected" class="card">
      <h2>Delegate</h2>
      <p class="hint">Delegate your EOA to a smart contract via EIP-7702</p>
      <div class="input-group">
        <input
          v-model="contractAddress"
          type="text"
          placeholder="0x... contract address"
          class="input"
          :disabled="isLoading"
        />
        <button
          class="btn btn-primary"
          :disabled="isLoading || !contractAddress"
          @click="handleDelegate"
        >
          {{ isLoading ? 'Signing...' : 'Delegate' }}
        </button>
      </div>
    </div>

    <!-- Undelegate -->
    <div v-if="(usePrivateKey ? pkAddress : isConnected) && isDelegated" class="card">
      <h2>Remove Delegation</h2>
      <p class="hint">Remove the current delegation (delegates to zero address)</p>
      <button class="btn btn-danger" :disabled="isLoading" @click="handleUndelegate">
        {{ isLoading ? 'Signing...' : 'Remove Delegation' }}
      </button>
    </div>

    <!-- Error -->
    <div v-if="error" class="card card-error">
      <strong>Error:</strong> {{ error }}
    </div>

    <!-- Last TX -->
    <div v-if="lastTxHash" class="card">
      <span class="label">Last TX:</span>
      <a
        :href="`${explorerUrl}/tx/${lastTxHash}`"
        target="_blank"
        class="address-link"
      >
        {{ lastTxHash.slice(0, 10) }}...{{ lastTxHash.slice(-8) }}
      </a>
    </div>

    <div v-if="!(usePrivateKey ? pkAddress : isConnected)" class="card card-center">
      <p v-if="usePrivateKey">Enter a valid private key above</p>
      <p v-else>Connect your wallet to manage EIP-7702 delegation</p>
    </div>
  </div>
</template>

<style scoped>
.delegation-manager {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.25rem;
}

.card-center {
  text-align: center;
  color: #666;
}

.card-error {
  background: #fff5f5;
  border-color: #e53e3e;
  color: #c53030;
  word-break: break-word;
}

h2 {
  margin: 0 0 0.75rem;
  font-size: 1.1rem;
}

.hint {
  color: #666;
  font-size: 0.85rem;
  margin: 0 0 0.75rem;
}

.status-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.label {
  font-weight: 600;
  font-size: 0.9rem;
}

.badge {
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
}

.badge-active {
  background: #c6f6d5;
  color: #22543d;
}

.badge-inactive {
  background: #e2e8f0;
  color: #4a5568;
}

.input-group {
  display: flex;
  gap: 0.5rem;
}

.input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d0d0d0;
  border-radius: 8px;
  font-family: monospace;
  font-size: 0.85rem;
}

.address-link {
  font-family: monospace;
  font-size: 0.85rem;
  color: #3182ce;
  word-break: break-all;
}

.btn-icon {
  background: none;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  font-size: 1.1rem;
}

.toggle-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
}

.pk-input-group {
  margin-top: 0.5rem;
}

.pk-address {
  margin-top: 0.4rem;
  font-size: 0.8rem;
  color: #666;
  word-break: break-all;
}
</style>
