/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

// style `option` in `select`
$('#citizen-list').select2();

// query citizens as dropdown option
(async () => {
  const token = getCookie('token');
  const url = 'api/users?account_status=active';

  await axios
    .get(url, {
      headers: {
        Authorization: token,
      },
    })
    .then((result) => {
      const citizenList = document.getElementById('citizen-list');
      const currentUser = getCookie('currentUser');

      const {data} = result.data;
      for (let i = 0; i < data.length; i++) {
        if (data[i].username == currentUser) {
          continue; // emergency contact should not be oneself
        }
        let opt = document.createElement('option');
        opt.value = data[i].username;
        opt.innerHTML = data[i].username;
        citizenList.append(opt);
      }
    })
    .catch((err) => {
      alert(err.response.data.message);
    });
})();

const onclickSaveBtn = async () => {
  const username = document.getElementById('citizen-list').value;
  const emailAddress = document.getElementById('email-address').value;
  const enableSendPublicMessage = document.getElementById(
    'enable-send-public-message',
  ).checked;

  if (username.length == 0) {
    return alert('Please provide a citizen as your emergency contact.');
  }

  const body = {
    contact_username: username,
    enable_send_public_message: false,
    email_address: '',
  };

  // valid email address only when user provide this optional contact info
  if (emailAddress.length != 0) {
    if (!isValidEmailAddress(emailAddress)) {
      return alert('Invalud email address format.');
    }
    body['email_address'] = emailAddress;
  }

  if (enableSendPublicMessage) {
    body['enable_send_public_message'] = true;
  }

  callCreateEmergencyContactAPI(body);
  document.getElementById('contact-info').reset();
};

// credit: https://stackoverflow.com/a/9204568
const isValidEmailAddress = (emailAddress) => {
  return emailAddress.toLowerCase().match(/^\S+@\S+\.\S+$/);
};

const callCreateEmergencyContactAPI = async (body) => {
  const url = 'api/emergencies/contacts';
  const token = getCookie('token');

  await axios
    .post(url, Qs.stringify(body), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Access-Control-Allow-Origin': '*',
        Authorization: token,
      },
    })
    .then(() => {
      displaySavedHint('Saved!!');
    })
    .catch((err) => {
      if (err.response.status == 409) {
        return callUpdateEmergencyContactAPI(body);
      }
      alert(err.response.data.message);
    });
};

const callUpdateEmergencyContactAPI = async (body) => {
  const url = 'api/emergencies/contacts';
  const token = getCookie('token');

  await axios
    .put(url, Qs.stringify(body), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Access-Control-Allow-Origin': '*',
        Authorization: token,
      },
    })
    .then(() => {
      displaySavedHint('Contact Updated!!');
    })
    .catch((err) => {
      alert(err.response.data.message);
    });
};

const displaySavedHint = (msg) => {
  document.getElementById('contact-saved-message').innerHTML = `
  <h4>${msg}</h4>
  `;
  const helpBtn = document.getElementById('help-btn');
  if (!helpBtn) {
    // when user create an emergency contact, display help btn at nav bar
    const logoutBtn = document.getElementById('logout');
    logoutBtn.insertAdjacentHTML(
      'beforebegin',
      `
    <a class="hamburger-list" id="help-btn" onclick="onClickHelpBtn()"
      ><i class="fa fa-medkit"></i> Help</a
    >
    `,
    );
  }

  setTimeout(() => {
    document.getElementById('contact-saved-message').innerHTML = '';
  }, 3000); // display hint for 3s
};
