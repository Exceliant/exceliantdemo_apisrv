module.exports = {
  validateIdTokenClaims: (req, res, next) => {
    if (
      req.body.idTokenClaims.sub !== undefined &&
      req.body.idTokenClaims.sub !== ""
    ) {
      next();
    } else {
      res.status(400).send("400: Missing valid id_token");
    }
  },

  validateIdTokenClaimsFromUrl: (req, res, next) => {
    if (
      Object.keys(req.query)[0] !== undefined &&
      Object.keys(req.query)[0] !== ""
    ) {
      next();
    } else {
      res.status(400).send("400: Missing valid id_token");
    }
  },
};




