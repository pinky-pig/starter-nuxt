export default defineWebSocketHandler({
  // peer 是客户端的标识符，当客户端连接到服务器时，会自动生成一个唯一的标识符。
  open(peer) {
    // 发送一条欢迎消息给新连接的客户端。
    peer.send({ user: 'server', message: `Welcome ${peer}!` })
    // 发布消息到名为 'chat' 的频道，通知其他用户有新用户加入了聊天。
    peer.publish('chat', { user: 'server', message: `${peer} joined!` })
    // 让客户端订阅 'chat' 频道，这样它就可以收到来自该频道的消息。
    peer.subscribe('chat')
  },

  // 参数 peer 表示发送消息的客户端，message 是接收到的消息对象。
  message(peer, message) {
    //  心跳： 如果消息内容包含 'ping'，服务器会回送 'pong' 消息：
    if (message.text().includes('ping')) {
      peer.send({ user: 'server', message: 'pong' })
    }
    else {
      const msg = {
        user: peer.toString(),
        message: message.toString(),
      }

      // echo 消息回送给发消息的客户端
      peer.send(msg) // echo

      // 消息广播到 'chat' 频道
      peer.publish('chat', msg)
    }
  },
  close(peer) {
    peer.publish('chat', { user: 'server', message: `${peer} left!` })
  },
})
