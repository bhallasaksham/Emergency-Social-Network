/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

let userLocationPreference;
let userLatitude = '';
let userLongitude = '';

const API_URL = '/api';

// socket event
const socketServer = window.location.origin;
const token = getCookie('token');
const socket = io(socketServer, {
  auth: {token},
});

const displayStatus = (sharestatus) => {
  let tempstatus;
  let srcname;
  let altname;
  switch (sharestatus) {
    case 'Help':
      srcname = '../icons/Yellow.png';
      altname = 'Yellow Icon';
      break;
    case 'OK':
      srcname = '../icons/Green.png';
      altname = 'Green Icon';
      break;
    case 'Emergency':
      srcname = '../icons/Red.png';
      altname = 'Red Icon';
      break;
    default:
      tempstatus =
        '<td><span class="undefined">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
        'Undefined' +
        '</span></td><tr>';
      return tempstatus;
  }
  tempstatus =
    `<td><span><img class="icon-image" src=${srcname} alt=${altname}/>&nbsp;&nbsp;` +
    sharestatus +
    `</span></td><tr>`;

  return tempstatus;
};

const showNoDataRetrievedText = () => {
  const noData = document.getElementById('no-data');
  noData.style.display = 'block';
  noData.innerText = 'no data available';
};

const removeNoDataRetrievedText = () => {
  const noData = document.getElementById('no-data');
  noData.style.display = 'none';
};

const removeLoadMorebutton = () => {
  document.getElementById('load-more').style.display = 'none';
};

const callGetLocationPreferenceAPI = async (url) => {
  const token = getCookie('token');
  await axios
    .get(url, {
      headers: {
        Authorization: token,
      },
    })
    .then((result) => {
      const response = result.data;
      userLocationPreference = response.data;
    })
    .catch((err) => {
      alert(err.response.data.message);
    });
};

const callUpdateLocationPreferenceAPI = async (url, locationPreference) => {
  const token = getCookie('token');
  const body = {
    preference: locationPreference,
  };
  axios
    .put(url, Qs.stringify(body), {
      headers: {
        Authorization: token,
      },
    })
    .then(() => {
      setCookie('locationPreference', locationPreference, 30);
    })
    .catch((err) => {
      alert(err.response.data.message);
    });
};

const updateLocationPreferenceForUser = async (locationPreference) => {
  const username = getCookie('currentUser');
  const url = `${API_URL}/users/${username}/preferences/location`;
  await callUpdateLocationPreferenceAPI(url, locationPreference);
};

const callUpdateUserLocationAPI = async (url, location) => {
  const token = getCookie('token');
  const body = {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
  await axios
    .put(url, Qs.stringify(body), {
      headers: {
        Authorization: token,
      },
    })
    .then(() => {})
    .catch((err) => {
      alert(err.response.data.message);
    });
};

const askUserForLocationPreferences = async (msg) => {
  let choice = confirm(msg);
  if (choice == true) {
    await updateLocationPreferenceForUser('Allowed');
    updateUserLocation();
  } else {
    await updateLocationPreferenceForUser('Not Allowed');
  }
};

const updateUserLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(async (position) => {
      const username = getCookie('currentUser');
      const url = `${API_URL}/users/${username}/location`;
      (userLatitude = position.coords.latitude),
        (userLongitude = position.coords.longitude),
        await callUpdateUserLocationAPI(url, position);
    });
  } else {
    console.log('Geolocation is not supported by this browser.');
  }
};

const getLocationPreferenceForUser = async () => {
  // eslint-disable-next-line no-undef
  const username = getCookie('currentUser');
  const url = `${API_URL}/users/${username}/preferences/location`;
  await callGetLocationPreferenceAPI(url);
  switch (userLocationPreference) {
    case 'Undefined':
      await askUserForLocationPreferences(
        'Allow location sharing to get notified if a nearby citizen reports earthquake?',
      );
      break;
    case 'Allowed':
      setCookie('locationPreference', userLocationPreference, 30);
      updateUserLocation();
      break;
    default:
      setCookie('locationPreference', 'Not Allowed', 30);
      break;
  }
};

(async () => {
  await getLocationPreferenceForUser();
})();

socket.on('account-status', (msg) => {
  const username = getCookie('currentUser');
  // 1. handle account inactive event
  if (
    msg.account_status == 'inactive' &&
    (msg.username == username ||
      (msg.original_username && msg.original_username == username))
  ) {
    alert(
      'Your account is set to "inactive". Please contact your administrator.',
    );
    logout();
    return;
  }

  // 2. handle account status update event
  if (
    msg.username == username ||
    (msg.original_username && msg.original_username == username)
  ) {
    alert(
      'Your account status has been updated by administrator, please login again.',
    );
    logout();
  }
});
