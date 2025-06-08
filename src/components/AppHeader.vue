<template>
  <header>
    <div class="container">
      <h1>Points Converter</h1>
      <p class="tagline">Convert between loyalty points programs with current exchange rates</p>
    </div>
  </header>
</template>

<style scoped>
header {
  background-color: #2c3e50;
  color: white;
  padding: 2rem 0;
  text-align: center;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.tagline {
  font-size: 1.1rem;
  opacity: 0.9;
}

@media (max-width: 768px) {
  h1 {
    font-size: 2rem;
  }
}
</style>