import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Initialize Prisma client with better error handling
const createPrismaClient = () => {
  try {
    const client = new PrismaClient({
      log: ['query'],
    })
    
    // Test the connection
    client.$connect().then(() => {
      console.log('✅ Prisma client connected successfully')
    }).catch((error) => {
      console.error('❌ Prisma client connection failed:', error)
    })
    
    return client
  } catch (error) {
    console.error('❌ Failed to create Prisma client:', error)
    throw error
  }
}

export const db =
  globalForPrisma.prisma ??
  createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Export a function to get the database client with verification
export async function getDbClient() {
  try {
    // Test if the client is properly initialized
    await db.user.findFirst({ take: 1 })
    return db
  } catch (error) {
    console.error('Database client verification failed:', error)
    // Try to recreate the client
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = undefined
      const newClient = createPrismaClient()
      globalForPrisma.prisma = newClient
      return newClient
    }
    throw error
  }
}