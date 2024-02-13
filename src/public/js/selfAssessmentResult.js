/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
function onClickExit() {
  if (confirm('Are you sure not to share the quiz?')) {
    window.location.replace('/main');
  } else {
    // Do nothing!
    console.log('So sad :(');
  }
}

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const quizResult = urlParams.get('quiz_result');

const quizResultParagraph = document.querySelector('.quiz-result');
quizResultParagraph.innerHTML = `${quizResult}`;

const shareQuizResult = async () => {
  if (confirm('Are you sure to share the quiz?')) {
    const message = `I got ${quizResult} points in self-assessment quiz.`;

    const url = `${API_URL}/messages/public`;
    const token = getCookie('token');
    const body = {
      message: message,
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
    window.location.replace('/publicwall');
  } else {
    // Do nothing!
    console.log('So sad :(');
  }
};
