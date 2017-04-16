<template>
  <div id="wrapper">
    <!-- header -->
    <CategoryHeader>
    </CategoryHeader>
    <!-- main view -->
    <router-view
      class="view"
      keep-alive>
    </router-view>
  </div>
</template>

<script>
import CategoryHeader from './CategoryHeader.vue'

export default {
  components: {
    CategoryHeader: CategoryHeader
  }
}
</script>

<style lang="stylus">
*
  margin 0
  padding 0
body
  width 1000px
  margin-right auto
  margin-left auto

</style>