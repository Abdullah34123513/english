import { UserRole } from "@prisma/client"
import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: UserRole
      emailVerified: boolean
    }
  }

  interface User {
    role: UserRole
    emailVerified: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole
    emailVerified: boolean
  }
}