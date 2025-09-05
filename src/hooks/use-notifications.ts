"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  userId: string
  userType: string
  relatedId?: string
  isRead: boolean
  createdAt: string
}

export function useNotifications() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!session) return

    // Fetch initial notifications
    fetchNotifications()

    // Set up Socket.IO connection for real-time notifications
    const setupSocketConnection = async () => {
      try {
        // Dynamically import socket.io-client
        const { io } = await import('socket.io-client')
        
        const socket = io(process.env.NEXTAUTH_URL || 'http://localhost:3000', {
          path: '/api/socket/io',
        })

        socket.on('connect', () => {
          console.log('Connected to notification server')
          setIsConnected(true)
          
          // Join user room
          socket.emit('join-user', session.user.id)
        })

        socket.on('disconnect', () => {
          console.log('Disconnected from notification server')
          setIsConnected(false)
        })

        socket.on('notification', (notification: Notification) => {
          console.log('Received notification:', notification)
          
          // Add new notification to the list
          setNotifications(prev => [notification, ...prev])
          
          // Update unread count
          setUnreadCount(prev => prev + 1)
          
          // Dispatch custom event for other components
          window.dispatchEvent(new CustomEvent('notification', { detail: notification }))
        })

        return () => {
          socket.disconnect()
        }
      } catch (error) {
        console.error('Error setting up socket connection:', error)
        setIsConnected(false)
      }
    }

    const socketCleanup = setupSocketConnection()

    return () => {
      socketCleanup.then(cleanup => cleanup?.())
    }
  }, [session])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
        setUnreadCount(data.filter((n: Notification) => !n.isRead).length)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH'
      })
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PATCH'
      })
      
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  }
}