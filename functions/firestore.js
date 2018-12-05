const admin = require('firebase-admin');
const functions = require("firebase-functions");

//Initialize Firebase
admin.initializeApp(functions.config().firebase);
const db = admin.database();

async function getConfig() {
    data = await db.ref('config').once('value');
    return data.val();
}

async function getNonce(network, address) {
    let node = (await db.ref(`config/nodes/${network}`).once('value')).val();

    if (address === node.address) {
        let nonce = parseInt(node.nonce, 10);
        return nonce > 0 ? nonce : 1;
    }

    return 1;
}

function updateNonce(network, address, nonce) {
    return db.ref().update({
        [`config/nodes/${network}/address`]: address,
        [`config/nodes/${network}/nonce`]: nonce
    });
}

function updateDonationTimestamp(network, address) {
    return db.ref(`lastDonationTimestamp/${network}/${address}`).set(Date.now());
}

async function getLastDonation(network, address) {
    return (await db.ref(`lastDonationTimestamp/${network}/${address}`).once('value')).val();
}

module.exports = {
    getConfig, 
    getNonce,
    getLastDonation,
    updateDonationTimestamp,
    updateNonce
}