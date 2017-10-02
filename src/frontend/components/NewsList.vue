<template>
  <div>
    <div class="newsbox">
      <div class="item" v-for="(page,index) in this.$store.state.pages" v-bind:key="page.url">
        <div class="category-color-bar">
          <div class="category-color-bar-main" v-bind:style="{ backgroundColor: page.categoryColor}">
            <a class="category-text">
              <span class="category-name">{{page.category}}</span>
            </a>
          </div>
        </div>
        <div class="thumbnail-box">
          <a v-bind:href="page.url" target="_blank">
            <img v-bind:src="page.thumbnail" onerror="this.style.display='none'" />
          </a>
        </div>
        <div class="item-footer">
          <div class="title">
            <a v-bind:href="page.url" target="_blank">
              <p>{{page.title}}</p>
            </a>
          </div>
          <p class="description">{{page.description}}</p>
          <p class="source">source: {{page.site_name}}</p>
        </div>
      </div>
    </div>
    <infinite-loading class="center" @infinite="infiniteHandler" spinner="waveDots" ref="infiniteLoading">
      <span slot="no-results"></span>
      <span slot="no-more"></span>
    </infinite-loading>
  </div>
</template>

<script>
import InfiniteLoading from 'vue-infinite-loading';

export default {
  name: 'NewsList',

  props: {
    category: String
  },

  components: {
    InfiniteLoading,
  },

  watch: {
    category: function(category) {
      // categoryの更新があった場合はInfiniteをresetし再読み込みできるようにする
      this.updatePages().then(() => {
        this.$refs.infiniteLoading.$emit('$InfiniteLoading:reset');
      });
    }
  },

  methods: {
    updatePages: function(offset = 0) {
      if (this.category) {
        return this.$store.dispatch("updatePages", {
          categoryName: this.category,
          offset: offset
        });
      } else {
        return this.$store.dispatch("updatePages", {
          categoryName: "top",
          offset: offset
        });
      }
    },
    infiniteHandler($state) {
      const pageSize = this.$store.state.pages.length;
      const MAX = 500;
      // APIからエラーが返った場合とpageSizeがMAX以上の場合はcompleteとする
      this.updatePages(pageSize).then(() => {
        const _pageSize = this.$store.state.pages.length;
        if (pageSize !== _pageSize && _pageSize < MAX) {
          $state.loaded();
        } else {
          $state.complete();
        }
      }).catch((err) => {
        $state.complete();
      });
    }
  },

  created() {
    if (this.category) {
      this.$store.dispatch("updateCategories", this.category);
    } else {
      this.$store.dispatch("updateCategories", "top");
    }
  }
}
</script>

<style lang="stylus">
a
  color #303030
  text-decoration none
a:hover,a:focus
  color #337ab7
  text-decoration underline
a:visited
  color #777

.center
  margin: auto

.newsbox
  width 100%
  display flex
  flex-wrap wrap
  padding-top 6px

.item
  width 30%
  min-width 290px
  height 264px
  overflow hidden
  margin 10px 11px
  background-color #FFF
  box-shadow 2px 2px 2px -1px #CCC
  .category-color-bar-main
    position relative
    height 23px
  .category-text
    position absolute
    left 10px
    margin-top 4px
    vertical-align middle
    font-size 13px
    color #FFF
    text-decoration none
  .thumbnail-box
    height 122px
    a img
      object-fit cover
      width 100%
      height 122px
  .item-footer
    position relative
    margin 10px 18px
    height (264 - 145 - 8*2)px
  .title
    word-break break-all
    a
      color #333
      p
        font-size 14px
        font-weight bold
        overflow hidden
        line-height 1.6
        max-height ((14*1.6)*2)px
        min-height ((14*1.6)*2)px
        margin-top 6px
        margin-bottom 6px
        display -webkit-box
        -webkit-line-clamp 2
        -webkit-box-orient vertical
    a:hover,a:focus
      color #2a6496
      text-decoration underline
    a:visited 
      color #777
      text-decoration none
      
  .description
    font-size 10px
    color #888
    overflow hidden
    white-space nowrap
    text-overflow ellipsis
    margin-top 12px
  .source
    position absolute
    width 100%
    bottom 6px
    font-size 10px
    color #AAA
    overflow hidden
    white-space nowrap
    text-overflow ellipsis

</style>