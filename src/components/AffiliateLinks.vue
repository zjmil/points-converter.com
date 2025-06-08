<template>
  <div class="affiliate-section">
    <h3>Need More Points?</h3>
    <p>Check out these credit card offers to earn more points:</p>
    <div class="affiliate-links">
      <div 
        v-for="link in links" 
        :key="link.name"
        class="affiliate-card"
      >
        <h4>{{ link.name }}</h4>
        <p><strong>Bonus:</strong> {{ link.bonus }}</p>
        <p><strong>Annual Fee:</strong> {{ link.annualFee }}</p>
        <a :href="link.url" target="_blank" rel="noopener">Learn More</a>
      </div>
      
      <div v-if="!links || links.length === 0" class="no-links">
        <p>Loading affiliate offers...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  links: Array
})
</script>

<style scoped>
.affiliate-section {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.affiliate-section h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.affiliate-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.affiliate-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.affiliate-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.affiliate-card h4 {
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.affiliate-card p {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.affiliate-card a {
  display: inline-block;
  background-color: #3498db;
  color: white;
  padding: 0.5rem 1rem;
  text-decoration: none;
  border-radius: 4px;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  transition: background-color 0.2s;
}

.affiliate-card a:hover {
  background-color: #2980b9;
}

.no-links {
  grid-column: 1 / -1;
  text-align: center;
  color: #7f8c8d;
  font-style: italic;
}
</style>