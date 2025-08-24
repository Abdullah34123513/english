import { Server } from "socket.io"
import { NextApiRequest, NextApiResponse } from "next"

export type NextApiResponseServerSocket = NextApiResponse & {
  socket: {
    server: {
      io: Server
    }
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponseServerSocket) {
  if (res.socket.server.io) {
    console.log("Socket is already running")
  } else {
    console.log("Socket is initializing")
    const io = new Server(res.socket.server, {
      path: "/api/socket/io",
      addTrailingSlash: false,
      cors: {
        origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:3000"],
        methods: ["GET", "POST"]
      }
    })
    
    res.socket.server.io = io

    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id)

      // Join user to their personal room
      socket.on("join-user", (userId) => {
        socket.join(`user-${userId}`)
        console.log(`User ${userId} joined room user-${userId}`)
      })

      // Handle private messages
      socket.on("send-message", (data) => {
        const { senderId, receiverId, content } = data
        
        // Emit to receiver
        io.to(`user-${receiverId}`).emit("new-message", {
          senderId,
          receiverId,
          content,
          timestamp: new Date().toISOString()
        })
        
        // Emit back to sender for confirmation
        io.to(`user-${senderId}`).emit("message-sent", {
          senderId,
          receiverId,
          content,
          timestamp: new Date().toISOString()
        })
      })

      // Handle typing indicators
      socket.on("typing", (data) => {
        const { senderId, receiverId } = data
        io.to(`user-${receiverId}`).emit("user-typing", { senderId })
      })

      socket.on("stop-typing", (data) => {
        const { senderId, receiverId } = data
        io.to(`user-${receiverId}`).emit("user-stopped-typing", { senderId })
      })

      // Handle read receipts
      socket.on("mark-read", (data) => {
        const { messageId, readerId } = data
        io.to(`user-${readerId}`).emit("message-read", { messageId })
      })

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id)
      })
    })
  }

  res.end()
}