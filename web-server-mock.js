#! /usr/bin/env node

/**
 * 在Web-server.js的基础上，增加模拟restful api的支持，提供前端ajax开发的模拟数据支撑
 * author: Somax Ma <somaxj@gmail.com>,
 * license: ISC,
 * version: 0.2.2
 */



var util = require('util'),
    http = require('http'),
    fs = require('fs'),
    url = require('url'),
    events = require('events'),

    mock = require('./modules/mock'),
    qs = require('querystring');

    liveload = require('./modules/liveload')

var DEFAULT_PORT = 8002;

var VERSION = '0.2.2 dev';


if(process.argv[2] ==='-v'){
  console.log(VERSION);
  return;
}

//读取数据
mock.readAPI('./mockdata/');



function main(argv) {



  new HttpServer({
    'GET': createServlet(StaticServlet),
    'POST': createServlet(StaticServlet),
    'PUT': createServlet(StaticServlet),
    'DELETE': createServlet(StaticServlet),
    'HEAD': createServlet(StaticServlet),
    'OPTIONS': createServlet(StaticServlet)
  }).start(Number(argv[2]) || DEFAULT_PORT,argv[3]);
}

function escapeHtml(value) {
  return value.toString().
    replace('<', '&lt;').
    replace('>', '&gt;').
    replace('"', '&quot;');
}

function createServlet(Class) {
  var servlet = new Class();
  return servlet.handleRequest.bind(servlet);
}




/**
 * An Http server implementation that uses a map of methods to decide
 * action routing.
 *
 * @param {Object} Map of method => Handler function
 */
function HttpServer(handlers) {
  this.handlers = handlers;
  this.server = http.createServer(this.handleRequest_.bind(this));
}




HttpServer.prototype.start = function(port,watchFile) {

  this.port = port;

//监视文件 
  liveload.watch(this.server,watchFile);




  this.server.listen(port);
  util.puts('WSM ('+VERSION+') running at http://localhost:' + port + '/\n');

};

HttpServer.prototype.parseUrl_ = function(urlString) {
  var parsed = url.parse(urlString);
  parsed.pathname = url.resolve('/', parsed.pathname);
  return url.parse(url.format(parsed), true);
};

HttpServer.prototype.handleRequest_ = function(req, res) {
  var logEntry = req.method + ' ' + req.url;
  if (req.headers['user-agent']) {
    logEntry += ' ' + req.headers['user-agent'];
  }
  util.puts(logEntry);
  req.url = this.parseUrl_(req.url);
  var handler = this.handlers[req.method];
  if (!handler) {
    res.writeHead(501);
    res.write('Method: '+req.method + 'Not Implemented')
    res.end();
  } else {
    handler.call(this, req, res);
  }
};

/**
 * Handles static content.
 */
function StaticServlet() {}

StaticServlet.MimeMap = {
  'txt': 'text/plain',
  'html': 'text/html',
  'css': 'text/css',
  'xml': 'application/xml',
  'json': 'application/json',
  'js': 'application/javascript',
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'gif': 'image/gif',
  'png': 'image/png',
  'svg': 'image/svg+xml'
};





StaticServlet.prototype.handleRequest = function(req, res) {
  var self = this;
  var path = ('./' + req.url.pathname).replace('//','/').replace(/%(..)/g, function(match, hex){
    return String.fromCharCode(parseInt(hex, 16));
  });
  var parts = path.split('/');

  if (parts[parts.length-1].charAt(0) === '.')
    return self.sendForbidden_(req, res, path);




function processRequest(req, callback) {
    var body = '';
    req.on('data', function (data) {
        body += data;
    });
    req.on('end', function () {
      console.log(req.headers)

      // if(req.headers['content-type'] && req.headers['content-type'].search('/json')>0){
      if(/\/json/i.test(req.headers['content-type'])){
        try{
          console.log('body::',body)
          var data = JSON.parse(body);
          console.log('data::',data)

          callback(data);
        }catch(e){
          console.log('ERROR: parse json error!');
          self.sendError_(req,res,'ERROR: parse json error!')
        }
      }else{
          console.log('content-type not application/json::',body);         
          callback(qs.parse(body));
      }   
    });
}

  // api 模拟
  console.log(req.url,parts)
  if (parts[1] == 'api') {
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','POST, GET, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers','accept, content-type');

    try {
      var _dataParts = parts.slice(2);
      var url = '/' + _dataParts.join('/');

      switch (req.method) {
        case 'GET':
          var code=200,data = mock.GET(req.url.path);
          if(!data){
            data = {error:'not find!'};
            code = 404;
          }
          return self.sendData_(req, res, url, data,code);
        case 'POST':
          processRequest(req, function(newData) {
              self.sendData_(req, res, url, mock.POST(_dataParts,newData), 201);
          });
          break;
        case 'OPTIONS':
          res.end();
          break;
        case 'PUT':
          processRequest(req, function(newData) {
              self.sendData_(req, res, url, mock.PUT(_dataParts,newData), 201);
          });
          break;
        case 'DELETE':
          var msg,code,
            state = mock.DELETE(_dataParts);
          if(state){
            if(state == 404){
              msg = 'not exist!';
              code = 404;
            }else{
              msg = 'delete success!';
              code = 200;
            }
            
          }else{
            msg = 'delete fail!';
            code = 400;
          }
          self.sendData_(req, res, url, {message: msg},code);
          break;
        default:
          self.sendError_(req,res,'Method Not Implemented!')
      }
    } catch (e) {
      self.sendData_(req, res, url, {
        code: '500'
      }, 500);
      console.log('API_ERR::', e);
      return;
    }
  // loda liveload.js
  }else if (parts[1] == 'liveload.js') {
    return self.sendFile_(req,res,liveload.resolvePath(process.argv[1]))
  // default
  }else{
    fs.stat(path, function(err, stat) {
      if (err)
        return self.sendMissing_(req, res, path);
      if (stat.isDirectory()){
        return self.sendDirectory_(req, res, path);
      }
      return self.sendFile_(req, res, path);
    });
  }

}


StaticServlet.prototype.sendError_ = function(req, res, error) {
  res.writeHead(500, {
      'Content-Type': 'text/html'
  });
  res.write('<!doctype html>\n');
  res.write('<title>Internal Server Error</title>\n');
  res.write('<h1>Internal Server Error</h1>');
  res.write('<pre>' + escapeHtml(util.inspect(error)) + '</pre>');
  res.end();
  util.puts('500 Internal Server Error');
  util.puts(util.inspect(error));
};

StaticServlet.prototype.sendMissing_ = function(req, res, path) {
  path = path.substring(1);
  res.writeHead(404, {
      'Content-Type': 'text/html'
  });
  res.write('<!doctype html>\n');
  res.write('<title>404 Not Found</title>\n');
  res.write('<h1>Not Found</h1>');
  res.write(
    '<p>The requested URL ' +
    escapeHtml(path) +
    ' was not found on this server.</p>'
  );
  res.end();
  util.puts('404 Not Found: ' + path);
};

StaticServlet.prototype.sendForbidden_ = function(req, res, path) {
  path = path.substring(1);
  res.writeHead(403, {
      'Content-Type': 'text/html'
  });
  res.write('<!doctype html>\n');
  res.write('<title>403 Forbidden</title>\n');
  res.write('<h1>Forbidden</h1>');
  res.write(
    '<p>You do not have permission to access ' +
    escapeHtml(path) + ' on this server.</p>'
  );
  res.end();
  util.puts('403 Forbidden: ' + path);
};

StaticServlet.prototype.sendRedirect_ = function(req, res, redirectUrl) {
  res.writeHead(301, {
      'Content-Type': 'text/html',
      'Location': redirectUrl
  });
  res.write('<!doctype html>\n');
  res.write('<title>301 Moved Permanently</title>\n');
  res.write('<h1>Moved Permanently</h1>');
  res.write(
    '<p>The document has moved <a href="' +
    redirectUrl +
    '">here</a>.</p>'
  );
  res.end();
  util.puts('301 Moved Permanently: ' + redirectUrl);
};

StaticServlet.prototype.sendData_ = function(req, res, path, data,code) {  
  res.writeHead(code||200, {
    'Content-Type': 'application/json'
  });
  if (req.method === 'HEAD') {
    res.end();
  } else if(data){
    data = JSON.stringify(data);
    res.write(data);
    res.end();
  }
};

StaticServlet.prototype.sendFile_ = function(req, res, path) {
  var self = this;
  var file = fs.createReadStream(path);
  var fileExt = path.split('.').pop();
  res.writeHead(200, {
    'Content-Type': StaticServlet.
      MimeMap[fileExt] || 'text/plain'
  });
  if (req.method === 'HEAD') {
    res.end();
  } else {
    file.on('data', res.write.bind(res));
    file.on('close', function() {
      if(/html|htm/.test(fileExt) && liveload.watched){
        res.write('<script src="/liveload.js"></script>')
      }
      res.end();
    });
    file.on('error', function(error) {
      self.sendError_(req, res, error);
    });
  }
};


StaticServlet.prototype.sendDirectory_ = function(req, res, path) {

  var self = this;

  fs.exists( path + 'index.html', function(exist) {
      if (false && exist) {
        return self.sendFile_(req, res, path + '/index.html');
      } else {
        if (path.match(/[^\/]$/)) {
          req.url.pathname += '/';
          var redirectUrl = url.format(url.parse(url.format(req.url)));
          return self.sendRedirect_(req, res, redirectUrl);
        }
        fs.readdir(path, function(err, files) {
          if (err)
            return self.sendError_(req, res, error);

          if (!files.length)
            return self.writeDirectoryIndex_(req, res, path, []);

          var remaining = files.length;
          files.forEach(function(fileName, index) {
            fs.stat(path + '/' + fileName, function(err, stat) {
              if (err)
                return self.sendError_(req, res, err);
              if (stat.isDirectory()) {
                files[index] = fileName + '/';
              }
              if (!(--remaining))
                return self.writeDirectoryIndex_(req, res, path, files);
            });
          });
        });
      }
    });

  };

StaticServlet.prototype.writeDirectoryIndex_ = function(req, res, path, files) {
  path = path.substring(1);
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=UTF-8'
  });
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  res.write('<!doctype html>\n');
  res.write('<title>' + escapeHtml(path) + '</title>\n');
  res.write('<style>\n');
  res.write('  ol { list-style-type: none; font-size: 1.2em; }\n');
  res.write('</style>\n');
  res.write('<h1>Directory: ' + escapeHtml(path) + '</h1>');
  res.write('<ol>');
  files.forEach(function(fileName) {
    if (fileName.charAt(0) !== '.') {
      res.write('<li><a href="' +
        escapeHtml(fileName) + '">' +
        escapeHtml(fileName) + '</a></li>');
    }
  });
  res.write('</ol>');
  res.end();
};





// Must be last,
main(process.argv);
