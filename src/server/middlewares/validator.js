const validateQuery = (validationRule) => {
  return async function (req, res, next) {
    try {
      const validated = await validationRule.validateAsync(req.query);
      req.query = validated;
      next();
    } catch (err) /* istanbul ignore next */ {
      if (err.isJoi)
        return next(
          res.status(422).send({
            message: err.message,
          }),
        );
    }
  };
};

const validateBody = (validationRule) => {
  return async function (req, res, next) {
    try {
      const validated = await validationRule.validateAsync(req.body);
      req.body = validated;
      next();
    } catch (err) /* istanbul ignore next */ {
      if (err.isJoi)
        return next(
          res.status(422).send({
            message: err.message,
          }),
        );
    }
  };
};

const validateParam = (validationRule) => {
  return async function (req, res, next) {
    try {
      const validated = await validationRule.validateAsync(req.params);
      req.params = validated;
      next();
    } catch (err) /* istanbul ignore next */ {
      if (err.isJoi)
        return next(
          res.status(422).send({
            message: err.message,
          }),
        );
    }
  };
};

export {validateBody, validateParam, validateQuery};
