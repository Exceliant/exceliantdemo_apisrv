const msal = require('@azure/msal-node');
const axios = require('axios');
require("dotenv").config();

/**
 * Configuration object to be passed to MSAL instance on creation. 
 * For a full list of MSAL Node configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/configuration.md 
 */
const msalConfig = {
	auth: {
		clientId: process.env.DATAVERSE_CLIENT_ID,
		authority: process.env.AAD_ENDPOINT + process.env.AZURE_TENANT_ID,
		clientSecret: process.env.DATAVERSE_CLIENT_SECRET
	}
};

/**
 * With client credentials flows permissions need to be granted in the portal by a tenant administrator.
 * The scope is always in the format '<resource-appId-uri>/.default'. For more, visit: 
 * https://docs.microsoft.com/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow 
 */
const tokenRequest = {
	scopes: [process.env.DATAVERSE_ENDPOINT + '.default'], // e.g. 'https://graph.microsoft.com/.default'
};

const apiConfig = {
	uri: process.env.DATAVERSE_ENDPOINT + 'api/data/v9.2', // e.g. 'https://graph.microsoft.com/v1.0/users'
};

/**
 * Initialize a confidential client application. For more info, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/initialize-confidential-client-application.md
 */
const cca = new msal.ConfidentialClientApplication(msalConfig);

/**
 * Acquires token with client credentials.
 * @param {object} tokenRequest 
 */
async function getToken(tokenRequest) {
	return await cca.acquireTokenByClientCredential(tokenRequest);
}

/////////////////////// Fetching Data //////////////////////////////
/**
 * Calls the endpoint with authorization bearer token.
 * @param {string} endpoint 
 * @param {string} accessToken 
 */
async function getApi(endpoint, accessToken) {
    const options = {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    };
    try {
        const response = await axios.get(endpoint, options);
        return response;
    } catch (error) {
        throw error;
    }
};

async function patchApi(endpoint, body, accessToken) {
    const options = {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Prefer": "return=representation"
        }
    };
    try {
        const response = await axios.patch(endpoint, body, options);
        return response;
    } catch (error) {
        throw error;
    }
};

async function createApi(endpoint, body, accessToken) {
    const options = {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Prefer": "return=representation"
        }
    };
    try {
        const response = await axios.post(endpoint, body, options);
        return response;
    } catch (error) {
        throw error;
    }
};


module.exports = {
  getContact: (async (req,res) => {
    try {
        sub = Object.keys(req.query)[0];
        apiUri = apiConfig.uri + "/contacts?$filter=cr74b_b2c_objectid eq " + sub + "&$select=contactid,firstname,lastname,emailaddress1,cr74b_b2c_objectid";
        const authResponse = await getToken(tokenRequest);
        const response = await getApi(apiUri, authResponse.accessToken);
        res.status(200).send(JSON.stringify(response.data))
    } catch (error) {
       if (error.response.status == 400) {
        res.status(400).json({ error: error.message })
       }
       else {
        res.status(500).json({ error: 'Internal Server Error' })
       }
    }
  }),

  updateContact: (async (req,res) => {
    try {
        // find user by B2C objectId to get contactId
        const sub = req.body.idTokenClaims.sub;
        const firstname = req.body.idTokenClaims.firstname;
        const lastname = req.body.idTokenClaims.lastname;
        apiUri = apiConfig.uri + "/contacts?$filter=cr74b_b2c_objectid eq " + sub;
        const authResponse = await getToken(tokenRequest);
        const response = await getApi(apiUri, authResponse.accessToken);

        // Update user
        contactId = response.data.value[0].contactid;
        const body = {"firstname" : firstname, "lastname": lastname};
        const patchApiUri = apiConfig.uri + "/contacts(" + contactId + ")";
        await patchApi(patchApiUri, body, authResponse.accessToken);
        res.status(200).send(JSON.stringify({"Transaction result": "User has been updated successfully"}))

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' })
    }
  }),

  createContact: (async (req,res) => {
    try {
        const sub = req.body.idTokenClaims.sub;
        const firstname = req.body.idTokenClaims.firstname;
        const lastname = req.body.idTokenClaims.lastname;
        const email = req.body.idTokenClaims.email;
        const authResponse = await getToken(tokenRequest);
        // Create user
        const body = {
            "firstname" : firstname, 
            "lastname": lastname, 
            "emailaddress1": email,
            "cr74b_b2c_objectid": sub
        };
        const createApiUri = apiConfig.uri + "/contacts";
        await createApi(createApiUri, body, authResponse.accessToken);
        res.status(200).send(JSON.stringify({"Transaction result": "User has been created successfully"}))

    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' })
    }
  })
};