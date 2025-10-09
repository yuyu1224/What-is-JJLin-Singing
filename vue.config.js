const { defineConfig } = require('@vue/cli-service');
const webpack = require('webpack');

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        // 定义特性标志，false 或 true 根据需求选择
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false), // 或者 true
      }),
    ],
  },
});
