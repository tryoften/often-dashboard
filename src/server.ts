import * as express from 'express';
import * as path from 'path';

let app = express();

app.use('/img/', express.static(path.join(__dirname, 'public/img')));
app.use('/fonts/', express.static(path.join(__dirname, 'public/fonts')));

app.get('/js/vendors.js', (req, res) => {
	res.sendFile(path.join(__dirname, 'public/js/vendors.js'));
});

app.get('/js/app.js', function (req, res) {
	res.sendFile(path.join(__dirname, 'public/js/app.js'));
});

app.get('/css/style.css', function (req, res) {
	res.sendFile(path.join(__dirname, 'public/css/style.css'));
});

app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(80, function (err) {
	console.log('Listening at http://localhost:8080');
});
