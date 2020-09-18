<template>
  <div class="welcome">
    <h1>Welcome to Fastfluence.</h1>
    <p v-if="app.pages.length"><strong>Your Fastfluence is ready!</strong></p>
    <p>Get started by searching for something in the sidebar.</p>
    <p>Pages are stored in this browser's local storage as you view them.</p>
    <p>As a bonus, you can <a href="javascript:;" v-on:click="app.updateAllPages()">Download All Content</a> now.</p>
  </div>
</template>

<script>
export default {
  name: 'Welcome',
  props: ['app']
}
</script>
