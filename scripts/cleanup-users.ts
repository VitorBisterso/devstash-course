import 'dotenv/config'
import { PrismaClient } from '@/generated/prisma/client/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

async function cleanupUsers() {
  console.log('Cleaning up users (keeping demo@devstash.io)...\n')

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@devstash.io' },
    })

    if (!demoUser) {
      console.log('No demo user found. Nothing to clean up.')
      return
    }

    console.log(`Found demo user: ${demoUser.email} (id: ${demoUser.id})`)

    const usersToDelete = await prisma.user.findMany({
      where: {
        email: { not: 'demo@devstash.io' },
      },
    })

    console.log(`Found ${usersToDelete.length} users to delete`)

    for (const user of usersToDelete) {
      console.log(`Deleting user: ${user.email} (id: ${user.id})`)
    }

    const result = await prisma.user.deleteMany({
      where: {
        email: { not: 'demo@devstash.io' },
      },
    })

    console.log(`\nDeleted ${result.count} user(s)`)
    console.log('Cleanup completed successfully!')
  } catch (error) {
    console.error('Cleanup failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

cleanupUsers()
