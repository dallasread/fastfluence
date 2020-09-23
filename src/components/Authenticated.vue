<template>
  <div>
    <search :app="app" :class="app.showNav ? 'show-nav' : ''" />
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
        alert('Could not retrieve pages. Your credentials are incorrect OR your CORS proxy is not working. Log out and try again.')
      })
    }
  }
}
</script>

<style lang="scss">
  .search {
    background: #eee;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    text-align: center;
    width: 20em;
    overflow: auto;
    line-height: 1.6;
    border-right: 1px solid #ddd;

    @media (max-width: 780px) {
      width: auto;
      right: 0;
      display: none;

      &.show-nav {
        display: block;
      }
    }

    h2 {
      font-weight: bold;
      font-size: 200%;
      margin-top: 2em;
    }

    input[type="search"] {
      position: fixed;
      top: 0;
      left: 0;
      width: 20em;
      outline: none;
      padding: 0.5em 1em;

      @media (max-width: 780px) {
        width: 100%;
      }
    }

    ul {
      text-align: left;
      margin-top: 2.75em;

      a {
        display: block;
        padding: 0.5em 1em;

        &.inline {
          display: inline;
          padding: 0;
          color: blue;
        }
      }

      li {
        border-bottom: 1px solid #ddd;

        &.field, &.actions {
          padding: 1em;

          input {
            width: 100%;
            padding: 0.5em;
            border: 1px solid #ddd;
            border-radius: 4px;
          }

          button {
            width: 100%;
            padding: 0.5em;
            background: blue;
            color: #fff;
            border-radius: 4px;
            font-size: inherit;
            border: 0;
          }

          a {
            display: inline-block;
            color: blue;
            padding: 0;
          }
        }

        label {
          display: block;
        }
      }
    }
  }

  main {
    margin-left: 20em;
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
