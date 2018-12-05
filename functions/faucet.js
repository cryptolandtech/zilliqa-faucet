const recaptcha = require('recaptcha-validator');
const moonlet = require("moonlet-core/dist/lib");
const zilliqaBlockchain = require("moonlet-core/dist/lib/blockchain/zilliqa/class.index").default;
const networksZil = require('moonlet-core/dist/lib/blockchain/zilliqa/networks').default;
const { ZilliqaAccount } = require('moonlet-core/dist/lib/blockchain/zilliqa/account');
const firestore = require('./firestore');

module.exports = faucet;
const NETWORK = "testnetv3";
function faucet(NODE_URL, WALLET_MNEMONICS, PRIVATE_KEY, RECAPTCHA_SECRET, TRANSFER_AMOUNT) {
    // setup node url
    networksZil[0] = networksZil[1];
    networksZil[0].url = NODE_URL; 

    // create wallet instance
    const wallet = new moonlet.Wallet(WALLET_MNEMONICS);
    wallet.loadBlockchain(zilliqaBlockchain);
    const blockchain = wallet.getBlockchain("ZILLIQA");
    
    let account;
    if (PRIVATE_KEY) {
        account = new ZilliqaAccount({
            node: blockchain.getNode(), 
            privateKey: PRIVATE_KEY,
            type: "LOOSE"
        });

        account.publicKey = account.utils.privateToPublic(Buffer.from(PRIVATE_KEY, "hex")).toString("hex");
        account.address = account.utils.privateToAddress(Buffer.from(PRIVATE_KEY, "hex")).toString("hex");
    } else {
        account = blockchain.createAccount();
    }

    async function sendTokens(address) {
        address = (address || "").replace(/^0x/i, "");
        address = address.toUpperCase();
        
        if (!/^[a-zA-Z0-9]{40}$/.test(address)) {
            throw new Error("Address is invalid!");
        }

        const balance = (await blockchain.getNode().getBalance(address)).toNumber();
        if (balance >= TRANSFER_AMOUNT) {
            throw new Error("Hey!!! Don't be greedy, you already have " + balance + " ZILs.");
        }

        let lastDonation = await firestore.getLastDonation(NETWORK, address);
        if (lastDonation && Date.now() - lastDonation < 30 * 60 * 1000) {
            throw new Error("You're spending too much man !!! It didn't even pass 30 minutes and you're are out of ZILs.");
        }

        const nonces = await Promise.all([
            account.getNonce().then(n => parseInt(n)),
            firestore.getNonce(NETWORK, account.address)
        ]);
        const nonce = Math.max(...nonces);

        // quickly update nonce
        firestore.updateNonce(NETWORK, account.address, nonce + 1);

        const tx = account.buildTransferTransaction(address, TRANSFER_AMOUNT, nonce, 10, 100);
        account.signTransaction(tx);

        let txRes = await account.send(tx);
        if (txRes.txn && txRes.txn.TranID) {
            firestore.updateDonationTimestamp(NETWORK, address);
        }

        return txRes;
    }

    async function validateRecaptchaToken(ip, token) {
        return await recaptcha(RECAPTCHA_SECRET, token, ip)
            .catch((e) => {
                console.log(e);
                throw new Error("Sorry we couldn't validate you're human.");
            });
    }

    return {
        sendTokens,
        validateRecaptchaToken
    }
}