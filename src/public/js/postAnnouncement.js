/* eslint-disable no-undef */

const announcementContainer = document.getElementsByClassName(
  'announcement-container',
)[0];

let offset = 0;
const limit = 10;
let searchKeyword = '';

// eslint-disable-next-line no-unused-vars
const clearAnnouncementContainer = () => {
  while (
    announcementContainer.firstChild &&
    announcementContainer.removeChild(announcementContainer.firstChild)
  );

  document.getElementById('load-more').style.display = 'block';
};

// eslint-disable-next-line no-unused-vars
const hideAnnouncementsForm = () => {
  document.getElementById('announcement-form').style.display = 'none';
  document.getElementById('notification-list').style.height = '60vh';
};

// eslint-disable-next-line no-unused-vars
const loadMore = () => {
  getPublicMessagesByKeywordUsingOffset();
};

const getPublicMessagesByKeywordUsingOffset = async () => {
  const url = `${API_URL}/announcements?words=${searchKeyword}&limit=${limit}&offset=${offset}`;
  callGetAnnouncementsAPI(url);
  offset += limit;
};

const callGetAnnouncementsAPI = async (url) => {
  const token = getCookie('token');
  await axios
    .get(url, {
      headers: {
        Authorization: token,
      },
    })
    .then((result) => {
      // data gets all users in json format
      const {data} = result.data;
      if (data.announcements.length === 0 && searchKeyword.length !== 0) {
        showNoDataRetrievedText();
        removeLoadMorebutton();
        return;
      }
      data.announcements.forEach((a) => {
        const announcementHTML = `
          <div class="message">
            <p class="messageheader" id="${a._id}">
              <span class="username">${a.sender_name}&nbsp;</span>
              <br />
              <span class="datetime">${formatTimestamp(a.timestamp)}</span>
            </p>
            <br />
            <p class="text">${a.announcement}</p>
          </div>
          `;

        announcementContainer.insertAdjacentHTML('beforeend', announcementHTML);
      });
    })
    .catch((err) => {
      alert(err.response.data.message);
    });
};

(async () => {
  const userType = getCookie('userType');
  if (userType === 'citizen') {
    hideAnnouncementsForm();
  }
  const url = `${API_URL}/announcements`;
  callGetAnnouncementsAPI(url);
})();

// eslint-disable-next-line no-unused-vars
const getAnnouncementsByKeyword = async (keyword) => {
  offset = 0; // clean up offset when user start a new search
  removeNoDataRetrievedText();
  searchKeyword = keyword;
  const url = `${API_URL}/announcements?words=${keyword}&limit=${limit}`;
  callGetAnnouncementsAPI(url);
  offset += limit;
};

// eslint-disable-next-line no-unused-vars
const postAnnouncement = async () => {
  const announcementText = document.getElementById('announcement-text').value;

  const url = `${API_URL}/announcements`;
  const token = getCookie('token');
  const body = {
    announcement: announcementText,
  };

  await axios
    .post(url, Qs.stringify(body), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Access-Control-Allow-Origin': '*',
        Authorization: token,
      },
    })
    .then(() => {
      // reset text area
      document.getElementById('announcement-text').value = '';
    })
    .catch((err) => {
      alert(err.response.data.message);
    });
};

// eslint-disable-next-line no-unused-vars
const stoppedTyping = () => {
  const announcementText = document.getElementById('announcement-text');
  if (announcementText.value.length > 0) {
    document.getElementById('post-announcement-btn').disabled = false;
  } else {
    document.getElementById('post-announcement-btn').disabled = true;
  }
};

socket.on('announcement', (announcement) => {
  const announcementHTML = `
  <div class="message">
    <p class="messageheader" id="${announcement._id}">
      <span class="username">${announcement.sender_name}&nbsp;</span>
      <br />
      <span class="datetime">${formatTimestamp(announcement.timestamp)}</span>
    </p>
    <br />
    <p class="text">${announcement.announcement}</p>
  </div>
  `;

  announcementContainer.insertAdjacentHTML('afterbegin', announcementHTML);
});
