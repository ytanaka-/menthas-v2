<template>
  <div id="header">
    <div id="header-contents">
      <img src="/images/logo.svg"/>
      <span class="category-title-text">{{this.$store.state.currentCategory.title}}</span>
      <span class="category-description">{{this.$store.state.currentCategory.description}}</span>
    </div>
    <div id="header-category-tab">
      <ul class="flex">
        <li v-for="category in this.$store.state.categories">
          <span class="header-category-tab-text" >{{ category.title }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>

export default {
  name: 'CategoryHeader',

  created () {
    this.$store.dispatch("updateCategories", "top");
  }
}
</script>

<style lang="stylus">
#header
  padding 0px
  border-bottom 1px solid #e2e2e2
#header-contents
  padding 3px 2px
  display -webkit-flex
  display flex
  -webkit-align-items center
  align-items center
  border-bottom 1px solid #333
  img
    height 40px
  .category-title-text
    padding-left 12px
    font-size 16px
  .category-description
    padding-left 12px
    padding-top 1px
    font-size 12px
    color #999
#header-category-tab
  font-size 13px
  ul
    list-style-type none
    li
      padding 0px 5px
      margin 4px 3px
    li:hover
      background-color #ecf0f1
      cursor pointer

.flex
  display flex
  justify-content center
</style>