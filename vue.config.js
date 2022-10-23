module.exports = {
  pwa: {
    name: 'Fastfluence',
    themeColor: '#1C25C1',
    msTileColor: '#1C25C1',
    appleMobileWebAppCapable: 'yes',
    workboxOptions: {
      exclude: ['CNAME'],
      maximumFileSizeToCacheInBytes: 5000000
    }
  },
  css: {
    sourceMap: process.env.NODE_ENV === 'production'
  }
}
