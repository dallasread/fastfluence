<template>
  <div class="page" v-if="page">
    <h1>
      {{page.title}}
    </h1>
    <ul class="page-nav">
      <li>
        <a :href="app.user.url + page._links.editui" class="edit-link" target="_blank">
          Edit
        </a>
      </li>
      <li>
        <a :href="app.user.url + page._links.webui" class="edit-link" target="_blank">
          View
        </a>
      </li>
      <li class="mobile-only">
        <a href="javascript:;" @click="app.toggleNav(true)" class="edit-link">
          Search
        </a>
      </li>
    </ul>
    <div v-if="page.body" v-html="body" ref="body"></div>
    <div v-else>
      Loading...
    </div>
  </div>
</template>

<script>
const POLL_INTERVAL = 1 * 60 * 1000

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

    setInterval(() => {
      if (this.page) {
        this.app.updatePage(this.page)
      }
    }, POLL_INTERVAL)
  },
  watch: {
    $route (to) {
      this.id = to.params.id
    },

    page (p) {
      let hash = window.location.hash.split('#')[2] || ''

      hash = `${p.title.replace(/\s/g, '')}-${hash.replace(/---/g, '^').replace(/-/g, '').replace(/\^/g, '-')}`

      const el = document.getElementById(hash)

      this.app.updatePage(p).then(() => {
        this.updateLinks()
      })

      if (p.body) { this.updateLinks() }

      if (hash && el) {
        el.scrollIntoView()
      } else {
        window.scrollTo(0, 0)
      }
    }
  },
  computed: {
    page () {
      return this.app.pages.find((page) => {
        return page.id === this.id
      })
    },
    body () {
      return this.page.body.replace(/<a\s/g, '<a target="_blank"').replace(/style=["']([^"'']+)["']/g, '')
    }
  },
  methods: {
    updateLinks () {
      if (!this.$refs.body) { return }

      document.title = this.page.title

      setTimeout(() => {
        var anchors = this.$refs.body.getElementsByTagName('a')

        anchors.forEach((anchor) => {
          var isPage = anchor.href.match(/\/wiki(.+)pages\/(\d+)\//)
          var isWiki = anchor.href.split(/\/wiki/)
          var id = anchor.getAttribute('data-linked-resource-id') || (isPage ? isPage[1] : undefined)

          if (id) {
            anchor.target = '_self'
            anchor.href = `#/pages/${id}`
          } else if (isWiki.length > 1) {
            anchor.href = `${this.app.user.url}${isWiki[1]}`
            anchor.target = '_blank'
          } else {
            anchor.target = '_blank'
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

    h1, h2, h3, h4, h5, h6, p, ul, ol, blockquote, table, pre, .page-nav {
      margin-bottom: 1rem;
    }

    hr {
      margin: 1em 0;
      height: 3px;
      background: #ddd;
      border: 0;

      @media (prefers-color-scheme: dark) {
        background: #444;
      }
    }

    h1, h2, h3, h4, h5, h6 {
      line-height: 1.3;
      margin-top: 2rem;
      word-break: break-word;
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

      @media (prefers-color-scheme: dark) {
        font-weight: bold;
        color: #aa7ee1;
      }
    }

    .update-item-profile {
      display: none;
    }

    pre, code {
      background: #eee;
      border-radius: 4px;
      font-family: monospace;

      @media (prefers-color-scheme: dark) {
        background: #333;
      }
    }

    code {
      padding: 0.5em;
    }

    pre {
      padding: 1em;
      overflow-x: auto;
    }

    table {
      width: 100%;

      td, th {
        border: 1px solid #ddd;
        padding: 0.5em;

        @media (prefers-color-scheme: dark) {
          border-color: #444;
        }
      }

      th {
        background: #eee;

        @media (prefers-color-scheme: dark) {
          background: #333;
        }
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

      @media (prefers-color-scheme: dark) {
        background: #444;
      }
    }

    .edit-link {
      font-size: 1rem;
    }

    .page-nav {
      margin-left: 0;

      li {
        display: inline-block;
        margin-right: 1em;

        a {
          display: inline-block;
        }
      }
    }
  }
</style>
