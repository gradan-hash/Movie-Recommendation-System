<template>
  <div class="container mx-auto px-4 py-8">
    <div class="text-center py-12">
      <div class="text-6xl mb-4">🎬</div>
      <h1 class="text-3xl font-bold mb-4">Movie Details</h1>
      <p class="text-gray-400 mb-4">Movie ID: {{ $route.params.id }}</p>
      <p class="text-gray-400 mb-8">Full movie details page</p>
      <router-link
        to="/"
        class="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
      >
        Back to Home
      </router-link>
    </div>
  </div>
</template>
