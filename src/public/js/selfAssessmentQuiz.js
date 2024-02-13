/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const quiztContainer = document.getElementsByClassName('quiz-panel')[0];
let count = 1;
let correct_answer = {};
let points;
(async () => {
  const url = `${API_URL}/quizzes`;
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
      data.quizzes.forEach((a) => {
        let quizHTML = `
          <div class="sub-panel">
            Question ${count}
            <br />
            ${a.quiz_title}
            <br /> `;

        if (a.type == 'Single') {
          quizHTML += `
            <input type="radio" id="option1" name="question${count}" value="1" />
            <label for="option1">${a.option1}</label><br />
            <input type="radio" id="option2" name="question${count}" value="2" />
            <label for="option2">${a.option2}</label><br />`;
          if (a.option3 != 'Undefined') {
            quizHTML += `<input type="radio" id="option3" name="question${count}" value="3" />
              <label for="option3">${a.option3}</label><br />`;
          }
          if (a.option4 != 'Undefined') {
            quizHTML += `<input type="radio" id="option4" name="question${count}" value="4" />
                <label for="option4">${a.option4}</label><br /> 
              </div>`;
          }
        } else {
          quizHTML += `
            <input type="Checkbox" id="option1" name="question${count}" value="1" />
            <label for="option1">${a.option1}</label><br />
            <input type="Checkbox" id="option2" name="question${count}" value="2" />
            <label for="option2">${a.option2}</label><br />`;
          if (a.option3 != 'Undefined') {
            quizHTML += `<input type="Checkbox" id="option3" name="question${count}" value="3" />
              <label for="option3">${a.option3}</label><br />`;
          }
          if (a.option4 != 'Undefined') {
            quizHTML += `<input type="Checkbox" id="option4" name="question${count}" value="4" />
                <label for="option4">${a.option4}</label><br /> 
              </div>`;
          }
        }
        correct_answer[`question${count}`] = a.answer;
        count += 1;
        quiztContainer.insertAdjacentHTML('beforeend', quizHTML);
      });
    })
    .catch((err) => {
      alert(err.response.data.message);
    });
})();

const checkQuizzes = (choices) => {
  points = 0;
  for (let i = 1; i < 11; i++) {
    if (
      choices[`question${i}`].every(
        (val, idx) => val === correct_answer[`question${i}`][idx],
      )
    ) {
      points += 10;
    }
  }
};

function showQuizResult(points) {
  let query = new URLSearchParams();
  query.append('quiz_result', points);
  let url = `/self-assessment-result?` + query.toString();
  window.location.replace(url);
}

const submitQuiz = async () => {
  const form = document.querySelector('form');
  const data = new FormData(form);
  const choices = {};
  for (const question of data) {
    if (choices[question[0]] == undefined) {
      choices[question[0]] = [];
    }
    choices[question[0]].push(question[1]);
  }
  if (Object.keys(choices).length < 10) {
    alert('Please finished all the questions');
    return;
  }
  if (confirm('Are you sure you want to submit this quiz?')) {
    checkQuizzes(choices);
    showQuizResult(points);
  } else {
    // Do nothing!
    console.log('So sad :(');
  }
};
