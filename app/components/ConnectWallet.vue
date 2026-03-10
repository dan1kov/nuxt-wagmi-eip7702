<script setup lang="ts">
import { SUPPORTED_CHAINS } from '../config/chains'
import { selectedChainId } from '../composables/useDelegation'

const { disconnect } = useDisconnect()
const { switchChain } = useSwitchChain()
const { connect, connectors } = useConnect()
const { address, isConnected, chain } = useConnection()

useReconnect()

const activeChainId = computed({
  get() {
    return isConnected.value ? (chain.value?.id ?? selectedChainId.value) : selectedChainId.value
  },
  set(id: number) {
    if (isConnected.value) {
      switchChain({ chainId: id })
    }
    else {
      selectedChainId.value = id
    }
  },
})
</script>

<template>
  <div class="connect-wallet">
    <select
      v-model="activeChainId"
      class="chain-select"
      :title="isConnected ? 'Switch network' : 'Select network'"
    >
      <option v-for="c in SUPPORTED_CHAINS" :key="c.id" :value="c.id">
        {{ c.name }}
      </option>
    </select>

    <template v-if="isConnected && address">
      <div class="account-info">
        <span class="address">{{ address.slice(0, 6) }}...{{ address.slice(-4) }}</span>
        <button class="btn btn-secondary" @click="disconnect()">Disconnect</button>
      </div>
    </template>
    <template v-else>
      <button
        v-for="connector in connectors"
        :key="connector.id"
        class="btn btn-primary"
        @click="connect({ connector })"
      >
        Connect {{ connector.name }}
      </button>
    </template>
  </div>
</template>

<style scoped>
.connect-wallet {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
}

.account-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.address {
  font-family: monospace;
  font-size: 0.9rem;
  background: #f0f0f0;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
}

.chain-select {
  padding: 0.4rem 0.6rem;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  font-size: 0.85rem;
  background: #fff;
  cursor: pointer;
}
</style>
