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
    //console.log('request made to web API at: ' + new Date().toString());
    try {
        const response = await axios.get(endpoint, options);
        return response;
    } catch (error) {
        console.log(error)
        return error;
    }
};

async function patchApi(endpoint, body, accessToken) {
    const options = {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Prefer": "return=representation"
        }
    };
    //console.log('request made to web API at: ' + new Date().toString());
    try {
        const response = await axios.patch(endpoint, body, options);
        return response;
    } catch (error) {
        console.log(error)
        return error;
    }
};

module.exports = {
  getContacts: (async (req,res) => {
    try {
        apiUri = apiConfig.uri + "/contacts";
        const authResponse = await getToken(tokenRequest);
        const response = await getApi(apiUri, authResponse.accessToken);
        res.status(200).send(JSON.stringify(response.data))
    } catch (error) {
        console.log(error);
    }
  }),

  findContact: (async (req,res) => {
    try {
        const oid = req._parsedUrl.query;
        //console.log("reqBody:", oid);
        //apiUri = apiConfig.uri + "/contacts?$filter=contains(cr74b_b2c_objectid,'8ca3fdec-8164-4999-8e8a-9d0b58d50b13')";
        
        apiUri = apiConfig.uri + "/contacts?$filter=contains(cr74b_b2c_objectid," + `'${oid}'` + ")";
        const authResponse = await getToken(tokenRequest);
        const response = await getApi(apiUri, authResponse.accessToken);
        //res.status(200).send(JSON.stringify(response.data));
        
        // Update user
        contactId = response.data.value[0].contactid;
        const body = {"lastname": "Struts"};
        const patchApiUri = apiConfig.uri + "/contacts(" + contactId + ")";
        const response1 = await patchApi(patchApiUri, body, authResponse.accessToken);
        console.log("updatedContact:", response1);

    } catch (error) {
        console.log(error);
    }
  })
};