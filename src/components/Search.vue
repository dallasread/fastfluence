<template>
  <div class="search">
    <input type="search" v-model="q" placeholder="Search...">
    <ul>
      <template v-if="filteredPages.length">
        <li v-for="page in filteredPages" :key="page.id">
          <router-link :to="'/pages/' + page.id" :class="!!page.body ? '' : 'no-body'">
            {{page.title}}
          </router-link>
        </li>
      </template>
      <li class="separator"></li>
      <li>
        <a href="javascript:;" v-on:click="app.logOut()">
          Log Out
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
import Cookies from 'js-cookie'

var DEBOUNCER

export default {
  name: 'Nav',
  props: ['app'],
  data () {
    return {
      q: Cookies.get('q') || '',
      debounceQ: ''
    }
  },
  watch: {
    q (val) {
      clearTimeout(DEBOUNCER)
      DEBOUNCER = setTimeout(() => {
        this.debounceQ = val.toLowerCase()
        Cookies.set('q', val)
      }, 200)
    }
  },
  computed: {
    filteredPages () {
      var q = this.debounceQ

      if (q.length <= 2) {
        return []
      }

      return this.app.pages.filter((page) => {
        return page.title.toLowerCase().indexOf(q) !== -1
      }).sort(this.app.sort)
    }
  }
}
</script>

<style lang="scss" scoped>
  .no-body {
    color: #aaa;
  }

  .separator {
    padding-bottom: 10em;
    border-bottom: 1px solid #ddd;
  }
</style>
