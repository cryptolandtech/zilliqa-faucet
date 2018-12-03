const recaptcha = require('recaptcha-validator');

module.exports = faucet;

function faucet(NODE_URL, WALLET_MNEMONICS, RECAPTCHA_SECRET, TRANSFER_AMOUNT) {
    // import moonlet core
    const moonlet = require("moonlet-core/dist/lib");
    const zilliqaBlockchain = require("moonlet-core/dist/lib/blockchain/zilliqa/class.index").default;

    // setup node url
    const networksZil = require('moonlet-core/dist/lib/blockchain/zilliqa/networks').default;
    networksZil[0] = networksZil[1];
    networksZil[0].url = NODE_URL; 

    // create wallet instance
    const wallet = new moonlet.Wallet(WALLET_MNEMONICS);
    wallet.loadBlockchain(zilliqaBlockchain);
    const blockchain = wallet.getBlockchain("ZILLIQA");
    const account = blockchain.createAccount();

    async function sendTokens(address) {
        address = (address || "").replace(/^0x/i, "");
        
        if (!/^[a-zA-Z0-9]{40}$/.test(address)) {
            throw new Error("Address is invalid!");
        }
        
        const balance = (await blockchain.getNode().getBalance(address)).toNumber();
        if (balance >= TRANSFER_AMOUNT) {
            throw new Error("Hey!!! Don't be greedy, you already have " + balance + " ZILs.");
        }

        const nonce = await account.getNonce();
        const tx = account.buildTransferTransaction(address, TRANSFER_AMOUNT, nonce, 10, 100);
        account.signTransaction(tx);

        return account.send(tx);
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