module.exports = (ctx, next) => {
    ctx.state.config = {
        nodeUrl: process.env.NODE_URL || "https://api-scilla.zilliqa.com",
        faucetPrivateKey: process.env.PRIVATE_KEY,
        transferAmount: 10,
        recaptchaSecret: process.env.RECAPTCHA_SECRET
    };
    return next();
}