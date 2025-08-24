"use client"

import { useEffect, useRef, useState } from "react"
import { io, Socket } from "socket.io-client"

interface UseSocketProps {
  userId: string
}

export function useSocket({ userId }: UseSocketProps) {
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(process.env.NODE_ENV === "production" ? "" : "http://localhost:3000", {
      path: "/api/socket/io",
      addTrailingSlash: false,
      transports: ['websocket', 'polling']
    })

    const socket = socketRef.current

    // Connection events
    socket.on("connect", () => {
      console.log("Connected to socket server")
      setIsConnected(true)
      
      // Join user room
      socket.emit("join-user", userId)
    })

    socket.on("disconnect", () => {
      console.log("Disconnected from socket server")
      setIsConnected(false)
    })

    // Cleanup on unmount
    return () => {
      socket.disconnect()
    }
  }, [userId])

  const sendMessage = (data: { senderId: string; receiverId: string; content: string }) => {
    if (socketRef.current) {
      socketRef.current.emit("send-message", data)
    }
  }

  const sendTyping = (data: { senderId: string; receiverId: string }) => {
    if (socketRef.current) {
      socketRef.current.emit("typing", data)
    }
  }

  const stopTyping = (data: { senderId: string; receiverId: string }) => {
    if (socketRef.current) {
      socketRef.current.emit("stop-typing", data)
    }
  }

  const markAsRead = (data: { messageId: string; readerId: string }) => {
    if (socketRef.current) {
      socketRef.current.emit("mark-read", data)
    }
  }

  const onNewMessage = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on("new-message", callback)
    }
  }

  const onMessageSent = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on("message-sent", callback)
    }
  }

  const onUserTyping = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on("user-typing", callback)
    }
  }

  const onUserStoppedTyping = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on("user-stopped-typing", callback)
    }
  }

  const onMessageRead = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on("message-read", callback)
    }
  }

  const offNewMessage = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.off("new-message", callback)
    }
  }

  const offMessageSent = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.off("message-sent", callback)
    }
  }

  const offUserTyping = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.off("user-typing", callback)
    }
  }

  const offUserStoppedTyping = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.off("user-stopped-typing", callback)
    }
  }

  const offMessageRead = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.off("message-read", callback)
    }
  }

  return {
    isConnected,
    sendMessage,
    sendTyping,
    stopTyping,
    markAsRead,
    onNewMessage,
    onMessageSent,
    onUserTyping,
    onUserStoppedTyping,
    onMessageRead,
    offNewMessage,
    offMessageSent,
    offUserTyping,
    offUserStoppedTyping,
    offMessageRead
  }
}