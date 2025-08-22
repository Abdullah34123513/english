"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { 
  BookOpen, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Home,
  Calendar,
  MessageSquare,
  Star,
  Sparkles,
  ChevronDown,
  Bell,
  Search
} from "lucide-react"
import Link from "next/link"

export function Navigation() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  const getDashboardLink = () => {
    if (!session) return '/'
    switch (session.user.role) {
      case 'STUDENT': return '/dashboard/student'
      case 'TEACHER': return '/dashboard/teacher'
      case 'ADMIN': return '/dashboard/admin'
      default: return '/'
    }
  }

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Find Teachers', href: '/teachers', icon: User },
    ...(session ? [
      { name: 'Dashboard', href: getDashboardLink(), icon: Calendar },
      { name: 'My Classes', href: '/dashboard/student', icon: BookOpen },
      { name: 'Reviews', href: '/reviews', icon: Star },
    ] : [])
  ]

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-2 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  EnglishLearn
                </span>
                <div className="flex items-center space-x-1">
                  <Sparkles className="h-3 w-3 text-purple-600" />
                  <span className="text-xs text-gray-500">AI-Powered</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-200 font-medium group"
              >
                <item.icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
            ) : session ? (
              <>
                {/* Notification Bell */}
                <Button variant="ghost" size="sm" className="relative h-10 w-10 rounded-lg hover:bg-gray-100">
                  <Bell className="h-5 w-5 text-gray-600" />
                  <div className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></div>
                </Button>

                {/* Search */}
                <Button variant="ghost" size="sm" className="h-10 w-10 rounded-lg hover:bg-gray-100">
                  <Search className="h-5 w-5 text-gray-600" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-gray-100">
                      <Avatar className="h-10 w-10 ring-2 ring-transparent hover:ring-blue-200 transition-all duration-200">
                        <AvatarImage src={session.user.image} alt={session.user.name} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold">
                          {session.user.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown className="absolute -bottom-1 -right-1 h-4 w-4 bg-blue-600 text-white rounded-full p-0.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end" forceMount>
                    <div className="flex flex-col space-y-1 p-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={session.user.image} alt={session.user.name} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold">
                            {session.user.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-semibold leading-none">{session.user.name}</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {session.user.email}
                          </p>
                          <Badge variant="secondary" className="w-fit text-xs mt-1 bg-blue-100 text-blue-800">
                            {session.user.role}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push(getDashboardLink())} className="cursor-pointer">
                      <User className="mr-3 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/profile')} className="cursor-pointer">
                      <Settings className="mr-3 h-4 w-4" />
                      <span>Profile Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                      <LogOut className="mr-3 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  onClick={() => router.push('/auth/signin')}
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium px-4 py-2 rounded-lg"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => router.push('/auth/signup')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Get Started
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="h-10 w-10 rounded-lg hover:bg-gray-100"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6 text-gray-600" />
                ) : (
                  <Menu className="h-6 w-6 text-gray-600" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200/50">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
              {session && (
                <>
                  <div className="border-t border-gray-200/50 pt-4 mt-4">
                    <div className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={session.user.image} alt={session.user.name} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold">
                            {session.user.name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold">{session.user.name}</p>
                          <p className="text-xs text-gray-500">{session.user.email}</p>
                          <Badge variant="secondary" className="text-xs mt-1 bg-blue-100 text-blue-800">
                            {session.user.role}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1 px-2">
                      <Link
                        href="/profile"
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Settings className="h-5 w-5" />
                        <span className="font-medium">Profile Settings</span>
                      </Link>
                      <button
                        onClick={() => {
                          handleSignOut()
                          setIsMobileMenuOpen(false)
                        }}
                        className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200"
                      >
                        <LogOut className="h-5 w-5" />
                        <span className="font-medium">Sign out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}