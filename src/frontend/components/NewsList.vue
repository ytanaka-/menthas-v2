<template>
  <div id="contents">
    <div class="page-item" v-for="page in this.$store.state.pages">
      <span>{{page.title}}</span>
    </div>
  </div>
</template>

<script>

export default {
  name: 'NewsList',

  created () {
    this.$store.dispatch("updatePages", "top");
  }
}
</script>

<style lang="stylus">

</style>