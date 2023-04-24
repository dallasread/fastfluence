<template>
  <login :app="app" v-if="!loading">
    <template v-slot>
      <authenticated :app="app">
        <router-view :app="app" />
      </authenticated>
    </template>
  </login>
</template>

<script>
import localforage from 'localforage'
import Login from '@/components/Login.vue'
import Authenticated from '@/components/Authenticated.vue'

const URL_CREATOR = window.URL || window.webkitURL

export default {
  name: 'App',
  components: {
    Authenticated,
    Login
  },
  data () {
    return {
      app: this,
      loading: true,
      showNav: false,
      user: {},
      spaces: {},
      pages: [],
      localStore: localforage.createInstance({
        name: 'fastfluence'
      })
    }
  },
  watch: {
    '$route' ($route) {
      if ($route.path !== '/') {
        this.localStore.setItem('latestPage', $route.path)
      }
    }
  },
  mounted () {
    window.fastFluence = this
    this.restoreUser()
  },
  methods: {
    restoreUser () {
      this.localStore.getItem('auth').then((auth) => {
        if (auth) {
          this.logIn(JSON.parse(atob(auth)))
          this.restorePage()
        } else {
          this.showNav = true
        }

        this.loading = false
      })
    },

    logIn (user) {
      this.user = user
      this.user.auth = btoa(JSON.stringify(user))
      this.localStore.setItem('auth', this.user.auth)
    },

    logOut () {
      this.localStore.removeItem('pages').then(() => {
        this.localStore.removeItem('auth').then(() => {
          window.location.reload()
        })
      })
    },

    restorePage () {
      if (this.$route.path !== '/') {
        return
      }

      this.localStore.getItem('latestPage').then((page) => {
        if (page) {
          this.$router.push(page)
        }
      })
    },

    updatePages (pages) {
      if (!this.pages.length) {
        this.pages = pages
      } else {
        pages.forEach((page) => {
          var found = this.pages.find((p) => {
            return page.id === p.id
          })

          if (found) {
            for (var key in page) {
              found[key] = page[key]
            }
          } else {
            this.pages.push(page)
          }
        })
      }

      this.setLocalPages(this.pages)
    },

    setLocalPages (pages) {
      return this.localStore.setItem('pages', JSON.parse(JSON.stringify(pages)))
    },

    getLocalPages () {
      return this.localStore.getItem('pages')
    },

    getPageContent (page) {
      return this.fetch(`/content/${page.id}?expand=body.view`).then((data) => {
        page.body = data.body.view.value || ''
        page.description = this.truncate(page.body, 150)
      })
    },

    getPageChildren (page) {
      return this.fetch(`/content/${page.id}/child/page`).then((data) => {
        page.childrenIds = data.results.map((p) => p.id)
      })
    },

    updatePage (page) {
      return Promise.all([
        this.getPageContent(page),
        this.getPageChildren(page)
      ]).then(() => {
        this.setLocalPages(this.pages)
      })
    },

    updateAllPages (skip) {
      var eta = Math.round(this.pages.length / 60)
      if (skip || confirm(`Do you want to fetch the content of all pages to store locally? Each request will be separated by 1 second so we don't hit any rate limiting issues (ETA ${eta} minutes for all pages). If you're brave, click this a bunch of times. We'll let you know when it is done. If you leave, it will pick up where it left off.`)) {
        var page = this.pages.find((page) => {
          return !page.body || !page.childrenIds
        })

        if (!page) {
          return alert('All pages are fetched!')
        }

        this.updatePage(page).then(() => {
          setTimeout(() => {
            this.updateAllPages(true)
          }, 1000)
        })
      }
    },

    fetchResource (path, done) {
      var auth = btoa(`${this.user.email}:${this.user.password}`)
      var url = `${this.user.url.replace(/\/$/, '')}`
      var proxy = this.user.proxy || ''

      if (proxy) { proxy = `${proxy.replace(/\/$/, '')}/` }

      return new Promise((resolve, reject) => {
        fetch(`${proxy}${url}/rest/api${path}`, {
          headers: {
            Authorization: `Basic ${auth}`
          }
        }).then((response) => {
          response.blob().then((data) => resolve(URL_CREATOR.createObjectURL(data)))
        }).catch(reject)
      })
    },

    fetch (path, done) {
      var auth = btoa(`${this.user.email}:${this.user.password}`)
      var url = `${this.user.url.replace(/\/$/, '')}`
      var proxy = this.user.proxy || ''

      if (proxy) { proxy = `${proxy.replace(/\/$/, '')}/` }

      return new Promise((resolve, reject) => {
        fetch(`${proxy}${url}/rest/api${path}`, {
          headers: {
            Authorization: `Basic ${auth}`
          }
        }).then((response) => {
          response.json().then((json) => {
            resolve(json)
          })
        }).catch(reject)
      })
    },

    sort (a, b) {
      if (a.score && b.score) {
        if (a.score > b.score) return -1
        if (a.score < b.score) return 1
        return 0
      }

      return a.title.localeCompare(b.title)
    },

    toggleNav (override) {
      if (typeof doShow === 'boolean') {
        this.showNav = override
      } else {
        this.showNav = !this.showNav
      }
    },

    toggleNavIfMobile (override) {
      if (window.outerWidth < 781) {
        this.toggleNav(override)
      }
    },

    truncate (str, maxLength) {
      const $div = document.createElement('div')

      $div.innerHTML = str

      $div.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, td, th, strong, b, em, i').forEach((node) => {
        node.innerHTML += ' '
      })

      str = $div.innerText.trim()

      if (str.length > maxLength) {
        return `${str.slice(0, maxLength)}...`
      } else {
        return str
      }
    }
  }
}
</script>

<style lang="scss">
/* http://meyerweb.com/eric/tools/css/reset/
   v2.0 | 20110126
   License: none (public domain)
*/

html, body, div, span, applet, object, iframe,
h1, h2, h3, h4, h5, h6, p, blockquote, pre,
a, abbr, acronym, address, big, cite, code,
del, dfn, em, img, ins, kbd, q, s, samp,
small, strike, strong, sub, sup, tt, var,
b, u, i, center,
dl, dt, dd, ol, ul, li,
fieldset, form, label, legend,
table, caption, tbody, tfoot, thead, tr, th, td,
article, aside, canvas, details, embed,
figure, figcaption, footer, header, hgroup,
menu, nav, output, ruby, section, summary,
time, mark, audio, video,
input, textarea, select {
    margin: 0;
    padding: 0;
    border: 0;
    font-size: 100%;
    font: inherit;
    vertical-align: baseline;
    color: inherit;
}
/* HTML5 display-role reset for older browsers */
article, aside, details, figcaption, figure,
footer, header, hgroup, menu, nav, section {
    display: block;
}
body {
    line-height: 1;
}
ol, ul {
    list-style: none;
}
blockquote, q {
    quotes: none;
}
blockquote:before, blockquote:after,
q:before, q:after {
    content: '';
    content: none;
}
table {
    border-collapse: collapse;
    border-spacing: 0;
}
a {
    color: inherit;
    text-decoration: inherit;
    text-transform: inherit;
    display: inline-block;
}
img {
    max-width: 100%;
}

html {
  box-sizing: border-box;
}

*, *:before, *:after {
  box-sizing: inherit;
}

html, body {
  color: #2c3e50;

  @media (prefers-color-scheme: dark) {
    background: #111;
    color: rgba(255, 255, 255, 0.7);
  }
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

input {
  border: 1px solid #eee;

  @media (prefers-color-scheme: dark) {
    border-color: #444;
  }
}
</style>
