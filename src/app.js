import path from "path"
import express from "express"
import favicon from "serve-favicon"

const app = express();

app.use('/', require('./controller/index'));
app.use('/api/v1/', require('./controller/api'));

app.set('views', path.join(__dirname, 'view'));
app.set('view engine', 'jade');
app.disable('x-powered-by');

app.use(express.static(path.resolve('public')));
app.use(favicon(__dirname + '/public/images/favicon.ico'));


const port = process.env.PORT || 3000;
app.listen(port);
console.log(`server start => port:${port}`);

module.exports = app;