var http = require('http');
var socketio = require('socket.io');
var fs = require('fs');
var server = http.createServer(function(req, res) {
  res.writeHead(200, {'Content-Type' : 'text/html'});
  res.end(fs.readFileSync(__dirname + '/index.html', 'utf-8'));
}).listen(3000);  // ポート競合の場合は値を変更

var io = socketio.listen(server);

// クライアント-サーバ間でwebsocket通信が確立するとio.skcketsオブジェクトに対してconnectionイベントが発火される
io.sockets.on('connection', function(socket) {
  var name;
  // クライアントからのデータを受信
  socket.on('client_to_server', function(data) {
    // クライアントへデータを送信
    io.sockets.emit('server_to_client', {value : data.value});
  });

  // 誰かが入室したときにブロードキャストイベントを受信し、送信元以外の人に送信
  socket.on('client_to_server_broadcast', function(data) {
    socket.broadcast.emit('server_to_client', {value: data.value});
  });

  // 送信元の人に入室したという情報を送信
  socket.on('client_to_server_personal', function(data) {
    name = data.value
    var id = socket.id;
    var message = "あなたは" + name + "として入室しました";
    io.to(id).emit('server_to_client', {value: message});
  });

  // 退出メッセージを送信
  socket.on('disconnect', function() {
    if (name === undefined) {
      console.log("未入室のまま何処かに去っていきました");
    } else {
      var endMessage = name + "さんが退出しました";
      io.sockets.emit('server_to_client', {value: endMessage});
    }
  })
});
