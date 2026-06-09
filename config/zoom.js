// config/zoom.js

const axios = require("axios");
const zoomAccount = require("./zoomAccounts");

exports.getAccessToken = async () => {
  const res = await axios.post(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${zoomAccount.accountId}`,
    {},
    {
      auth: {
        username: zoomAccount.clientId,
        password: zoomAccount.clientSecret
      }
    }
  );

  return res.data.access_token;
};