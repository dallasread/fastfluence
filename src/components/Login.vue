<template>
  <div>
    <div v-if="app.user.auth">
      <slot></slot>
    </div>
    <div v-else>
      <div class="search">
        <h2>Log In</h2>
        <form v-on:submit="logIn(user)">
          <ul>
            <li class="field">
              <label>Wiki URL</label>
              <input type="url" v-model="user.url">
            </li>
            <li class="field">
              <label>Email Address</label>
              <input type="email" v-model="user.email">
            </li>
            <li class="field">
              <label>API Key (likely from <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" class="inline">here</a>)</label>
              <input type="password" v-model="user.password">
            </li>
            <li class="field">
              <label>Proxy (eg. <a href="https://github.com/Rob--W/cors-anywhere" target="_blank">CORS Anywhere</a>)</label>
              <input type="url" v-model="user.proxy">
            </li>
            <li class="actions">
              <button>Log In!</button>
            </li>
          </ul>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Welcome',
  props: ['app'],
  data () {
    return {
      user: {}
    }
  },
  methods: {
    logIn (user) {
      this.app.logIn(user)
    }
  }
}
</script>
