const recaptcha = require('recaptcha-validator')

module.exports = async (ctx, next) => {
    // TODO implement recaptcha check
    // TODO check if address is eligible to get ZILs

    try {
        const postData = ctx.request.body;
        const address = (postData.address || "").replace(/^0x/i, "");
    
        if (!/^[a-zA-Z0-9]{40}$/.test(address)) {
            throw new Error("Address is invalid!");
        }

        await recaptcha(ctx.state.config.recaptchaSecret, postData.token, ctx.request.ip)
            .catch(() => {throw new Error("Sorry we couldn't validate you're human.")});

        const targetWalletInfo = await ctx.state.utils.getBalance(
            address
        );

        if (targetWalletInfo.balance >= ctx.state.config.transferAmount) {
            throw new Error("Hey!!! Don't be greedy, you already have " + targetWalletInfo.balance + " ZILs.");
        }

        const faucetWalletInfo = await ctx.state.utils.getBalance(
            ctx.state.zilliqa.util.getAddressFromPrivateKey(ctx.state.config.faucetPrivateKey)
        );

        if (faucetWalletInfo.balance < ctx.state.config.transferAmount) {
            throw new Error("Faucet wallet balance is too low.");
        }

        const response = await ctx.state.utils.send(
            ctx.state.config.faucetPrivateKey, 
            address, 
            ctx.state.config.transferAmount
        );

        ctx.body = {
            error: null,
            data: {
                txnId: response.data.result
            },
            response
        }
    } catch (e) {
        console.log("Exception on sending ZILs", e);
        ctx.body = {
            error: e.message
        }
    }
}