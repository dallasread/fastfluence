<template>
  <div class="page" v-if="page">
    <h1>
      {{page.title}}
    </h1>
    <ul class="ancestors-nav">
      <li v-for="ancestor in ancestors" :key="'ancestors-' + page.id + '-ancestor-' + ancestor.id">
        <router-link :to="'/pages/' + ancestor.id">
          {{ ancestor.title }}
        </router-link>
      </li>
    </ul>
    <ul class="page-nav">
      <li>
        <a :href="app.user.url + page._links.editui" target="_blank">
          Edit
        </a>
      </li>
      <li>
        <a :href="app.user.url + page._links.webui" target="_blank">
          View
        </a>
      </li>
      <li class="mobile-only">
        <a href="javascript:;" @click="app.toggleNav(true)">
          Search
        </a>
      </li>
    </ul>
    <div v-if="body" v-html="body" ref="body"></div>
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
      let el = document.getElementById(hash)

      if (!el) {
        hash = `${p.title.replace(/\s/g, '')}-${hash.replace(/---/g, '^').replace(/-/g, '').replace(/\^/g, '-')}`
        el = document.getElementById(hash)
      }

      this.app.updatePage(p)

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
    ancestors () {
      return this.getAncestors(this.page)
    },
    body () {
      if (!this.page.body) {
        return ''
      }

      var $wrapper = document.createElement('div')

      $wrapper.innerHTML = this.page.body

      var anchors = $wrapper.getElementsByTagName('a')

      anchors.forEach((anchor) => {
        if (anchor.fixed) {
          return
        }

        anchor.fixed = true

        var id = anchor.getAttribute('data-linked-resource-id')
        var page = (anchor.href.match(/\/pages\/(\d+)\//) || [])[1]
        var startsWithHash = anchor.href[0] === '#'
        var wikiURL = (anchor.href.match(/(\/spaces\/[^#]+)/) || [])[0]
        var hashSplat = anchor.href.split('#')
        var hash = hashSplat[1] ? `#${hashSplat[1]}` : ''

        if (startsWithHash) {
          anchor.target = '_self'
        } else if (id) {
          anchor.target = '_self'
          anchor.href = `#/pages/${id}${hash}`
        } else if (page) {
          anchor.target = '_self'
          anchor.href = `#/pages/${page}${hash}`
        } else if (wikiURL) {
          var found = this.app.pages.find((page) => {
            return page._links.webui === wikiURL
          })

          if (found) {
            anchor.href = `#/pages/${found.id}${hash}`
            anchor.target = '_self'
          } else {
            anchor.target = '_blank'
          }
        } else {
          anchor.target = '_blank'
        }
      })

      $wrapper.querySelectorAll('*').forEach((el) => {
        el.style = ''
      })

      $wrapper.querySelectorAll('[data-highlight-colour]').forEach((el) => {
        el.style = `border-left: 7px solid ${el.getAttribute('data-highlight-colour')}`
      })

      $wrapper.querySelectorAll('.inline-task-list').forEach((el) => {
        el.querySelectorAll('li').forEach((li) => {
          const isChecked = li.className.indexOf('checked') !== -1
          const checkedAttr = isChecked ? 'checked="checked"' : ''
          li.innerHTML = `<input type="checkbox" ${checkedAttr}> ${li.innerHTML}`
        })
      })

      return $wrapper.innerHTML
    }
  },
  methods: {
    getAncestors (page, ancestors) {
      ancestors = ancestors || []

      const ancestor = this.getAncestor(page)

      if (ancestor) {
        ancestors.unshift(ancestor)
        this.getAncestors(ancestor, ancestors)
      }

      return ancestors
    },

    getAncestor (page, ancestors) {
      return this.app.pages.find((p) => {
        return p.childrenIds && p.childrenIds.indexOf(page.id) !== -1
      })
    }
  }
}
</script>

<style lang="scss">
  .ancestors-nav {
    margin-left: 0;

    li {
      display: inline-block;

      &:before {
        content: '»';
        margin: 0 1em;
        opacity: 0.5;
      }

      &:first-child:before {
        display: none;
      }
    }
  }

  .page-nav {
    margin-left: 0;

    li {
      display: inline-block;

      &:before {
        content: '|';
        margin: 0 1em;
        opacity: 0.5;
      }

      &:first-child:before {
        display: none;
      }

      a {
        display: inline-block;
      }
    }
  }

  main {
    line-height: 1.6;

    h1, h2, h3, h4, h5, h6, p, ul, ol, blockquote, table, pre, .page-nav, [data-macro-name="note"], [data-macro-name="warning"], [data-macro-name="error"], [data-macro-name="success"] {
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

    pre, code, [data-username] {
      background: #eee;
      border-radius: 4px;

      @media (prefers-color-scheme: dark) {
        background: #333;
      }
    }

    [data-username] {
      display: inline;
      padding: 0.05em 0.25em;
    }

    pre, code {
      font-family: monospace;
    }

    code {
      padding: .25em .5em;
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

    [data-macro-name="note"], [data-macro-name="warning"], [data-macro-name="error"], [data-macro-name="success"] {
      background: #fff5e7;
      padding: 1em;
      border-radius: 4px;

      :last-child {
        margin-bottom: 0;
      }

      @media (prefers-color-scheme: dark) {
        background: #444;
      }

      &[data-macro-name="warning"], &[data-macro-name="error"] {
        border-left: 5px solid #ad1e04;

        @media (prefers-color-scheme: light) {
          background: #fdd3c8;
        }
      }

      &[data-macro-name="note"] {
        border-left: 5px solid #f5d67b;
      }

      &[data-macro-name="success"] {
        border-left: 5px solid #17b450;

        @media (prefers-color-scheme: light) {
          background: #dcfee0;
        }
      }
    }

    .inline-task-list {
      list-style: none;
      margin-left: 0px;

      input[type="checkbox"] {
        margin-right: 0.3em;
      }
    }
  }
</style>
