/* eslint-disable no-undef */

const API_URL = '/api';

const createAdminUserIfNotExists = async () => {
  const url = `${API_URL}/users/admin`;

  // get admin user
  await axios
    .get(url, {
      headers: {},
    })
    .catch((err) => {
      if (err.response.status == 404) {
        return callCreateAdminUserAPI();
      }
      console.log(`get admin user fail: ${err.response.data.message}`);
    });
};

const callCreateAdminUserAPI = async () => {
  const url = `${API_URL}/users/admin`;

  await axios
    .post(url, Qs.stringify(), {
      headers: {},
    })
    .catch((err) => {
      console.log(`create admin user fail: ${err.response.data.message}`);
    });
};

(async () => {
  await createAdminUserIfNotExists();
})();

// eslint-disable-next-line no-unused-vars
const login = async () => {
  const username = document.getElementById('username');
  const password = document.getElementById('password');

  const url = `${API_URL}/users/online`;
  const body = {
    username: username.value,
    password: password.value,
  };

  await axios
    .put(url, Qs.stringify(body), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Access-Control-Allow-Origin': '*',
      },
    })
    .then((result) => {
      const res = result.data;
      if (result.status == 200) {
        const {data} = res;
        setCookie('token', data.user.token, 30);
        setCookie('currentUser', username.value.toLowerCase(), 30);
        setCookie('userType', data.user.user_type.toLowerCase(), 30);
        window.location.replace('/main');
      }
    })
    .catch((err) => {
      if (err.response.status == 404) {
        if (confirm('User does not exist, would you like to create one?')) {
          register(username.value, password.value);
        } else {
          // Do nothing!
          console.log('So sad :(');
        }
      } else {
        alert(err.response.data.message);
      }
      document.getElementById('account').reset();
    });
};

// eslint-disable-next-line no-unused-vars
const register = async (username, password) => {
  const url = `${API_URL}/users`;
  const body = {
    username: username,
    password: password,
  };
  await axios
    .post(url, Qs.stringify(body), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Access-Control-Allow-Origin': '*',
      },
    })
    .then((result) => {
      const res = result.data;

      if (result.status == 201) {
        const {data} = res;
        setCookie('token', data.user.token, 30);
        setCookie('currentUser', data.user.username, 30);
        setCookie('userType', data.user.user_type.toLowerCase(), 30);
        window.location.replace('/welcome');
      }
    })
    .catch((err) => {
      alert(err.response.data.message);
      document.getElementById('account').reset();
    });
};
