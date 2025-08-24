"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { useSocket } from "@/hooks/use-socket"
import { Send, X, MessageCircle, Clock, Edit3 } from "lucide-react"

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  isRead: boolean
  createdAt: string
  sender: {
    id: string
    name: string
    image?: string
  }
  receiver: {
    id: string
    name: string
    image?: string
  }
}

interface User {
  id: string
  name: string
  image?: string
  role: string
}

interface MessageModalProps {
  isOpen: boolean
  onClose: () => void
  currentUser: {
    id: string
    name: string
    image?: string
    role: string
  }
  otherUser: {
    id: string
    name: string
    image?: string
    role: string
  }
}

export function MessageModal({ isOpen, onClose, currentUser, otherUser }: MessageModalProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const { isConnected, sendMessage: sendSocketMessage, sendTyping, stopTyping, onNewMessage, onMessageSent, onUserTyping, onUserStoppedTyping, offNewMessage, offMessageSent, offUserTyping, offUserStoppedTyping } = useSocket({ userId: currentUser.id })

  useEffect(() => {
    if (isOpen) {
      fetchMessages()
    }
  }, [isOpen, currentUser.id, otherUser.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Set up real-time event listeners
  useEffect(() => {
    if (isOpen && isConnected) {
      const handleNewMessage = (data: any) => {
        if ((data.senderId === currentUser.id && data.receiverId === otherUser.id) ||
            (data.senderId === otherUser.id && data.receiverId === currentUser.id)) {
          // Add message to state
          const newMsg: Message = {
            id: `temp-${Date.now()}`,
            senderId: data.senderId,
            receiverId: data.receiverId,
            content: data.content,
            isRead: false,
            createdAt: data.timestamp,
            sender: data.senderId === currentUser.id ? currentUser : otherUser,
            receiver: data.receiverId === currentUser.id ? currentUser : otherUser
          }
          setMessages(prev => [...prev, newMsg])
        }
      }

      const handleMessageSent = (data: any) => {
        if (data.senderId === currentUser.id && data.receiverId === otherUser.id) {
          // Message sent successfully, could add visual feedback
        }
      }

      const handleUserTyping = (data: any) => {
        if (data.senderId === otherUser.id) {
          setIsTyping(true)
        }
      }

      const handleUserStoppedTyping = (data: any) => {
        if (data.senderId === otherUser.id) {
          setIsTyping(false)
        }
      }

      onNewMessage(handleNewMessage)
      onMessageSent(handleMessageSent)
      onUserTyping(handleUserTyping)
      onUserStoppedTyping(handleUserStoppedTyping)

      return () => {
        offNewMessage(handleNewMessage)
        offMessageSent(handleMessageSent)
        offUserTyping(handleUserTyping)
        offUserStoppedTyping(handleUserStoppedTyping)
      }
    }
  }, [isOpen, isConnected, currentUser, otherUser, onNewMessage, onMessageSent, onUserTyping, onUserStoppedTyping])

  // Handle typing indicators
  useEffect(() => {
    let typingTimeout: NodeJS.Timeout
    
    const handleTyping = () => {
      if (newMessage.trim() && isConnected) {
        sendTyping({ senderId: currentUser.id, receiverId: otherUser.id })
        
        clearTimeout(typingTimeout)
        typingTimeout = setTimeout(() => {
          stopTyping({ senderId: currentUser.id, receiverId: otherUser.id })
        }, 1000)
      }
    }

    if (isOpen && isConnected) {
      const timeout = setTimeout(handleTyping, 500)
      return () => clearTimeout(timeout)
    }
  }, [newMessage, isOpen, isConnected, currentUser, otherUser, sendTyping, stopTyping])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/messages?userId=${currentUser.id}&otherUserId=${otherUser.id}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
        
        // Mark messages as read
        await markMessagesAsRead()
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const markMessagesAsRead = async () => {
    try {
      // Mark messages as read (this would need a separate endpoint)
      // For now, we'll just update the local state
      setMessages(prev => prev.map(msg => 
        msg.receiverId === currentUser.id ? { ...msg, isRead: true } : msg
      ))
    } catch (error) {
      console.error("Error marking messages as read:", error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    setSending(true)
    try {
      // Send via socket for real-time delivery
      if (isConnected) {
        sendSocketMessage({
          senderId: currentUser.id,
          receiverId: otherUser.id,
          content: newMessage.trim()
        })
      }

      // Also save to database via API
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverId: otherUser.id,
          content: newMessage.trim()
        }),
      })

      if (response.ok) {
        const message = await response.json()
        setMessages(prev => [...prev, message])
        setNewMessage("")
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to send message",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      })
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString()
    }
  }

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {}
    
    messages.forEach(message => {
      const date = new Date(message.createdAt).toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
    })
    
    return groups
  }

  const messageGroups = groupMessagesByDate(messages)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={otherUser.image} />
                <AvatarFallback className="text-lg">
                  {otherUser.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-lg">{otherUser.name}</DialogTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {otherUser.role}
                  </Badge>
                  <span className="text-sm text-gray-500">Online</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4 bg-gray-50">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">No messages yet</p>
                  <p className="text-sm">Start a conversation with {otherUser.name}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(messageGroups).map(([date, dateMessages]) => (
                  <div key={date}>
                    <div className="flex items-center justify-center mb-4">
                      <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                        {formatDate(date)}
                      </div>
                    </div>
                    {dateMessages.map((message) => {
                      const isCurrentUser = message.senderId === currentUser.id
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}
                        >
                          <div className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-[70%]`}>
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarImage src={message.sender.image} />
                              <AvatarFallback className="text-sm">
                                {message.sender.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`rounded-lg px-4 py-2 ${isCurrentUser ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
                              <p className="text-sm">{message.content}</p>
                              <div className={`flex items-center space-x-1 mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                                <Clock className="h-3 w-3" />
                                <span className="text-xs">{formatTime(message.createdAt)}</span>
                                {!message.isRead && isCurrentUser && (
                                  <span className="text-xs">✓</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start mb-4">
                    <div className="flex items-end space-x-2 max-w-[70%]">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={otherUser.image} />
                        <AvatarFallback className="text-sm">
                          {otherUser.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-white border rounded-lg px-4 py-2">
                        <div className="flex items-center space-x-1">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-xs text-gray-500 ml-2">typing...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t bg-white">
            <div className="flex space-x-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 resize-none"
                rows={2}
                disabled={sending}
              />
              <Button 
                onClick={sendMessage} 
                disabled={!newMessage.trim() || sending}
                className="self-end"
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}