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
};
