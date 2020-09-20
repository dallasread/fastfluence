<template>
  <div>
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
        this.app.addPages(localPages)
      } else {
        this.fetchAllPages()
      }
    })
  },
  methods: {
    fetchAllPages () {
      this.app.fetch('/content/?type=page&limit=1000').then((data) => {
        if (data.size === data.limit) {
          alert('May need to handle pagination.')
        }

        this.app.addPages(data.results)
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
    margin-left: 22em;
    padding: 2em;
  }
</style>
