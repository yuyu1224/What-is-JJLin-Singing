<template>
  <div id="app">
    <PageSwitcher />
  </div>
</template>

<script>
// 引入 PageSwitcher 组件
import PageSwitcher from './components/PageSwitcher.vue';

export default {
  name: 'App',
  components: {
    PageSwitcher,
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin:0;
}
</style>
