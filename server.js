const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const guard = require("./guard.js");
const graphapi = require("./graphapi.js");
const dataverseapi = require("./dataverseapi.js");


app.use(cors());
app.use(express.json()); // support json encoded bodies
app.use(express.urlencoded({ extended: true })); // support encoded bodies

app.get("/", (req, res) => {
  res.send(
    "Hello from Exceliant. Please visit us at <a href='https://exceliant.ca'>Exceliant</a>"
  );
});

/*************************************************************************
 * MS GraphAPI requests
 **************************************************************************/
app.post(
  "/graphapi/getuser", 
  guard.validateIdTokenClaims, 
  graphapi.getUser
);
app.patch(
  "/graphapi/updateuser",
  guard.validateIdTokenClaims,
  graphapi.updateUser
);

/*************************************************************************
 * Dataverse GraphAPI requests
 **************************************************************************/

app.get(
  "/dataverse/contacts",
  dataverseapi.getContacts
);

app.post(
  "/dataverse/contact",
  guard.validateIdTokenClaims,
  dataverseapi.updateContact
);


////////////////////////////////////




// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
