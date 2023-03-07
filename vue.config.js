module.exports = {
  publicPath: './',
  devServer: {
    proxy: {
      '/server': {
        target: 'http://192.168.1.232/server',
        changeOrigin: true,
        pathRewrite: {
          '^/server': '',
        },
      },
    },
  },
  chainWebpack: (config) => {
    config
      .plugin('html')
      .tap((args) => {
        // eslint-disable-next-line
        args[0].title = 'SAP Plans';
        return args;
      });
  },
};
