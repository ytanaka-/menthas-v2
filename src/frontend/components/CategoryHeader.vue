<template>
  <div id="header">
    <div id="header-contents">
      <a href="/" target="_blank">
        <img src="/images/logo.svg" />
      </a>
      <span class="category-title-text">{{this.$store.state.currentCategory.title}}</span>
      <span class="category-description">{{this.$store.state.currentCategory.description}}</span>
    </div>
    <div id="header-category-tab">
      <ul class="flex">
        <li v-for="category in this.$store.state.categories" v-bind:key="category.name">
          <router-link v-bind:to="category.name">
            <span class="header-category-tab-text">{{ category.title }}</span>
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>

export default {
  name: 'CategoryHeader'
}
</script>

<style lang="stylus">
#header
  padding 0px
  background-color #FFF
  border-bottom 1px solid #e2e2e2
  position sticky
  position -webkit-sticky
  top 0
  z-index 1000
#header-contents
  width 1000px
  margin-right auto
  margin-left auto
  padding 3px 2px
  display -webkit-flex
  display flex
  -webkit-align-items center
  align-items center
  border-bottom 1px solid #777
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
  font-size 14px
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
  li a
    display block
    color #303030
  li a:visited
    color #303030
</style>