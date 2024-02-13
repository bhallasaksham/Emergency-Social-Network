/* eslint-disable no-undef */

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const postResult = urlParams.get('post_result');
const getResult = urlParams.get('get_result');

const postDiv = document.querySelector('.post-performance');
postDiv.innerHTML = `${postResult}`;
const getDiv = document.querySelector('.get-performance');
getDiv.innerHTML = `${getResult}`;
