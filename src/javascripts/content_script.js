import jQuery from 'jquery';
import algoliasearch from 'algoliasearch';

window.jQuery = jQuery;
window.$ = jQuery;

const client = algoliasearch('0H4SMABBSG', '9670d2d619b9d07859448d7628eea5f3');
const textareaSelector = '[rel=comments-form] textarea[class^=input_]';

const arrow = `<svg width="9" height="8" viewBox="0 0 9 8" xmlns="http://www.w3.org/2000/svg"><title>Rectangle 64</title><path d="M9 8H0l4.5-8L9 8z" fill="#fff" fill-rule="evenodd"></path></svg>`;

$(()=> {
  const userSearchOptions = {
    match: /\B@(\w{2,})$/,
    search: function (term, callback) {
      client.search([{ indexName: 'User_production', query: term, params: { hitsPerPage: 8 }}], (error, data) => {
        if (!error) {
          const users = data.results[0].hits;
          callback($.map(users, user => ({ avatar_url: user.image_urls["60"], name: user.name, username: user.username })));
        }
      });
    },
    template: (user) => {
      return `<div class='user-result'><img src="${user.avatar_url}" alt="${user.name}"> ${user.name} <span>/ ${user.username}</span><div class='clear'></div></div>`;
    },
    index: 1,
    replace: (user) => {
      return `@${user.username} `;
    }
  };

  const postSearchOptions = {
    match: /\B\#(\w{2,})$/,
    search: function (term, callback) {
      client.search([{ indexName: 'Post_production', query: term, params: { hitsPerPage: 8 }}], (error, data) => {
        if (!error) {
          const posts = data.results[0].hits;
          callback(posts);
        }
      });
    },
    index: 1,
    template: (post) => {
      return `<div class='post-result ${post.category.slug}'><div class='upvotes'>${arrow}<br> ${post.vote_count}</div> ${post.name} <span class='category'>/ ${post.category.name}</span><br><span>${post.tagline}</span><div class='clear'></div></div>`;
    },
    replace: (post) => {
      return `<a href="${document.origin}${post.url}">${post.name}</a> `;
    }
  }

  setInterval(() => {
    $(textareaSelector).each((index, el) => {
      // Only for textareas where the plugin wasnt applied yes
      if (!$(el).data('textComplete')) {
        // Initialize textcomplete plugin
        $(el).textcomplete([userSearchOptions, postSearchOptions]);
      }
    })
  }, 1000);

});
