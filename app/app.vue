<template>
  <div class="app">
    <header>
      <h1>EIP-7702 Delegation</h1>
      <ClientOnly>
        <ConnectWallet />
      </ClientOnly>
    </header>
    <main>
      <ClientOnly>
        <DelegationManager />
        <template #fallback>
          <div style="text-align: center; padding: 2rem; color: #666;">Loading...</div>
        </template>
      </ClientOnly>
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f7f8fa;
  color: #1a1a1a;
}

.app {
  min-height: 100vh;
}

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
}

header h1 {
  font-size: 1.3rem;
}

main {
  padding: 2rem 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: opacity 0.15s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #3182ce;
  color: #fff;
}

.btn-secondary {
  background: #e2e8f0;
  color: #1a1a1a;
}

.btn-danger {
  background: #e53e3e;
  color: #fff;
}
</style>
