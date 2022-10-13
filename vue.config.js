module.exports = {
  pwa: {
    themeColor: '#1C25C1',
    msTileColor: '#1C25C1',
    workboxOptions: {
      exclude: ['CNAME'],
      maximumFileSizeToCacheInBytes: 5000000
    }
  }
}
