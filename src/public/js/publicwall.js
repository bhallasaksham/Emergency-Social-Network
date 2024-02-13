/* eslint-disable no-undef */

const containerDiv = document.querySelector('.messagelist');
containerDiv.scrollTop = containerDiv.scrollHeight;
let offset = 0;
const limit = 10;
let searchKeyword = '';
let messageList = [];

/* eslint-disable no-unused-vars */
const displayStatusInPublicWall = (sharestatus) => {
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
      tempstatus = '<td><span class="undefined"></span></td><tr>';
      return tempstatus;
  }
  tempstatus = `<td><span><img class="icon-image" src=${srcname} alt=${altname}/></span></td><tr>`;

  return tempstatus;
};

// eslint-disable-next-line no-unused-vars
const clearMessageContainer = () => {
  while (
    containerDiv.firstChild &&
    containerDiv.removeChild(containerDiv.firstChild)
  );
  document.getElementById('load-more').style.display = 'block';
};

// eslint-disable-next-line no-unused-vars
const hideChatForm = () => {
  document.getElementById('chatform').style.display = 'none';
  document.getElementById('message-list').style.height = '60vh';
};

// eslint-disable-next-line no-unused-vars
const loadMore = () => {
  getPublicMessagesByKeywordUsingOffset();
};

const getPublicMessagesByKeywordUsingOffset = async () => {
  const url = `${API_URL}/messages/public?words=${searchKeyword}&limit=${limit}&offset=${offset}`;
  displayMessageForSearchResults(url);
  offset += limit;
};

const displayMessageForSearchResults = async (url) => {
  await callGetMessagesAPI(url);

  messageList.forEach((msg) => {
    printMessageToPublicWall(msg, 0);
  });
};

const displayMessageForChatPublicly = async (url) => {
  await callGetMessagesAPI(url);

  messageList.reverse().forEach((msg) => {
    printMessageToPublicWall(msg, 500);
  });
};

const callGetMessagesAPI = async (url) => {
  const token = getCookie('token');
  await axios
    .get(url, {
      headers: {
        Authorization: token,
      },
    })
    .then((result) => {
      const {data} = result.data;
      messageList = data.messages;

      if (messageList.length === 0) {
        showNoDataRetrievedText();
        removeLoadMorebutton();
        messageList = [];
        return;
      }
    })
    .catch((err) => {
      alert(err.response.data.message);
    });
};

(async () => {
  const url = `${API_URL}/messages/public`;
  displayMessageForChatPublicly(url);
})();

// eslint-disable-next-line no-unused-vars
const getPublicMessagesByKeyword = async (keyword) => {
  offset = 0; // clean up offset when user start a new search
  removeNoDataRetrievedText();
  searchKeyword = keyword;
  const url = `${API_URL}/messages/public?words=${keyword}&limit=${limit}`;
  displayMessageForSearchResults(url);
  offset += limit;
};

const printMessageToPublicWall = (message, scrollHeight) => {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `
    <p class="messageheader">
      <span class="username">${message.sender_name}&nbsp;</span>
      <span class="status"><${message.status}</p>${displayStatusInPublicWall(
    message.status,
  )}</span>
      <br>
      <span class="datetime">${formatTimestamp(message.timestamp)}</span>
      
    </p>
    <br />`;
  if (
    message.message.split(' ')[3] == 'points' &&
    message.message.split(' ')[5] == 'self-assessment' &&
    message.message.split(' ')[6] == 'quiz.'
  ) {
    div.innerHTML += ` <p class="text">${message.message}<a href="/self-assessment" style="color:white;"> Let's enjoy the quiz.</a></p>`;
  } else {
    div.innerHTML += ` <p class="text">${message.message}</p>`;
  }

  containerDiv.appendChild(div);
  containerDiv.scrollTop += scrollHeight;
};

// eslint-disable-next-line no-unused-vars
const saveMessage = async () => {
  const message = document.getElementById('usermessage');
  if (!message.value) {
    // use the form native hint
    return;
  }

  const url = `${API_URL}/messages/public`;
  const token = getCookie('token');
  const body = {
    message: message.value,
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
  document.getElementById('usermessage').value = '';
};

socket.on('public-message', (msg) => {
  printMessageToPublicWall(msg, 500);
  removeNoDataRetrievedText();
});
