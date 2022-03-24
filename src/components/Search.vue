<template>
  <div class="search">
    <input type="search" v-model="q" placeholder="Search...">
    <ul>
      <template v-if="filteredPages.length">
        <li v-for="page in filteredPages" :key="page.id">
          <router-link :to="'/pages/' + page.id" :class="!!page.body ? '' : 'no-body'" @click="app.toggleNav(false)">
            <p class="title" v-html="highlight(page.title, highlightRegex)"></p>
            <p class="description" v-if="page.description">{{page.description}}</p>
          </router-link>
        </li>
      </template>
    </ul>
    <ul class="footer">
      <li>
        <router-link to="/">
          Welcome
        </router-link>
      </li>
      <li>
        <a href="javascript:;" @click="app.logOut()">
          Log Out
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
const countInstances = (content, str) => {
  return (content || '').toLowerCase().split(str).length - 1
}

const WHITESPACE = /\s+/
const applyScores = (pages, q) => {
  const words = q.split(WHITESPACE).filter(function (str) {
    return str.length > 1
  })

  pages.forEach((page) => {
    let titleScore = 0
    let bodyScore = 0
    let score = 0

    words.forEach((word) => {
      const firstWordMultiplier = page.title.toLowerCase().indexOf(word) === 0 ? 100 : 1

      titleScore += countInstances(page.title, word) * 100 * firstWordMultiplier
      bodyScore += countInstances(page.body, word)
    })

    score += titleScore + bodyScore

    if (titleScore && bodyScore) {
      score *= 2
    }

    Object.defineProperty(page, 'score', {
      value: score,
      enumerable: false,
      writable: true,
      configurable: true
    })
  })
}

let DEBOUNCER

export default {
  name: 'Nav',
  props: ['app'],
  data () {
    return {
      q: '',
      debounceQ: ''
    }
  },
  mounted () {
    this.app.localStore.getItem('q').then((q) => {
      if (q) { this.q = this.debounceQ = q }
    })
  },
  watch: {
    q (val) {
      clearTimeout(DEBOUNCER)
      DEBOUNCER = setTimeout(() => {
        this.debounceQ = val.toLowerCase()
        this.app.localStore.setItem('q', val)
      }, 200)
    }
  },
  methods: {
    highlight (str, regex) {
      return str.replace(regex, (a) => {
        return `<mark>${a}</mark>`
      })
    }
  },
  computed: {
    highlightRegex () {
      return new RegExp(this.debounceQ, 'i')
    },

    filteredPages () {
      var q = this.debounceQ

      if (q.length < 2) {
        return []
      }

      applyScores(this.app.pages, q)

      return this.app.pages.filter((page) => {
        return page.score
      }).sort(this.app.sort)
    }
  }
}
</script>

<style lang="scss">
  .show-nav {
    @media (max-width: 780px) {
      .search {
        display: block;
      }

      main {
        display: none;
      }
    }
  }

  .search {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    text-align: center;
    width: 22em;
    overflow-y: auto;
    overflow-x: hidden;
    line-height: 1.6;
    border-right: 1px solid #ddd;
    background: #fff;

    @media (prefers-color-scheme: dark) {
      background: #000;
      border-right: 1px solid #444;
    }

    @media (max-width: 780px) {
      position: static;
      width: auto;
      right: 0;
      display: none;
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
      width: 22em;
      outline: none;
      padding: 0.5em 1em;
      background: #ddd;
      z-index: 999;

      @media (max-width: 780px) {
        width: 100%;
      }

      @media (prefers-color-scheme: dark) {
        background: #444;
      }
    }

    ul {
      text-align: left;
      margin-top: 2.75em;
      padding-bottom: 5em;

      &.footer {
        position: fixed;
        bottom: 0;
        border-top: 1px solid #ddd;
        border-right: 1px solid #ddd;
        background: #eee;
        width: 22em;
        margin-top: 0;
        padding-bottom: 0;

        @media (max-width: 780px) {
          width: 100%;
        }

        @media (prefers-color-scheme: dark) {
          border-color: #444;
          background: #111;
        }

        li {
          &:last-child {
            border-bottom: 0;
          }

          @media (prefers-color-scheme: dark) {
            border-color: #444;
            background: #111;
          }
        }
      }

      a {
        display: block;
        padding: 0.5em 1em;
        background: #eee;

        @media (prefers-color-scheme: dark) {
          background: #111;
        }

        &.inline {
          display: inline;
          padding: 0;
          color: blue;
        }

        &.router-link-exact-active {
          background: #fff;
          color: #8160AB;

          .title {
            font-weight: bold;
          }

          @media (prefers-color-scheme: dark) {
            color: #f5d67b;
            background: #333;
          }
        }

        .description {
          font-size: 80%;
          opacity: 0.65;
        }

        mark {
          color: #000;
          font-weight: bold;
          background: none;

          @media (prefers-color-scheme: dark) {
            color: #fff;
          }
        }
      }

      li {
        border-bottom: 1px solid #ddd;

        @media (prefers-color-scheme: dark) {
          border-color: #444;
        }

        &.field, &.actions {
          padding: 1em;

          label {
            display: block;
          }

          input {
            width: 100%;
            padding: 0.5em;
            border: 1px solid #ddd;
            border-radius: 4px;
            color: inherit;

            @media (prefers-color-scheme: dark) {
              border-color: #444;
              background: #444;
              color: #ddd;
            }
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
      }
    }
  }

  .no-body {
    color: #aaa;

    @media (prefers-color-scheme: dark) {
      color: #555;
    }
  }
</style>
