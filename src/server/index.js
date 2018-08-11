const Koa = require('koa');
const static = require('koa-static');
const route = require('koa-route');
const bodyParser = require('koa-bodyparser');

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load();
}

const app = new Koa();

app.use(bodyParser());

// serve static files
if (process.env.UI_BUILD_PATH) {
    app.use(static(process.env.UI_BUILD_PATH));
}

// expose configs
app.use(require('./middlewares/config'));

// setup zilliqa library instance
app.use(require('./middlewares/zilliqa'));

// expose some util functions for wallet operations
app.use(require('./middlewares/utils'));

// mount routes
app.use(route.all('/api/sendZil', require('./routes/send-zil')));

app.listen(process.env.PORT, () => {
    console.log('App started on port', process.env.PORT);
});
