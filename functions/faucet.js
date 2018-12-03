const recaptcha = require('recaptcha-validator');
const moonlet = require("moonlet-core/dist/lib");
const zilliqaBlockchain = require("moonlet-core/dist/lib/blockchain/zilliqa/class.index").default;
const networksZil = require('moonlet-core/dist/lib/blockchain/zilliqa/networks').default;
const { ZilliqaAccount } = require('moonlet-core/dist/lib/blockchain/zilliqa/account');

module.exports = faucet;

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
        
        if (!/^[a-zA-Z0-9]{40}$/.test(address)) {
            throw new Error("Address is invalid!");
        }
        
        const balance = (await blockchain.getNode().getBalance(address)).toNumber();
        if (balance >= TRANSFER_AMOUNT) {
            throw new Error("Hey!!! Don't be greedy, you already have " + balance + " ZILs.");
        }

        const nonce = await account.getNonce();
        const tx = account.buildTransferTransaction(address, TRANSFER_AMOUNT, nonce, 10, 100);
        // console.log(tx);
        // console.log(account);
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