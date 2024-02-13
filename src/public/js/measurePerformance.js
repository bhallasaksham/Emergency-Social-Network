/* eslint-disable no-undef */

const POST_REQUEST_LIMIT = 1000;

let postRequestCount = 0;
let getRequestCount = 0;
let terminatationFlag = false;

const calculatePerformanceStatus = async (duration) => {
  const postPerformance = postRequestCount / (duration / 2);
  const getPerformance = getRequestCount / (duration / 2);
  console.log(
    'Post Performance (Number of POST requests completed per second): ' +
      postPerformance,
  );
  console.log(
    'Get Performance (Number of GET requests completed per second): ' +
      getPerformance,
  );

  showTestResult(postPerformance, getPerformance);
};

function showTestResult(postResult, getResult) {
  let query = new URLSearchParams();
  query.append('post_result', postResult);
  query.append('get_result', getResult);

  let url = `/measure-performance-report?` + query.toString();
  window.location.replace(url);
}

// eslint-disable-next-line no-unused-vars
const startPerformanceTest = async () => {
  //duration unit seconds, interval millisecond
  disableNavBarBtn();
  const duration = document.getElementById('duration').value;
  const durationInMillisecond = duration * 1000;
  const interval = document.getElementById('interval').value;
  if (interval <= 0) {
    alert('interval should not less than 0 millisecond!');
    return;
  }

  console.log('user input duration(s) :' + duration);
  console.log('user input interval(ms) :' + interval);

  try {
    // 1. notify server to prepare for perf test env & disable admin's nav bar
    await callStartPerfTestAPI();

    // 2. callPostAPIByInterval
    console.log('enter post api call');
    let expectTimeToStop = Date.now() + durationInMillisecond / 2;
    while (Date.now() < expectTimeToStop && !terminatationFlag) {
      // Use Case A2 flow, stop the perf test immediately and notify admin
      if (postRequestCount >= POST_REQUEST_LIMIT) {
        // wait 1s till all ongoing POST request finished
        await new Promise((r) => setTimeout(r, 1000));
        await callStopPerfTestAPI();
        enableHamburgerBtn();
        alert(
          'performance test over POST limit!! stop to test to save our server',
        );
        return;
      }
      await callPostMessageAPI();
      await new Promise((r) => setTimeout(r, interval));
    }

    // 3. callGetAPIByInterval
    console.log('enter get api call');
    expectTimeToStop = Date.now() + durationInMillisecond / 2;
    while (Date.now() < expectTimeToStop && !terminatationFlag) {
      await callGetMessagesAPI();
      await new Promise((r) => setTimeout(r, interval));
    }

    // 4. notify server to resume normal operation & enable admin's nav bar
    await callStopPerfTestAPI();

    // 5. generateReport
    if (!terminatationFlag) {
      calculatePerformanceStatus(duration);
    }

    // 6. reset global variable
    postRequestCount = 0;
    getRequestCount = 0;
    terminatationFlag = false;
  } catch (err) {
    alert(err);
  }
};

// eslint-disable-next-line no-unused-vars
const onClickTerminatePerformanceTestBtn = () => {
  terminatationFlag = true;
};

const callPostMessageAPI = async () => {
  const testMessage = 'This is test message';
  const url = `${API_URL}/messages/public`;
  const token = getCookie('token');
  const body = {
    message: testMessage,
  };
  const result = await axios.post(url, Qs.stringify(body), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Access-Control-Allow-Origin': '*',
      Authorization: token,
    },
  });

  if (result.status == 201) {
    postRequestCount += 1;
    console.log('POST request count: ', postRequestCount);
  }
};

const callGetMessagesAPI = async () => {
  const url = `${API_URL}/messages/public`;
  const token = getCookie('token');
  const result = await axios.get(url, {
    headers: {
      Authorization: token,
    },
  });

  if (result.status == 200) {
    getRequestCount += 1;
    console.log('GET request count: ', getRequestCount);
  }
};

const callStartPerfTestAPI = async () => {
  const url = `${API_URL}/performance/start`;
  const token = getCookie('token');
  await axios.put(url, Qs.stringify(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Access-Control-Allow-Origin': '*',
      Authorization: token,
    },
  });
  console.log('start perf test successfully');
};

const callStopPerfTestAPI = async () => {
  enableNavBarBtn();
  const url = `${API_URL}/performance/stop`;
  const token = getCookie('token');
  await axios.put(url, Qs.stringify(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Access-Control-Allow-Origin': '*',
      Authorization: token,
    },
  });
  console.log('stop perf test successfully');
};
