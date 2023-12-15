const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require("crypto");
const querystring = require('querystring');

const stateMap = new Map();
router.get("/", (req, res) =>
{
    const state = crypto.randomBytes(16).toString("hex");
    stateMap.set(state, false);

    const params = querystring.stringify({
        response_type: 'code',
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: process.env.REDIRECT_URI,
        scope: 'openid profile email',
        state: state,
    });

    const authUrl = `https://accounts.google.com/o/oauth2/auth?${params}`;
    res.redirect(authUrl);
});

router.get("/callback", async (req, res) =>
{
    const { code, state } = req.query;

    // Check the state parameter to prevent CSRF attacks
    if (stateMap.has(state))
    {
        stateMap.set(state, true);

        const tokenUrl = 'https://oauth2.googleapis.com/token';
        const data = {
            code: code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.REDIRECT_URI,
            grant_type: 'authorization_code',
        };

        try
        {
            const response = await axios.post(tokenUrl, querystring.stringify(data), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            const accessToken = response.data.access_token;

            // Fetch user profile using the access token
            const profileUrl = 'https://www.googleapis.com/oauth2/v2/userinfo';
            const profileResponse = await axios.get(profileUrl, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const userProfile = profileResponse.data;
            console.log(JSON.stringify(userProfile));
            res.redirect(`/profile?name=${userProfile.name}`);;
        } catch (error)
        {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    } else
    {
        /* Could not validate that OAuth flow was initiated by user */
        res.status(403).send('Invalid state parameter');
    }
});

module.exports = router;