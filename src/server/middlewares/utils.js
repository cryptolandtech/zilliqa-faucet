module.exports = (ctx, next) => {
    let zilliqa = ctx.state.zilliqa;

    function getBalance(address) {
        return new Promise((resolve, reject) => {
            zilliqa.getNode().getBalance({address: address}, (error, data) => {
                if (!error && data.result) {
                    return resolve(data.result);
                }
                return reject({error, data});
            });
        });
    }

    function getTransactionHistory(address) {
        return new Promise((resolve, reject) => {
            zilliqa.getNode().getTransactionHistory(address, (error, data) => {
                if (!error && data.result) {
                    return resolve(data.result);
                }
                return reject({error, data});
            });
        })
    }
        
    async function send(privateKey, toAddress, amount) {
        const walletInfo = await getBalance(zilliqa.util.getAddressFromPrivateKey(privateKey));
    
        return new Promise((resolve, reject) => {
            // transaction details
            let txnDetails = {
                version: 0,
                nonce: walletInfo.nonce + 1,
                to: toAddress,
                amount: amount,
                gasPrice: 1,
                gasLimit: 1
            };
    
            // sign the transaction using util methods
            let txn = zilliqa.util.createTransactionJson(privateKey, txnDetails);
    
            // send the transaction to the node
            zilliqa.getNode().createTransaction(txn, (err, data) => {
                resolve({err, data, txnDetails, walletInfo});
            });
        });
    }
   
    ctx.state.utils = {
        send,
        getBalance,
        getTransactionHistory
    }

    return next();
}