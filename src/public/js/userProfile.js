/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

// style `option` in `select`
$('#status-list').select2();
$('#privelege-level-list').select2();

// get target user info from URL
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const targetUsername = urlParams.get('username');

(() => {
  // update profile title using targetUsername
  document.getElementById(
    'user-profile-title',
  ).innerHTML = `Change ${targetUsername}'s Profile`;
})();

const onclickSaveBtn = async () => {
  const accountStatus = document.getElementById('status-list').value;
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const privelegeLevel = document.getElementById('privelege-level-list').value;

  payload = {};
  if (accountStatus) payload['account_status'] = accountStatus;
  if (username) payload['username'] = username;
  if (password) payload['password'] = password;
  if (privelegeLevel) payload['user_type'] = privelegeLevel;

  if (Object.keys(payload).length === 0) {
    alert('Please provide at least one user info to perform the update.');
    return;
  }

  await callUpdateUserAPI(payload);
};

const callUpdateUserAPI = async (payload) => {
  const url = `api/users/${targetUsername}`;
  const token = getCookie('token');

  await axios
    .put(url, Qs.stringify(payload), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Access-Control-Allow-Origin': '*',
        Authorization: token,
      },
    })
    .then(() => {
      alert('Change has been saved successfully!');
      window.location.replace('/main');
    })
    .catch((err) => {
      alert(err.response.data.message);
    });
};
