/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const currentHref = window.location.href;
const chatroomId = currentHref
  .substring(currentHref.lastIndexOf('/') + 1)
  .split('?')[0];
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const receiverName = urlParams.get('receiver_name');

const chatroomForm = document.getElementsByClassName('chatroom-inputarea')[0];
const chatroomInput = document.getElementsByClassName('chatroom-input')[0];
const chatroomChat = document.getElementsByClassName('chatroom-chat')[0];
// First we get the viewport height and we multiple it by 1% to get a value for a vh unit
let vh = window.innerHeight * 0.01;

let offset = 0;
const limit = 10;
let searchKeyword = '';
let messageList = [];
const chatroomContainer = document.getElementsByClassName('chatroom-chat')[0];
// Then we set the value in the --vh custom property to the root of the document
document.documentElement.style.setProperty('--vh', `${vh}px`);

// put receiver name into header
const haederTitle = document
  .getElementsByClassName('topnav')[0]
  .getElementsByClassName('title')[0];
haederTitle.innerHTML = receiverName;

// eslint-disable-next-line no-unused-vars
const loadMore = () => {
  getPublicMessagesByKeywordUsingOffset();
};

const getPublicMessagesByKeywordUsingOffset = async () => {
  const url = `${API_URL}/messages/private?chatroom_id=${chatroomId}&words=${searchKeyword}&offset=${offset}&limit=${limit}`;
  displayPrivateMessageSearchResults(url);
  offset += limit;
};

const callGetPrivateMessagesAPI = async (url) => {
  const token = getCookie('token');
  await axios
    .get(url, {
      headers: {
        Authorization: token,
      },
    })
    .then((result) => {
      const {data} = result.data;
      if (data.messages.length === 0 && searchKeyword.length !== 0) {
        showNoDataRetrievedText();
        removeLoadMorebutton();
        messageList = [];
        return;
      }
      messageList = data.messages;
    })
    .catch((err) => {
      alert(err.response.data.message);
    });
};

const displayPrivateMessages = async (url) => {
  await callGetPrivateMessagesAPI(url);
  const currentUsername = getCookie('currentUser');
  messageList.reverse().forEach((msg) => {
    const {message, sender_name, timestamp, _id, status} = msg;
    const side = currentUsername === sender_name ? 'right' : 'left';
    appendMessage(sender_name, side, message, timestamp, _id, status, 500);
  });
};

const displayPrivateMessageSearchResults = async (url) => {
  await callGetPrivateMessagesAPI(url);
  const currentUsername = getCookie('currentUser');
  messageList.forEach((msg) => {
    const {message, sender_name, timestamp, _id, status} = msg;
    const side = currentUsername === sender_name ? 'right' : 'left';
    appendMessage(sender_name, side, message, timestamp, _id, status, 0);
  });
};

(async () => {
  const url = `${API_URL}/messages/private?chatroom_id=${chatroomId}`;
  displayPrivateMessages(url);
})();

function checkUsername(data) {
  return data.username == receiverName;
}

const getUserStatusHistory = async () => {
  keyword = receiverName;
  const url = `${API_URL}/users/${keyword.toLowerCase()}/status-histories`;
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
      const statusHistory = data.statusHistory;
      const reversedStatusHistory = statusHistory.reverse();
      //display only latest 10 status history
      displayStatusHistory(reversedStatusHistory.slice(0, 10));
    })
    .catch((err) => {
      alert(err.response.data.message);
    });
};

// eslint-disable-next-line no-unused-vars
const getPrivateMessagesByKeyword = async () => {
  offset = 0; // clean up offset when user start a new search
  const url = `${API_URL}/messages/private?chatroom_id=${chatroomId}&words=${searchKeyword}&limit=${limit}`;
  displayPrivateMessageSearchResults(url);
  offset += limit;
  removeNoDataRetrievedText();
};

const sendMessage = async (sender, receiver, msg) => {
  const token = getCookie('token');
  const url = `${API_URL}/messages/private`;

  const body = {
    sender_name: sender,
    receiver_name: receiver,
    message: msg,
  };
  await axios
    .post(url, Qs.stringify(body), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Access-Control-Allow-Origin': '*',
        Authorization: token,
      },
    })
    .catch((err) => {
      alert(err.response.data.message);
    });
};

chatroomForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const currentUsername = getCookie('currentUser');

  const msgText = chatroomInput.value;
  if (!msgText) return;

  // POST msg
  sendMessage(currentUsername, receiverName, msgText);

  chatroomInput.value = '';
});

const appendMessage = (
  name,
  side,
  text,
  timestamp,
  id,
  status,
  scrollHeight,
) => {
  const msgHTML = `
    <div class="msg ${side}-msg" id=${id}>
      <div class="circle">${name[0].toUpperCase()}</div>

      <div class="msg-bubble">
        <div class="msg-info">
          <div class="msg-info-name">${name}</div>
          <div class="msg-info-time">${formatTimestamp(timestamp)}</div>
        </div>
        <div class="msg-text">${text}</div>
        <div class="msg-info-status">status: ${status}</div>
      </div>
    </div>
  `;

  chatroomChat.insertAdjacentHTML('beforeend', msgHTML);
  chatroomChat.scrollTop += scrollHeight;
};

// eslint-disable-next-line no-unused-vars
const displayStatusHistory = (userStatus) => {
  let tableContent =
    '<tr><th class="username"> Username </th><th class="status"> Status </th><tr>';
  for (index = 0; index < userStatus.length; index++) {
    username = receiverName;
    sharestatus = userStatus[index];
    tableContent += '<tr><td>' + username + '</td>';
    tableContent += displayStatus(sharestatus);
  }
  chatroomChat.innerHTML = '<table>' + tableContent + '</table>';
};

// eslint-disable-next-line no-unused-vars
const showInfo = () => {
  alert('Type keyword status to view status history');
};

const clearPrivateMessageContainer = () => {
  while (
    chatroomContainer.firstChild &&
    chatroomContainer.removeChild(chatroomContainer.firstChild)
  );
  document.getElementById('load-more').style.display = 'block';
  document.getElementById('no-data').style.display = 'none';
};

// eslint-disable-next-line no-unused-vars
const onClickSearchInPrivateMessageBtn = () => {
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
  document.getElementById('message-input').style.display = 'none';
  document.getElementById('send-btn').style.display = 'none';
};

// eslint-disable-next-line no-unused-vars
const getKeywordInPrivateMessage = () => {
  searchKeyword = document
    .getElementById('keyword-input')
    .value.replace(/ /g, '');
  if (searchKeyword === 'status') {
    getUserStatusHistory();
  } else {
    clearPrivateMessageContainer();
    getPrivateMessagesByKeyword();
  }
};

// eslint-disable-next-line no-unused-vars
const backToChatroomList = () => {
  location.href = '/chatroom';
};

socket.on('private-message', (msg) => {
  const currentUsername = getCookie('currentUser');
  const {message, sender_name, timestamp, _id, status} = msg;
  // this window is for currentUser & receiver only,
  // don't show private message that between currentUser with someone else
  if (sender_name !== currentUsername && sender_name !== receiverName) {
    return;
  }
  const side = currentUsername === sender_name ? 'right' : 'left';
  appendMessage(sender_name, side, message, timestamp, _id, status, 500);
});
