import Vue from 'vue'
import Vuex from 'vuex'
import API from './api'

Vue.use(Vuex)

const state = {
  currentCategory: {},
  categories: [],
  pages: []
}

const mutations = {
  updateCurrentCategory(state, category) {
    state.currentCategory = category
  },

  updateCategories(state, categories) {
    state.categories = categories
  },
  updatePages(state, pages) {
    state.pages = pages
  }
}

// actions are functions that causes side effects and can involve
// asynchronous operations.
const actions = {
  
  updateCurrentCategory({ commit }, category) {
    commit('updateCurrentCategory', category);
  },

  updateCategories({ commit }, currentCategoryName = null) {
    API.getCategories((err, categories) => {
      if (err) {
        return console.log(err);
      }
      commit('updateCategories', categories);

      if(currentCategoryName){
        categories.forEach((category) => {
          if(category.name === currentCategoryName){
            return commit('updateCurrentCategory', category);
          }
        });
      }
    });
  },

  updatePages({ commit }, categoryName, offset = 0) {
    API.getCategoryPages(categoryName, offset, (err, pages) => {
      if (err) {
        return console.log(err);
      }
      commit('updatePages', pages);
    });
  }

}

const getters = {
}

export default new Vuex.Store({
  state,
  getters,
  actions,
  mutations
})