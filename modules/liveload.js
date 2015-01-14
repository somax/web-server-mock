var fs = require('fs'),
  sockjs = require('sockjs'),
  clients={};

var liveload = {
  watched:false,
  watch: function(server, watchFile) {
    if (watchFile) {

      fs.watchFile(watchFile, function(curr, prev) {
          for ( var k in clients ) {
            clients[k].write("reload");
          }
      });

      var sockjs_live = sockjs.createServer();
      sockjs_live.on('connection', function(conn) {
        clients[conn.id] = conn;

        conn.on('close', function() {
          delete clients[conn.id];
        });
      });

      sockjs_live.installHandlers(server, {
        prefix: '/liveload'
      });

      this.watched = true;
    }
  },
  resolvePath: function(path) {
    var resolvedPath = fs.realpathSync(path);
    resolvedPath = resolvedPath.split('/').slice(0, -1).join('/') + '/modules/liveload-client.js'
    console.log('resolvedPath:' , resolvedPath)
    return resolvedPath;
  }
}
module.exports = liveload;