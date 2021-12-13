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
    <p v-if="isArchived" data-macro-name="error">
      This page is archived.
    </p>
    <div v-if="body" v-html="body" ref="body"></div>
    <div v-else>
      Loading...
    </div>
  </div>
</template>

<script>
import hljs from 'highlight.js'

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
      const splat = window.location.hash
      let hash = splat.split('#').slice(2, splat.length).join('#') || ''
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

      if (typeof this.$el.querySelectorAll !== 'function') {
        return
      }

      this.$el.querySelectorAll('img').forEach((el) => {
        const resourceId = el.getAttribute('data-linked-resource-id')

        if (resourceId) {
          const height = el.getAttribute('data-height')
          const width = el.getAttribute('data-width')

          if (height && width) {
            el.className = 'loading'
            el.style.aspectRatio = parseInt(width) / parseInt(height)
            el.style.width = '100%'
          }

          this.app.fetchResource(`/content/${this.page.id}/child/attachment/${resourceId}/download`)
            .then((src) => {
              el.className = ''
              el.src = src
            })
        }
      })
    }
  },
  computed: {
    page () {
      return this.app.pages.find((page) => {
        return page.id === this.id
      })
    },
    isArchived () {
      return this.page.status === 'archived'
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

      $wrapper.querySelectorAll('.syntaxhighlighter-pre').forEach((el) => {
        hljs.highlightElement(el)
      })

      $wrapper.querySelectorAll('[data-emoji-id]').forEach((el) => {
        const emoji = document.createElement('span')
        const wikiURL = el.src.match(/\/wiki(\/.+)/)[1]
        const id = el.getAttribute('data-emoji-id') || ''
        // const fallback = el.getAttribute('data-emoji-fallback')

        if (isNaN(Number(`0x${id}`))) {
          el.src = `${this.app.user.url}${wikiURL}`
        } else if (wikiURL) {
          emoji.innerHTML = `&#x${id};`
          el.parentNode.insertBefore(emoji, el.nextSibling)
          el.parentNode.removeChild(el)
        }
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

    h1, h2, h3, h4, h5, h6, p, ul, ol, blockquote, table, pre, .page-nav, [data-macro-name="note"], [data-macro-name="warning"], [data-macro-name="error"], [data-macro-name="success"], [data-macro-name="info"], [data-macro-name="panel"] {
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

    pre, code, [data-username], .aui-lozenge, .syntaxhighlighter-pre {
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

    img.loading {
      background: #eee;

      @media (prefers-color-scheme: dark) {
        background: #333;
      }
    }

    table {
      width: 100%;
     table-layout: fixed;

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

    .aui-lozenge {
      font-size: 0.85em;
      font-weight: bold;
      padding: 0.15em 0.5em;
      background: #eee;
      display: inline;

      @media (prefers-color-scheme: dark) {
        background: #333;
      }

      &.aui-lozenge-success {
        background: #17b450;
        color: #dcfee0;

        @media (prefers-color-scheme: light) {
          background: #dcfee0;
          color: #17b450;
        }
      }

      &.aui-lozenge-complete {
        background: #35c9f6;
        color: #cff0fa;

        @media (prefers-color-scheme: light) {
          background: #cff0fa;
          color: #35c9f6;
        }
      }
    }

    [data-macro-name="panel"],
    [data-macro-name="note"],
    [data-macro-name="info"],
    [data-macro-name="warning"],
    [data-macro-name="error"],
    [data-macro-name="success"] {
      background: #fff5e7;
      padding: 1em;
      border-radius: 4px;

      :last-child {
        margin-bottom: 0;
      }

      @media (prefers-color-scheme: dark) {
        background: #333;
      }

      &[data-macro-name="panel"] {
        border-left: 5px solid #803bc7;

        @media (prefers-color-scheme: light) {
          background: #e5e8fd;
        }
      }

      &[data-macro-name="warning"], &[data-macro-name="error"] {
        border-left: 5px solid #ad1e04;

        @media (prefers-color-scheme: light) {
          background: #fdd3c8;
        }
      }

      &[data-macro-name="note"] {
        border-left: 5px solid #35c9f6;

        @media (prefers-color-scheme: light) {
          background: #cff0fa;
        }
      }

      &[data-macro-name="info"] {
        border-left: 5px solid #35c9f6;

        @media (prefers-color-scheme: light) {
          background: #cff0fa;
        }
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

  pre code.hljs {
    display: block;
    overflow-x: auto;
    padding: 1em;
  }

  code.hljs{
    padding: 3px 5px;
  }

  /*!
    Theme: GitHub
    Description: Light theme as seen on github.com
    Author: github.com
    Maintainer: @Hirse
    Updated: 2021-05-15

    Outdated base version: https://github.com/primer/github-syntax-light
    Current colors taken from GitHub's CSS
  */
  .hljs{color:#24292e;background:#fff}.hljs-doctag,.hljs-keyword,.hljs-meta .hljs-keyword,.hljs-template-tag,.hljs-template-variable,.hljs-type,.hljs-variable.language_{color:#d73a49}.hljs-title,.hljs-title.class_,.hljs-title.class_.inherited__,.hljs-title.function_{color:#6f42c1}.hljs-attr,.hljs-attribute,.hljs-literal,.hljs-meta,.hljs-number,.hljs-operator,.hljs-selector-attr,.hljs-selector-class,.hljs-selector-id,.hljs-variable{color:#005cc5}.hljs-meta .hljs-string,.hljs-regexp,.hljs-string{color:#032f62}.hljs-built_in,.hljs-symbol{color:#e36209}.hljs-code,.hljs-comment,.hljs-formula{color:#6a737d}.hljs-name,.hljs-quote,.hljs-selector-pseudo,.hljs-selector-tag{color:#22863a}.hljs-subst{color:#24292e}.hljs-section{color:#005cc5;font-weight:700}.hljs-bullet{color:#735c0f}.hljs-emphasis{color:#24292e;font-style:italic}.hljs-strong{color:#24292e;font-weight:700}.hljs-addition{color:#22863a;background-color:#f0fff4}.hljs-deletion{color:#b31d28;background-color:#ffeef0}

  @media (prefers-color-scheme: dark) {
    /*!
      Theme: GitHub Dark
      Description: Dark theme as seen on github.com
      Author: github.com
      Maintainer: @Hirse
      Updated: 2021-05-15

      Outdated base version: https://github.com/primer/github-syntax-dark
      Current colors taken from GitHub's CSS
    */
    .hljs{color:#c9d1d9;background:#0d1117}.hljs-doctag,.hljs-keyword,.hljs-meta .hljs-keyword,.hljs-template-tag,.hljs-template-variable,.hljs-type,.hljs-variable.language_{color:#ff7b72}.hljs-title,.hljs-title.class_,.hljs-title.class_.inherited__,.hljs-title.function_{color:#d2a8ff}.hljs-attr,.hljs-attribute,.hljs-literal,.hljs-meta,.hljs-number,.hljs-operator,.hljs-selector-attr,.hljs-selector-class,.hljs-selector-id,.hljs-variable{color:#79c0ff}.hljs-meta .hljs-string,.hljs-regexp,.hljs-string{color:#a5d6ff}.hljs-built_in,.hljs-symbol{color:#ffa657}.hljs-code,.hljs-comment,.hljs-formula{color:#8b949e}.hljs-name,.hljs-quote,.hljs-selector-pseudo,.hljs-selector-tag{color:#7ee787}.hljs-subst{color:#c9d1d9}.hljs-section{color:#1f6feb;font-weight:700}.hljs-bullet{color:#f2cc60}.hljs-emphasis{color:#c9d1d9;font-style:italic}.hljs-strong{color:#c9d1d9;font-weight:700}.hljs-addition{color:#aff5b4;background-color:#033a16}.hljs-deletion{color:#ffdcd7;background-color:#67060c}
  }
</style>
