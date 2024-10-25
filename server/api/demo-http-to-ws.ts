import { WebSocketServer } from 'ws'

export default defineEventHandler((event) => {
  if (!global.wsServer) {
    const wsServer = new WebSocketServer({ noServer: true })

    // 存储用户的连接和配对信息
    const connections = {} // 用于存储每个 code 的连接
    const unpairedTimeout = 3 * 60 * 1000 // 未配对超时时间 3 mins
    const clearUnpairedConnectionsTimeGap = 60 * 1000 // 清理未配对连接的间隔时间 1 min

    // 监听连接事件
    wsServer.on('connection', (ws) => {
      ws.send('连接成功')

      let heartbeatInterval
    
      // 处理接收到的消息
      ws.on('message', (message) => {
        const msg = message.toString('utf-8')

        if (determineValueType(msg) === 'normalString') {
          ws.send(msg)
          return
        }
    
        if (determineValueType(msg) === 'jsonString') {
          const message = JSON.parse(msg)

          switch (message.type) {
            case 'send':
            // {"type":"send"}
            {
              // 生成一个唯一的 code
              const code = generateUniqueCode()
              connections[code] = {
                a: ws,
                startTime: Date.now(),
              }
              ws.send(JSON.stringify({ type: 'code', code }))
              break
            }
    
            case 'join':
            // {"type":"join", "code":"a1b2c3"}
            {
              const { code } = message
              const aSocket = connections[code]?.a
    
              if (aSocket) {
                connections[code] = {
                  ...connections[code],
                  b: ws,
                  joinTime: Date.now(),
                }
                aSocket.send(JSON.stringify({ type: 'pairing_request', code }))
                // ws.send(JSON.stringify({ type: 'paired', code }))
              }
              else {
                ws.send(JSON.stringify({ type: 'error', message: 'Code not found' }))
              }
              break
            }
    
            case 'message':
            {
              // 处理普通消息，消息类型是 'message'
              const { code, data } = message
              const socket = connections[code]
              if (ws === socket?.a) {
                // 将普通消息转发给 B
                socket.b.send(JSON.stringify({ type: 'message', data }))
              }
              else if (ws === socket?.b) {
                // 将普通消息转发给 A
                socket.a.send(JSON.stringify({ type: 'message', data }))
              }
    
              break
            }
    
            case 'disconnect':
            {
              break
            }
    
            case 'ping':
            {
              ws.send(JSON.stringify(message))
              break
            }
    
            default:
              break
          }
        }
      })
    
      /**
       * 清理未配对的连接
       */
      setInterval(() => {
        cleanUnpairedConnections()
      }, clearUnpairedConnectionsTimeGap)
      function cleanUnpairedConnections() {
        const now = Date.now()
        for (const code in connections) {
          const connection = connections[code]
          if (connection && !connection.b && now - connection.startTime > unpairedTimeout) {
            delete connections[code]
          }
        }
      }
    
      // 处理连接关闭
      ws.on('close', () => {
        // 清除心跳定时器
        clearInterval(heartbeatInterval)
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

function generateUniqueCode() {
  return Math.random().toString(36).substr(2, 6) // 生成 6 位的随机字母和数字的组合
}

/**
 * 判断字符串是否是JSON字符串
 * @param str 字符串
 * @returns
 *  jsonString: 是有效的 JSON 字符串
 *  normalString: 是普通字符串
 *  object: 是对象
 *  unknown: 其他类型
 */
export function determineValueType(value: string | object) {
  // 检查是否是对象（排除 null，因为 typeof null 也会返回 'object'）
  if (typeof value === 'object' && value !== null) {
    return 'object' // 是对象
  }

  // 检查是否是字符串
  if (typeof value === 'string') {
    // 尝试解析 JSON 字符串
    try {
      const parsed = JSON.parse(value)
      if (typeof parsed === 'object' && parsed !== null) {
        return 'jsonString' // 是有效的 JSON 字符串
      }
      else {
        return 'normalString' // 是普通字符串
      }
    }
    catch {
      return 'normalString' // 解析失败，说明是普通字符串
    }
  }

  return 'unknown' // 其他类型
}
