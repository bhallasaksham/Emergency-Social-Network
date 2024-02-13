const saveQuiz = (quizCollection, insertValues) => {
  // connect DB & write data
  return new Promise((resolve, reject) => {
    quizCollection.create(insertValues, (err, message) => {
      /* istanbul ignore next */
      if (err) {
        reject(err);
      }
      resolve(message);
    });
  });
};

const getQuizzes = (quizCollection) => {
  return new Promise((resolve, reject) => {
    quizCollection
      .find({}, (err, user) => {
        /* istanbul ignore next */
        if (err) {
          reject(err);
        }
        resolve(user);
      })
      .limit(10);
  });
};

const getQuiz = (quizCollection, query) => {
  return new Promise((resolve, reject) => {
    quizCollection.findOne({quiz_title: query.quiz_title}, (err, user) => {
      /* istanbul ignore next */
      if (err) {
        reject(err);
      }
      resolve(user);
    });
  });
};

export default {getQuizzes, saveQuiz, getQuiz};
