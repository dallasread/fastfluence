<template>
  <div class="search">
    <input type="search" v-model="q" placeholder="Search...">
    <ul>
      <template v-if="filteredPages.length">
        <li v-for="page in filteredPages" :key="page.id">
          <router-link :to="'/pages/' + page.id" :class="!!page.body ? '' : 'no-body'" @click="app.toggleNav(false)">
            {{page.title}}
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
</style>
