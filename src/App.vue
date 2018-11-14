<style>
html,
body {
  height: 100%;
}

#app,
.layout {
  height: 100%;
}
</style>

<template>
  <div id="app">
    <div class="layout"><router-view /></div>
  </div>
</template>

<script>
export default {
  name: "app"
};
</script>
