"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  ArrowLeft, 
  Search, 
  Send, 
  MessageCircle, 
  Clock,
  Check,
  CheckCheck,
  Users,
  Paperclip
} from "lucide-react"

interface Message {
  id: string
  studentId: string
  studentName: string
  studentAvatar?: string
  content: string
  timestamp: string
  isRead: boolean
  isFromTeacher: boolean
}

interface Conversation {
  id: string
  studentId: string
  studentName: string
  studentAvatar?: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  isActive: boolean
}

export default function TeacherMessages() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user.role !== "TEACHER") {
      router.push("/auth/signin")
      return
    }

    fetchConversations()
  }, [session, status, router])

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id)
    }
  }, [activeConversation])

  const fetchConversations = async () => {
    try {
      // Mock data - in real app, this would come from API
      const mockConversations: Conversation[] = [
        {
          id: "1",
          studentId: "1",
          studentName: "Emma Wilson",
          lastMessage: "Thank you for the great lesson today!",
          lastMessageTime: "2 hours ago",
          unreadCount: 1,
          isActive: false
        },
        {
          id: "2",
          studentId: "2",
          studentName: "James Chen",
          lastMessage: "Can we reschedule tomorrow's class?",
          lastMessageTime: "5 hours ago",
          unreadCount: 0,
          isActive: false
        },
        {
          id: "3",
          studentId: "3",
          studentName: "Maria Garcia",
          lastMessage: "I'm ready for the IELTS practice test",
          lastMessageTime: "1 day ago",
          unreadCount: 0,
          isActive: false
        },
        {
          id: "4",
          studentId: "4",
          studentName: "David Kim",
          lastMessage: "The business English materials are very helpful",
          lastMessageTime: "2 days ago",
          unreadCount: 2,
          isActive: false
        }
      ]
      setConversations(mockConversations)
    } catch (error) {
      console.error("Error fetching conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      // Mock data - in real app, this would come from API
      const mockMessages: Message[] = [
        {
          id: "1",
          studentId: "1",
          studentName: "Emma Wilson",
          content: "Hi! I'm looking forward to our lesson today",
          timestamp: "10:30 AM",
          isRead: true,
          isFromTeacher: false
        },
        {
          id: "2",
          studentId: "1",
          studentName: "Emma Wilson",
          content: "Hello Emma! I'm ready when you are. We'll focus on business vocabulary today.",
          timestamp: "10:32 AM",
          isRead: true,
          isFromTeacher: true
        },
        {
          id: "3",
          studentId: "1",
          studentName: "Emma Wilson",
          content: "Perfect! I've prepared some questions about my work presentation.",
          timestamp: "10:35 AM",
          isRead: true,
          isFromTeacher: false
        },
        {
          id: "4",
          studentId: "1",
          studentName: "Emma Wilson",
          content: "Thank you for the great lesson today!",
          timestamp: "11:45 AM",
          isRead: false,
          isFromTeacher: false
        }
      ]
      setMessages(mockMessages)
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversation) return

    const newMessageObj: Message = {
      id: Date.now().toString(),
      studentId: activeConversation.studentId,
      studentName: activeConversation.studentName,
      content: newMessage,
      timestamp: "Just now",
      isRead: false,
      isFromTeacher: true
    }

    setMessages([...messages, newMessageObj])
    setNewMessage("")

    // Update conversation last message
    setConversations(conversations.map(conv => 
      conv.id === activeConversation.id 
        ? { ...conv, lastMessage: newMessage, lastMessageTime: "Just now" }
        : conv
    ))
  }

  const filteredConversations = conversations.filter(conv =>
    conv.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 font-medium">Loading messages...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== "TEACHER") {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/teacher")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center">
                <MessageCircle className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Messages
                  </h1>
                  <p className="text-sm text-gray-600">Communicate with your students</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Conversations</span>
                <Badge variant="outline">
                  {conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)} unread
                </Badge>
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1 max-h-[calc(100vh-350px)] overflow-y-auto">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      activeConversation?.id === conversation.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setActiveConversation(conversation)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{conversation.studentName}</h4>
                          <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <span className="text-xs text-gray-500">{conversation.lastMessageTime}</span>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl h-full flex flex-col">
              {activeConversation ? (
                <>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{activeConversation.studentName}</CardTitle>
                          <CardDescription>Online</CardDescription>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Paperclip className="h-4 w-4 mr-2" />
                        Attach
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col p-0">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.isFromTeacher ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.isFromTeacher
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs opacity-70">{message.timestamp}</span>
                              {message.isFromTeacher && (
                                message.isRead ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t border-gray-200">
                      <div className="flex space-x-2">
                        <Textarea
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="flex-1 resize-none"
                          rows={2}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleSendMessage()
                            }
                          }}
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                          className="self-end"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                    <p className="text-gray-600">Choose a student to start messaging</p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}