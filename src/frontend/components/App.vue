<template>
  <div id="wrapper">
    <div class="sidebar">
      <div>
        <div class="logo">
          <a href="/">
            <img src="/images/logo.svg" height="46px"/>
          </a>
        </div>
        <ul class="flex">
          <li class="category-section-title">
            <p>ニュースカテゴリ</p>
          </li>
          <li class="category-section" v-for="category in this.$store.state.categories" v-bind:key="category.name">
            <router-link v-bind:to="category.name">
              <span class="header-category-tab-text"># {{ category.title }}</span>
            </router-link>
          </li>
        </ul>
      </div>
    </div>
    <div class="contents">
      <div class="category-header">
        <div>
          <span class="category-title-text"># {{this.$store.state.currentCategory.title}}</span>
          <span class="category-description">{{this.$store.state.currentCategory.description}}</span>
        </div>
      </div>
      <!-- main view -->
      <div class="news-list">
        <router-view class="view" keep-alive>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  
}
</script>

<style lang="stylus">
*
  margin 0
  padding 0

html
  height 100%

body
  background-color #f5f5f5
  font-family Helvetica,Arial,sans-serif
  font-size 100%
  height 100%

.sidebar
  position fixed
  width 220px
  height 100%
  background-color #111

  li
    text-indent 20px
    line-height 35px
    a
      display block
      text-decoration none
      cursor pointer
      font-size 14px
      color #AAA
    a:hover
      text-decoration none
      font-size 15px
      color #FFF
      background-color #59a57c
      opacity 0.95

  .category-section-title
    font-size 14px
    color #EEE
    height 28px

.logo
  padding-left 8px
  padding-top 0px

.category-header
  position fixed
  top 0
  left 220px
  width 100%
  height 38px
  padding-left 10px
  line-height 38px
  background-color #FFF
  z-index 1000
  box-shadow 1px 1px 1px 0px #EEE
.category-title-text
  padding-left 14px
  font-size 17px
  font-weight bold
.category-description
  padding-left 6px
  font-size 12px
  color #999

.news-list
  background-color #f5f5f5
  padding-top 36px
  padding-left 230 + 6px
  padding-right 6px

</style>