<template>
  <div class="welcome">
    <h1>Welcome to Fastfluence.</h1>
    <p v-if="app.pages.length"><strong>Your Fastfluence is ready!</strong></p>
    <p>Get started by <a href="javascript:;" @click="app.toggleNav(true)" class="mobile-only">searching</a><span class="desktop-only">searching</span> for something in the sidebar.</p>
    <p>As you view each page, they are stored in this browser's local storage (and kept up to date).</p>
    <p>For the best search results, you can <a href="javascript:;" @click="app.updateAllPages()">Download All Content</a> now ({{app.pagesWithoutContent.length.toLocaleString()}} out of {{app.pages.length.toLocaleString()}} downloaded).</p>
  </div>
</template>

<script>
export default {
  name: 'Welcome',
  props: ['app'],
  mounted () {
    if (this.$route.path === '/') {
      this.app.toggleNavIfMobile(false)
    }
  }
}
</script>
