const regexp = new RegExp(/^.{8}-.{4}-.{4}-.{4}-.{12}$/);
module.exports = {
  validateIdTokenClaims: (req, res, next) => {
    if (
      req.body.idTokenClaims.sub !== undefined &&
      req.body.idTokenClaims.sub !== "" &&
      regexp.test(req.body.idTokenClaims.sub) == true
    ) {
      next();
    } else {
      res.status(400).send("400: Missing valid id_token");
    }
  },

  validateIdTokenClaimsFromUrl: (req, res, next) => {
    if (
      Object.keys(req.query)[0] !== undefined &&
      Object.keys(req.query)[0] !== "" &&
      regexp.test(Object.keys(req.query)[0]) == true
    ) {
      next();
    } else {
      res.status(400).send("400: Missing valid id_token");
    }
  },
};




