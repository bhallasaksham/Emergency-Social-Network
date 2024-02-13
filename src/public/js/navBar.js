/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

const titleEnum = {
  'Main Page': 'main',
  'Public Wall': 'public-wall',
  'Share Status': 'share-status',
  Chatroom: 'chatroom',
  'Measure Performance': 'measure-performance',
  'Post Announcement': 'announcement',
  'Emergency Contact': 'emergency-contact',
  'Self Assessment': 'self-assessment',
  'Self Assessment Quiz': 'self-assessment',
  Map: 'mapView',
  'Donate Resources': 'donate-resources',
  'Find Donations': 'find-donations',
  'Report Incident': 'report-incident',
};

const searchEnum = {
  'Main Page': 'main',
  'Public Wall': 'public-wall',
  'Post Announcement': 'announcement',
};

const statusList = ['ok', 'emergency', 'help', 'undefined'];

const disableNavBarBtn = () => {
  const btn = document.getElementById('nav-bar-btn');
  btn.style.display = 'none';
};

const enableNavBarBtn = () => {
  const btn = document.getElementById('nav-bar-btn');
  btn.style.display = 'block';
};

const onClickNavBar = () => {
  const title = document.getElementsByTagName('title')[0].innerText;
  if (title == 'Self Assessment Quiz') {
    // eslint-disable-next-line no-undef
    submitQuiz();
  } else {
    const navBar = document.getElementById('nav-bar');
    if (navBar.style.display === 'block') {
      navBar.style.display = 'none';
    } else {
      navBar.style.display = 'block';
    }
  }
};

const onClickHelpBtn = async () => {
  const username = getCookie('currentUser');
  const statusUrl = `${API_URL}/users/${username}/status/emergency`;
  const token = getCookie('token');

  // set citizen status to emergency when user needs help
  await axios
    .patch(statusUrl, Qs.stringify(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Access-Control-Allow-Origin': '*',
        Authorization: token,
      },
    })
    .catch((err) => {
      alert(err.response.data.message);
    });

  const notificationUrl = `${API_URL}/emergencies/notifications`;
  await axios
    .post(notificationUrl, Qs.stringify(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Access-Control-Allow-Origin': '*',
        Authorization: token,
      },
    })
    .then((result) => {
      const {data} = result.data;
      // redirect citizen to private chatroom
      window.location.replace(
        `/privatemessage/${data.contactInfo.chatroom_id}?receiver_name=${data.contactInfo.receiver}`,
      );
    })
    .catch((err) => {
      alert(err.response.data.message);
    });
};

const callGetEmergencyContactAPI = () => {
  const url = `${API_URL}/emergencies/contacts`;
  const token = getCookie('token');

  axios
    .get(url, {
      headers: {
        Authorization: token,
      },
    })
    .catch((err) => {
      // remove help btn if the citizen haven't set emergency contact
      if (err.response.status == 404) {
        document.getElementById('help-btn').remove();
        return;
      }
      alert(err.response.data.message);
    });
};

const onClickSearchBtn = () => {
  const title = document.getElementsByTagName('title')[0];
  const currentPage = titleEnum[title.innerText];
  switch (currentPage) {
    case 'public-wall':
      // eslint-disable-next-line no-undef
      hideChatForm();
      break;
    case 'announcement':
      // eslint-disable-next-line no-undef
      hideAnnouncementsForm();
      break;
  }
  const button_value = document.getElementById('search-information').innerHTML;
  if (button_value === '<i class="fa fa-search" aria-hidden="true"></i>') {
    document.getElementById(
      'search-information',
    ).innerHTML = `<i class="fa fa-times" aria-hidden="true"></i>`;
  } else {
    location.reload();
  }
  const searchBar = document.getElementById('search-bar');
  if (searchBar.style.display === 'block') {
    searchBar.style.display = 'none';
  } else {
    searchBar.style.display = 'block';
  }
};

const getKeyword = () => {
  const keyword = document
    .getElementById('keyword-input')
    .value.replace(/ /g, '');
  const title = document.getElementsByTagName('title')[0];
  const currentPage = titleEnum[title.innerText];

  switch (currentPage) {
    case 'main':
      // eslint-disable-next-line no-undef
      clearESNDirectory();
      if (statusList.includes(keyword.toLowerCase())) {
        // eslint-disable-next-line no-undef
        getUsersByStatus(keyword.toLowerCase());
      } else {
        // eslint-disable-next-line no-undef
        getUsersByUsername(keyword.toLowerCase());
      }
      break;
    case 'public-wall':
      // eslint-disable-next-line no-undef
      clearMessageContainer();
      // eslint-disable-next-line no-undef
      getPublicMessagesByKeyword(keyword);
      break;
    case 'announcement':
      // eslint-disable-next-line no-undef
      clearAnnouncementContainer();
      // eslint-disable-next-line no-undef
      getAnnouncementsByKeyword(keyword);
      break;
  }
};

(async () => {
  const body = document.getElementsByTagName('body')[0];
  const title = document.getElementsByTagName('title')[0];
  const userType = getCookie('userType');
  body.insertAdjacentHTML(
    'afterbegin',
    `
    <div class="topnav"><span>
    
      <button class="nav-bar-heading" id="search-information"  onclick="onClickSearchBtn()"><i class="fa fa-search" aria-hidden="true"></i></button>
      <a class="title">Emergency Social Network </a>

      <button id="red-help-btn"  onclick="onClickHelpBtn()">HELP</button>
      <a id="nav-bar-btn" href="javascript:void(0);" class="icon" onclick="onClickNavBar()">
      <i class="fa fa-bars"></i>
      </a>
      
      <div id="nav-bar">
        <a class="hamburger-list" href="main" id="main"
          ><i class="fa fa-address-book" aria-hidden="true"></i> ESN
          Directory</a
        >
        <a class="hamburger-list" href="publicwall" id="public-wall"
        ><i class="fa fa-commenting" aria-hidden="true"></i> Public Wall</a
        >
        <a class="hamburger-list" href="chatroom" id="chatroom"
        ><i class="fa fa-comments" aria-hidden="true"></i> Chatroom</a
        >
        <a class="hamburger-list" href="sharestatus" id="share-status"
          ><i class="fa fa-asterisk" aria-hidden="true"></i> Share Status</a
        >
        <a class="hamburger-list" href="measure-performance" id="measure-performance"
        ><i class="fa fa-bar-chart" aria-hidden="true"></i> Measure Performance</a
       >
        <a class="hamburger-list" href="announcement" id="announcement"
        ><i class="fa fa-bullhorn" aria-hidden="true"></i> Announcement</a
        >
        <a class="hamburger-list" href="emergency-contact" id="emergency-contact"
        ><i class="fa fa-address-book" aria-hidden="true"></i> Emergency Contact</a
        >
        <a class="hamburger-list" id="help-btn" onclick="onClickHelpBtn()"><i class="fa fa-medkit"></i> Help</a>
        <a class="hamburger-list" href="self-assessment" id="self-assessment"><i class="fa fa-graduation-cap" aria-hidden="true"></i> Earthquake Preparation Quiz</a>
        <a class="hamburger-list" href="map" id="mapView"><i class="fa fa-map" aria-hidden="true"></i> Map</a>
      
        <a class="hamburger-list" href="donate-resources" id="donate-resources"
        ><i class="fa fa-handshake-o" aria-hidden="true"></i> Donate Resources</a
        >
        <a class="hamburger-list" href="find-donations" id="find-donations"
        ><i class="fa fa-binoculars" aria-hidden="true"></i> Find Donations</a>
        <a class="hamburger-list" href="report-incident" id="report-incident"
        ><i class="fa fa-tachometer" aria-hidden="true"></i> Report Incident</a>
        <a class="hamburger-list" id="logout" onclick="logout()"><i class="fa fa-sign-out"></i> Log out</a>
      </div>

      <div id="search-bar">
        

          <span>
          <input class="search-input" type="search" id="keyword-input" placeholder="Search" aria-label="Search">
          <button class="search-btn" type="submit" onclick="getKeyword()">Search</button>
          <span>


      </div>
      </div>
      

  </div>
    `,
  );

  if (userType === 'administrator') {
    document.getElementById('measure-performance').style.display = 'block';
  }

  await callGetEmergencyContactAPI();
  const pageTitle = document.getElementById(titleEnum[title.innerText]);
  if (pageTitle) document.getElementById(titleEnum[title.innerText]).remove();

  if (!(title.innerText in searchEnum)) {
    document.getElementById('search-information').style.visibility = 'hidden';
  }
})();

socket.on('public-message', (msg) => {
  const redHelpBtn = document.getElementById('red-help-btn');
  if (
    msg.message.toLowerCase().includes('earthquake') &&
    (!redHelpBtn.style.display || redHelpBtn.style.display == 'none')
  ) {
    toggleNavBarHelpBtn();
  }
});

socket.on('announcement', (msg) => {
  const redHelpBtn = document.getElementById('red-help-btn');
  if (
    msg.announcement.toLowerCase().includes('earthquake') &&
    (!redHelpBtn.style.display || redHelpBtn.style.display == 'none')
  ) {
    toggleNavBarHelpBtn();
  }
});

const toggleNavBarHelpBtn = () => {
  const redHelpBtn = document.getElementById('red-help-btn');
  redHelpBtn.style.display = 'inline-block';
  setTimeout(() => {
    redHelpBtn.style.display = 'none';
  }, 15 * 60 * 1000);
};
