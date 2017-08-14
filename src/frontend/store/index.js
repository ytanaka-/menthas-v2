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
  updatePages(state, data) {
    const pages = data.pages;
    const isReset = data.isReset;
    pages.forEach((page) => {
      state.categories.forEach((category) => {
        if (category.name === page.category) {
          page.categoryColor = category.color;
        }
      });
    });
    if (isReset) {
      state.pages = pages;
    } else {
      pages.forEach((page) => {
        let isOverlap = false;
        state.pages.forEach((_page) => {
          if (page.url === _page.url) {
            return isOverlap = true;
          }
        });
        if (!isOverlap) {
          state.pages.push(page);
        }
      });
    }
  }
}

// actions are functions that causes side effects and can involve
// asynchronous operations.
const actions = {

  updateCurrentCategory({ commit }, category) {
    commit('updateCurrentCategory', category);
  },

  updateCategories({ commit }, currentCategoryName = null) {
    return new Promise((resolve, reject) => {
      API.getCategories((err, categories) => {
        if (err) {
          return reject(err);
        }
        if (currentCategoryName) {
          categories.forEach((category) => {
            if (category.name === currentCategoryName) {
              return commit('updateCurrentCategory', category);
            }
          });
        }
        commit('updateCategories', categories);
        resolve();
      });
    });
  },

  updatePages({ commit }, data) {
    const categoryName = data.categoryName;
    const offset = data.offset;
    // カテゴリ切り替えなどでpagesをresetする場合はtrueにする
    let isReset = false;
    if (categoryName !== state.currentCategory.name) {
      isReset = true;
      state.categories.forEach((category) => {
        if (category.name === categoryName) {
          return commit('updateCurrentCategory', category);
        }
      });
    }
    return new Promise((resolve, reject) => {
      API.getCategoryPages(categoryName, offset, (err, pages) => {
        if (err) {
          return reject(err);
        }
        commit('updatePages', {
          pages: pages,
          isReset: isReset
        });
        resolve();
      });
    })
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