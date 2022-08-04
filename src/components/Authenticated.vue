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

const LIMIT = 1000

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
    fetchPageList (n = 0, results = []) {
      return this.app.fetch(`/content/?type=page&limit=${LIMIT}&start=${n * LIMIT}`).then((data) => {
        const newResults = results.concat(data.results)

        if (data.size === data.limit) {
          this.fetchPageList(n + 1, newResults)
        } else {
          this.app.updatePages(newResults)
        }
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
