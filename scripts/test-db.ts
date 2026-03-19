import 'dotenv/config'
import { PrismaClient } from '@/generated/prisma/client/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

async function testDatabase() {
  console.log('Testing database connection...\n')

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    const user = await prisma.user.findUnique({
      where: { email: 'demo@devstash.io' },
    })

    if (!user) {
      console.log('No demo user found. Run: npm run db:seed')
      return
    }

    console.log(`User: ${user.name} (${user.email})`)
    console.log(`  isPro: ${user.isPro}`)

    const itemTypes = await prisma.itemType.findMany({
      where: { isSystem: true },
      orderBy: { name: 'asc' },
    })
    console.log(`\nSystem Item Types (${itemTypes.length}):`)
    for (const type of itemTypes) {
      console.log(`  - ${type.name}: ${type.icon} (${type.color})`)
    }

    const collections = await prisma.collection.findMany({
      where: { userId: user.id },
      include: {
        _count: { select: { items: true } },
      },
      orderBy: { name: 'asc' },
    })
    console.log(`\nCollections (${collections.length}):`)
    for (const col of collections) {
      console.log(`  - ${col.name} (${col._count.items} items)`)
      if (col.description) console.log(`    ${col.description}`)
    }

    const items = await prisma.item.findMany({
      where: { userId: user.id },
      include: { type: true },
      orderBy: [{ type: { name: 'asc' } }, { title: 'asc' }],
    })
    console.log(`\nItems (${items.length}):`)
    for (const item of items) {
      console.log(`  [${item.type.name}] ${item.title}`)
    }

    console.log('\nDatabase test completed successfully!')
  } catch (error) {
    console.error('Database test failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

testDatabase()