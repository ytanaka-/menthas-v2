<template>
  <div id="contents">
    <div id="page-items">
      <template v-for="(page,index) in this.$store.state.pages">
        <div class="item" v-bind:key="page.url">
          <div class="category-color-bar">
            <div class="category-color-bar-main"
                 v-bind:style="{ backgroundColor: page.categoryColor}">
              <a class="category-text">
                <span class="category-name">{{page.category}}</span>
              </a>
            </div>
          </div>
          <div class="thumbnail-box">
            <a v-bind:href="page.url"
               target="_blank">
              <img v-bind:src="page.thumbnail"
                   onerror="this.style.display='none'" />
            </a>
          </div>
          <div class="item-footer">
            <div class="title-description">
              <a class="title"
                 v-bind:href="page.url"
                 target="_blank">
                <p>{{page.title}}</p>
              </a>
              <p class="description">{{page.description}}</p>
            </div>
            <p class="source">source: {{page.site_name}}</p>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>

export default {
  name: 'NewsList',

  props: {
    category: String
  },

  watch: {
    category: function (category) {
      this.updatePages();
    }
  },

  methods: {
    updatePages: function (offset = 0) {
      if (this.category) {
        this.$store.dispatch("updatePages", {
          categoryName: this.category,
          offset: offset
        });
      } else {
        this.$store.dispatch("updatePages", {
          categoryName: "top",
          offset: offset
        });
      }
    }
  },

  created() {
    // この辺どうもうまくまとまらない
    if (this.category) {
      this.$store.dispatch("updateCategories", this.category).then(() => {
        this.updatePages();
      });
    } else {
      this.$store.dispatch("updateCategories", "top").then(() => {
        this.updatePages();
      });
    }
  }
}
</script>

<style lang="stylus">
#contents
  width 960px
  margin-right auto
  margin-left auto
  padding-top 6px
a
  color #303030
  text-decoration none
a:hover,a:focus
  color #337ab7
  text-decoration underline
a:visited
  color #777
#page-items
  display flex
  flex-wrap wrap
  .item
    width 300px
    height 240px
    overflow hidden
    margin 8px 10px
    background-color #FFF
    box-shadow 1px 1px 2px -1px #999
    .category-color-bar-main
      position relative
      height 20px
      margin-bottom 4px
    .category-text
      position absolute
      left 8px
      vertical-align middle
      font-size 13px
      color #FFF
      text-decoration none
    .thumbnail-box
      height 120px
    .thumbnail-box a img
      object-fit cover
      width 100%
      height 120px
    .item-footer
      margin 8px 8px
    .title
      font-weight bold
      word-break break-all
    .title p
      font-size 14px
      overflow hidden
      max-height 40px
      margin-top 8px
      margin-bottom 8px
    .description
      font-size 10px
      color #888
      overflow hidden
      white-space nowrap
      text-overflow ellipsis
      margin-bottom 4px
    .source
      font-size 10px
      color #888
      overflow hidden
      white-space nowrap
      text-overflow ellipsis

</style>