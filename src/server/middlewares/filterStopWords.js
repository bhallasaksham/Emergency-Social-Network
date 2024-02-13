import {stopWords} from '/server/util/stopWords';
import {RESPONSE_TYPE} from '/server/util/enum';

const filterStopWords = (type) => {
  return async function (req, res, next) {
    // if req.query has key `words`, it's search scenario
    if (req.query.words) {
      const filtered = req.query.words
        .split(',')
        .filter((c) => !stopWords.has(c));

      // search scenario but all words are filtered, then return empty response
      if (filtered.length === 0) {
        switch (type) {
          case RESPONSE_TYPE.MESSAGE:
            return res.status(200).send({
              type: RESPONSE_TYPE.MESSAGE,
              data: {messages: []},
              message: 'success',
            });
          case RESPONSE_TYPE.CHAT:
            return res.status(200).send({
              type: RESPONSE_TYPE.CHAT,
              data: {messages: []},
              message: 'success',
            });
          case RESPONSE_TYPE.ANNOUNCEMENT:
            return res.status(200).send({
              type: RESPONSE_TYPE.ANNOUNCEMENT,
              data: {announcements: []},
              message: 'success',
            });
          default:
            return res.status(400).send({
              type: RESPONSE_TYPE.UNKNOWN,
              data: {},
              message: 'unknown type',
            });
        }
      }
      req.query.words = filtered.toString();
    }

    next();
  };
};

export {filterStopWords};
