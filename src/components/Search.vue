<template>
  <div class="search">
    <input type="search" v-model="q" placeholder="Search...">
    <ul>
      <template v-if="filteredPages.length">
        <li v-for="page in filteredPages" :key="page.id">
          <router-link :to="'/pages/' + page.id" :class="!!page.body ? '' : 'no-body'" @click="app.toggleNav(false)">
            {{page.title}}
            ({{page.score}})
          </router-link>
        </li>
      </template>
      <li class="footer">
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
      titleScore += countInstances(page.title, word) * 40
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

var DEBOUNCER

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

        // if (!val.length) {
        //   this.app.$router.push('/')
        // }
      }, 200)
    }
  },
  computed: {
    filteredPages () {
      var q = this.debounceQ

      if (q.length <= 3) {
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
  .search {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    text-align: center;
    width: 20em;
    overflow: auto;
    line-height: 1.6;
    border-right: 1px solid #ddd;
    background: #eee;

    @media (prefers-color-scheme: dark) {
      background: #111;
      border-right: 1px solid #444;
    }

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
      background: #ddd;

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

      a {
        display: block;
        padding: 0.5em 1em;

        &.inline {
          display: inline;
          padding: 0;
          color: blue;
        }

        &.router-link-exact-active {
          background: #999;
          color: #fff;

          @media (prefers-color-scheme: dark) {
            color: #f5d67b;
            background: #333;
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

        &.footer {
          position: fixed;
          bottom: 0;
          border-top: 1px solid #ddd;
          border-right: 1px solid #ddd;
          background: #eee;
          width: 20em;

          @media (max-width: 780px) {
            width: 100%;
          }

          @media (prefers-color-scheme: dark) {
            border-color: #444;
            background: #111;
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
