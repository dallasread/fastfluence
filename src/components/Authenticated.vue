<template>
  <div :class="app.showNav ? 'show-nav' : ''">
    <search :app="app" />
    <main>
      <slot :app="app"></slot>
    </main>
  </div>
</template>

<script>
import Search from '@/components/Search.vue'
export default {
  name: 'Authenticated',
  props: ['app'],
  components: {
    Search
  },
  mounted () {
    this.app.getLocalPages().then((localPages) => {
      if (localPages && localPages.length) {
        this.app.updatePages(localPages)
      }

      this.fetchPageList().then(() => {
        setInterval(() => {
          this.fetchPageList()
        }, 15 * 60 * 1000)
      })
    })
  },
  methods: {
    fetchPageList () {
      return this.app.fetch('/content/?type=page&limit=1000').then((data) => {
        if (data.size === data.limit) {
          alert('May need to handle pagination.')
        }

        this.app.updatePages(data.results)
      }).catch(() => {
        alert('Could not retrieve pages. Your credentials are incorrect OR your CORS proxy is not working. Try refreshing the page or logging out.')
      })
    }
  }
}
</script>

<style lang="scss">
  main {
    margin-left: 22em;
    padding: 2em;

    @media (max-width: 780px) {
      margin-left: 0;
      padding: 1em;
    }

    .page > h1 {
      margin-top: 0;
    }
  }

  @media (min-width: 781px) {
    .mobile-only {
      display: none !important;
    }
  }

  @media (max-width: 780px) {
    .desktop-only {
      display: none !important;
    }
  }
</style>
