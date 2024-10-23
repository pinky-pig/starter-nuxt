/* eslint-disable no-console */
import { WebSocketServer } from 'ws'

export default defineEventHandler((event) => {
  if (!global.wsServer) {
    const wsServer = new WebSocketServer({ noServer: true })

    // 监听连接事件
    wsServer.on('connection', (ws) => {
      console.log('WebSocket client connected')

      // 处理客户端消息
      ws.on('message', (message) => {
        console.log(`Received message: ${message}`)
        ws.send(`Echo: ${message}`)
      })

      // 处理连接关闭事件
      ws.on('close', () => {
        console.log('WebSocket client disconnected')
      })
    })

    // 通过 HTTP 服务器升级 WebSocket 连接
    event.node.res.socket.server.on('upgrade', (request, socket, head) => {
      wsServer.handleUpgrade(request, socket, head, (ws) => {
        wsServer.emit('connection', ws, request)
      })
    })

    global.wsServer = wsServer // 将服务器实例保存在全局变量中，防止重复创建
  }
})
