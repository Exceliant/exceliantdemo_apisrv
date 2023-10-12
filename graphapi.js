require("isomorphic-fetch");
const azure = require("@azure/identity");
const graph = require("@microsoft/microsoft-graph-client");
const authProviders = require("@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials");
require("dotenv").config();

function initializeGraphClient() {
  _clientSecretCredential = new azure.ClientSecretCredential(
    process.env.GRAPH_TENANT_ID,
    process.env.GRAPH_CLIENT_ID,
    process.env.GRAPH_CLIENT_SECRET
  );

  const authProvider = new authProviders.TokenCredentialAuthenticationProvider(
    _clientSecretCredential,
    {
      scopes: ["https://graph.microsoft.com/.default"],
    }
  );

  _appClient = graph.Client.initWithMiddleware({
    authProvider: authProvider,
    defaultVersion: "beta",
  });

  return _appClient;
}

module.exports = {
  // Get one user record from GraphAPI
  getUser: (req, res) => {
    const appClient = initializeGraphClient();
    const oid = req.body.idTokenClaims.sub;
    appClient
      .api("/users/" + oid)
      .get()
      .then((resp) => {
        res.status(200).send(JSON.stringify(resp));
      });
  },

  // Update one user record in GraphAPI
  updateUser: (req, res) => {
    const appClient = initializeGraphClient();
    const oid = req.body.idTokenClaims.sub;
    delete Object.assign(req.body.userData, {
      ["extension_" + process.env.B2C_EXTENSION + "_mfaType"]:
        req.body.userData["mfaType"],
    })["mfaType"];
    req.body.userData.displayName =
      req.body.userData.givenName + " " + req.body.userData.surname;
    appClient
      .api("/users/" + oid)
      .header("Content-Type", "application/json")
      .update(req.body.userData)
      .then((resp) => {
        res.status(200).send("User updated");
      });
  },
};
