const functions = require("firebase-functions");
const express = require('express');
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors({ origin: true }));
app.use(bodyParser.json());

const faucet = require("./faucet")(
    functions.config().faucet.node_url,
    functions.config().faucet.wallet_mnemonics,
    functions.config().faucet.wallet_private_key,
    functions.config().faucet.recaptcha_secret,
    functions.config().faucet.transfer_amount
);

app.post("/api/faucet/requestTokens", async (req, res) => {
    try {
        const postData = req.body;
        const ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || '').split(',')[0].trim();

        await faucet.validateRecaptchaToken(ip, postData.token);
        let response = await faucet.sendTokens(postData.address);
        
        //console.log(response);
        res.send({
            error: null,
            data: {
                txnId: response.txn.TranID
            },
            response
        });
    } catch (e) {
        //console.log("Exception on sending ZILs", e);
        res.send({
            error: e.message
        });
    }
});
  
module.exports = {
    faucet: functions.https.onRequest((request, response) => {
        if (!request.path) {
            request.url = `/${request.url}` // prepend '/' to keep query params if any
        }
        return app(request, response)
    })
};