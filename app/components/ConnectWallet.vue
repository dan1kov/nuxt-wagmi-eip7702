<script setup lang="ts">
const { connect, connectors } = useConnect()
const { disconnect } = useDisconnect()
const { address, isConnected, chain } = useConnection()

useReconnect()
</script>

<template>
  <div class="connect-wallet">
    <template v-if="isConnected && address">
      <div class="account-info">
        <span class="address">{{ address.slice(0, 6) }}...{{ address.slice(-4) }}</span>
        <span v-if="chain" class="chain">{{ chain.name }}</span>
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
  justify-content: flex-end;
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

.chain {
  font-size: 0.8rem;
  color: #666;
  background: #e8f5e9;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}
</style>
