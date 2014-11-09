var fs = require('fs'),
  sockjs = require('sockjs');

var liveload = {
  watch: function(server, watchFile) {

    if (watchFile) {
      var sockjs_live = sockjs.createServer();
      sockjs_live.on('connection', function(conn) {

        conn.on('close', function() {
          fs.unwatchFile(watchFile)
        });

        fs.watchFile(watchFile, function(curr, prev) {
          conn.write("reload");
        });

      });
      sockjs_live.installHandlers(server, {
        prefix: '/liveload'
      });
    }
  },
  resolvePath: function(path) {
    var resolvedPath = fs.realpathSync(path);
    return resolvedPath.split('/').slice(0, -1).join('/') + '/modules/liveload-client.js';
  }
}
module.exports = liveload;