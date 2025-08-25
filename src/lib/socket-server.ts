import { Server } from "socket.io"

// Global socket server instance
let io: Server | null = null

export function initializeSocketServer() {
  if (io) {
    return io
  }

  // Create a new Socket.IO server
  io = new Server({
    path: "/api/socket/io",
    addTrailingSlash: false,
    cors: {
      origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:3000"],
      methods: ["GET", "POST"]
    }
  })

  // Set up event handlers
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
      
      console.log("Message received:", data)
      
      // Emit to receiver
      io?.to(`user-${receiverId}`).emit("new-message", {
        senderId,
        receiverId,
        content,
        timestamp: new Date().toISOString()
      })
      
      // Emit back to sender for confirmation
      io?.to(`user-${senderId}`).emit("message-sent", {
        senderId,
        receiverId,
        content,
        timestamp: new Date().toISOString()
      })
    })

    // Handle typing indicators
    socket.on("typing", (data) => {
      const { senderId, receiverId } = data
      io?.to(`user-${receiverId}`).emit("user-typing", { senderId })
    })

    socket.on("stop-typing", (data) => {
      const { senderId, receiverId } = data
      io?.to(`user-${receiverId}`).emit("user-stopped-typing", { senderId })
    })

    // Handle read receipts
    socket.on("mark-read", (data) => {
      const { messageId, readerId } = data
      io?.to(`user-${readerId}`).emit("message-read", { messageId })
    })

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id)
    })
  })

  return io
}

export function getSocketServer() {
  return io
}

export function attachSocketServer(server: any) {
  if (!io) {
    initializeSocketServer()
  }
  
  if (io && server) {
    io.attach(server)
    console.log("Socket.IO server attached to HTTP server")
  }
}