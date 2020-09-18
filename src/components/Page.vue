<template>
  <div class="page" v-if="page">
    <h1>
      {{page.title}}
      <a :href="app.user.url + page._links.editui" class="edit-link" target="_blank">
        Edit
      </a>
    </h1>
    <div v-if="page.body" v-html="body" ref="body"></div>
    <div v-else>
      Loading...
    </div>
  </div>
</template>

<script>
export default {
  name: 'Page',
  props: ['app'],
  data () {
    return {
      id: ''
    }
  },
  mounted () {
    this.id = this.$route.params.id
  },
  watch: {
    $route (to) {
      this.id = to.params.id
    },

    page (p) {
      this.app.updatePage(p).then(() => {
        this.updateLinks()
      })

      if (p.body) { this.updateLinks() }
    }
  },
  computed: {
    page () {
      return this.app.pages.find((page) => {
        return page.id === this.id
      })
    },
    body () {
      return this.page.body.replace(/<a\s/g, '<a target="_blank"')
    }
  },
  methods: {
    updateLinks () {
      if (!this.$refs.body) { return }

      setTimeout(() => {
        var anchors = this.$refs.body.getElementsByTagName('a')

        anchors.forEach((anchor) => {
          var match = anchor.href.match(/\/wiki.+pages\/(\d+)\//)
          var id = anchor.getAttribute('data-linked-resource-id') || (match ? match[1] : undefined)

          if (id) {
            anchor.onclick = (e) => {
              e.preventDefault()
              this.$router.push(`/pages/${id}`)
            }
          }
        })
      }, 50)
    }
  }
}
</script>

<style lang="scss">
  main {
    line-height: 1.6;

    h1, h2, h3, h4, h5, h6, p, ul, ol, blockquote, table, pre {
      margin-bottom: 1rem;
    }

    hr {
      margin: 1em 0;
      height: 3px;
      background: #ddd;
      border: 0;
    }

    h1, h2, h3, h4, h5, h6 {
      line-height: 1.3;
      margin-top: 2rem;
    }

    h1 {
      font-weight: bold;
      font-size: 200%;
    }

    h2 {
      font-weight: bold;
      font-size: 150%;
    }

    h3 {
      font-weight: bold;
      font-size: 130%;
    }

    h4 {
      font-weight: bold;
      font-size: 120%;
    }

    h5 {
      font-weight: bold;
      font-size: 110%;
    }

    ol, ul {
      margin-left: 25px;

      li :last-child {
        margin-bottom: 0;
      }
    }

    ol {
      list-style: decimal;
    }

    ul {
      list-style: disc;
    }

    a {
      color: blue;
    }

    .update-item-profile {
      display: none;
    }

    pre, code {
      background: #eee;
      border-radius: 4px;
      font-family: monospace;
    }

    code {
      padding: 0.5em;
    }

    pre {
      padding: 1em;
    }

    table {
      width: 100%;

      td, th {
        border: 1px solid #ddd;
        padding: 0.5em;
      }

      th {
        background: #eee;
      }

      p {
        margin-bottom: 0;
      }
    }

    strong, b {
      font-weight: bold;
    }

    i, em {
      font-style: oblique;
    }

    [data-macro-name="note"] {
      background: #FFF5E7;
      padding: 1em;
      border-radius: 4px;

      :last-child {
        margin-bottom: 0;
      }
    }

    .edit-link {
      font-size: 1rem;
    }
  }
</style>
