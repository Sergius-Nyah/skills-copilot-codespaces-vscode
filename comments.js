// Create web server

var http = require('http');
var fs = require('fs');
var path = require('path');
var url = require('url');
var comments = require('./comments.json');
var qs = require('querystring');

http.createServer(function (req, res) {
    var urlObj = url.parse(req.url, true);
    var pathname = urlObj.pathname;
    var query = urlObj.query;
    if (pathname === '/') {
        res.writeHead(200, {'Content-Type': 'text/html'});
        fs.createReadStream('./index.html').pipe(res);
    } else if (pathname === '/comments.json') {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(comments));
    } else if (pathname === '/comment') {
        var comment = '';
        req.on('data', function (chunk) {
            comment += chunk;
        });
        req.on('end', function () {
            comment = qs.parse(comment);
            comment.id = Date.now();
            comments.unshift(comment);
            fs.writeFile('./comments.json', JSON.stringify(comments, null, 4), function (err) {
                if (err) console.log(err);
                res.end(JSON.stringify(comment));
            });
        });
    } else {
        fs.exists('.' + pathname, function (exists) {
            if (exists) {
                res.writeHead(200, {'Content-Type': 'text/html'});
                fs.createReadStream('.' + pathname).pipe(res);
            } else {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.end('404 Not Found');
            }
        });
    }
}).listen(3000, function () {
    console.log('Server is running at http://localhost:3000/');
}); 
