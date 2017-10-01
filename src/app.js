import path from "path"
import express from "express"
import favicon from "serve-favicon"
import crawler from "./crawler/crawler"

const app = express();

app.use('/', require('./controller/index'));
app.use('/api/', require('./controller/api'));
app.use('/admin/', require('./controller/admin'));

app.set('views', path.join(__dirname, 'view'));
app.set('view engine', 'jade');
app.disable('x-powered-by');

app.use(express.static(path.resolve(__dirname + '/public')));
app.use(favicon(__dirname + '/public/images/favicon.ico'));


const port = process.env.PORT || 3000;
app.listen(port);
console.log(`server start => port:${port}`);

crawler.init();
console.log(`setup and init crawler..`);

module.exports = app;