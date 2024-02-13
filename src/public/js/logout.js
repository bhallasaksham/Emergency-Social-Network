/* eslint-disable no-undef */

// eslint-disable-next-line no-unused-vars
const logout = async () => {
  const token = getCookie('token');
  const url = `${API_URL}/users/offline`;
  await axios
    .put(url, Qs.stringify(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Access-Control-Allow-Origin': '*',
        Authorization: token,
      },
    })
    .then((result) => {
      if (result.status == 200) {
        console.log('logout success');
        eraseCookie('token');
        eraseCookie('currentUser');
        eraseCookie('status');
        eraseCookie('userType');
        eraseCookie('locationPreference');
        window.location.replace('/login');
      }
    })
    .catch((err) => {
      alert(err.response.data.message);
    });
};
