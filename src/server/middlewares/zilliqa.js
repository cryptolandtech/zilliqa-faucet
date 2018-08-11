const { Zilliqa } = require('zilliqa-js');
const zilliqa = new Zilliqa({
    nodeUrl: "https://api-scilla.zilliqa.com"
});

module.exports = (ctx, next) => {
    ctx.state.zilliqa = zilliqa;
    return next();
}