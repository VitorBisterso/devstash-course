import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client/client'
import bcrypt from 'bcryptjs'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set')
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const systemItemTypes = [
  { name: 'snippet', icon: 'Code', color: '#3b82f6', isSystem: true },
  { name: 'prompt', icon: 'Sparkles', color: '#8b5cf6', isSystem: true },
  { name: 'command', icon: 'Terminal', color: '#f97316', isSystem: true },
  { name: 'note', icon: 'StickyNote', color: '#fde047', isSystem: true },
  { name: 'file', icon: 'File', color: '#6b7280', isSystem: true },
  { name: 'image', icon: 'Image', color: '#ec4899', isSystem: true },
  { name: 'link', icon: 'Link', color: '#10b981', isSystem: true },
]

async function main() {
  console.log('Seeding database...')

  const hashedPassword = await bcrypt.hash('12345678', 12)

  const user = await prisma.user.upsert({
    where: { email: 'demo@devstash.io' },
    update: {},
    create: {
      email: 'demo@devstash.io',
      name: 'Demo User',
      password: hashedPassword,
      isPro: false,
    },
  })
  console.log('Created user:', user.email)

  console.log('Seeding system item types...')
  const createdTypes: Record<string, string> = {}
  for (const type of systemItemTypes) {
    const existing = await prisma.itemType.findFirst({
      where: { name: type.name, userId: null, isSystem: true },
    })

    if (existing) {
      createdTypes[type.name] = existing.id
      console.log(`  Already exists: ${type.name}`)
    } else {
      const created = await prisma.itemType.create({
        data: { name: type.name, icon: type.icon, color: type.color, isSystem: type.isSystem },
      })
      createdTypes[type.name] = created.id
      console.log(`  Created: ${type.name}`)
    }
  }

  const collections = [
    { name: 'React Patterns', description: 'Reusable React patterns and hooks' },
    { name: 'AI Workflows', description: 'AI prompts and workflow automations' },
    { name: 'DevOps', description: 'Infrastructure and deployment resources' },
    { name: 'Terminal Commands', description: 'Useful shell commands for everyday development' },
    { name: 'Design Resources', description: 'UI/UX resources and references' },
  ]

  console.log('Seeding collections...')
  const createdCollections: Record<string, string> = {}
  for (const col of collections) {
    const existing = await prisma.collection.findFirst({
      where: { name: col.name, userId: user.id },
    })

    if (existing) {
      createdCollections[col.name] = existing.id
      console.log(`  Already exists: ${col.name}`)
    } else {
      const created = await prisma.collection.create({
        data: { name: col.name, description: col.description, userId: user.id },
      })
      createdCollections[col.name] = created.id
      console.log(`  Created: ${col.name}`)
    }
  }

  const snippets = [
    {
      title: 'useDebounce Hook',
      content: `import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}`,
      language: 'typescript',
      collectionId: createdCollections['React Patterns'],
    },
    {
      title: 'Context Provider Pattern',
      content: `import { createContext, useContext, ReactNode } from 'react'

interface ContextValue {
  // Add your context properties
}

const MyContext = createContext<ContextValue | undefined>(undefined)

export function MyProvider({ children }: { children: ReactNode }) {
  const value: ContextValue = {
    // Add your context value
  }

  return <MyContext.Provider value={value}>{children}</MyContext.Provider>
}

export function useMyContext() {
  const context = useContext(MyContext)
  if (!context) throw new Error('useMyContext must be used within MyProvider')
  return context
}`,
      language: 'typescript',
      collectionId: createdCollections['React Patterns'],
    },
    {
      title: 'Class Names Utility',
      content: `import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`,
      language: 'typescript',
      collectionId: createdCollections['React Patterns'],
    },
    {
      title: 'Docker Compose for Local Dev',
      content: `version: '3.8'

services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
      POSTGRES_DB: devdb
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:`,
      language: 'yaml',
      collectionId: createdCollections['DevOps'],
    },
  ]

  const prompts = [
    {
      title: 'Code Review Assistant',
      content: `Review the following code for:
- Security vulnerabilities
- Performance issues
- Code quality and best practices
- Potential bugs
- Readability improvements

Provide specific suggestions with code examples where applicable.

Code to review:
\`\`\`
// Your code here
\`\`\``,
      collectionId: createdCollections['AI Workflows'],
    },
    {
      title: 'Documentation Generator',
      content: `Generate comprehensive documentation for the following code including:
- Overview/Purpose
- Usage examples
- API reference (parameters, return types)
- Edge cases and error handling
- Related functions/modules

Code:
\`\`\`
// Your code here
\`\`\``,
      collectionId: createdCollections['AI Workflows'],
    },
    {
      title: 'Refactoring Helper',
      content: `Refactor the following code to:
- Improve readability
- Follow SOLID principles
- Reduce complexity
- Add proper error handling
- Optimize performance

Original code:
\`\`\`
// Your code here
\`\`\`

Provide the refactored code with explanations.`,
      collectionId: createdCollections['AI Workflows'],
    },
  ]

  const commands = [
    {
      title: 'Git Undo Last Commit',
      content: 'git reset --soft HEAD~1',
      description: 'Undo last commit but keep changes staged',
      collectionId: createdCollections['Terminal Commands'],
    },
    {
      title: 'Git Branch Cleanup',
      content: 'git branch --merged | grep -v "\\*" | xargs -n 1 git branch -d',
      description: 'Delete merged local branches',
      collectionId: createdCollections['Terminal Commands'],
    },
    {
      title: 'Docker Cleanup',
      content: 'docker system prune -af --volumes',
      description: 'Remove all unused containers, networks, images, and volumes',
      collectionId: createdCollections['Terminal Commands'],
    },
    {
      title: 'Docker Compose Logs',
      content: 'docker compose logs -f --tail=100',
      description: 'Follow logs with last 100 lines',
      collectionId: createdCollections['Terminal Commands'],
    },
    {
      title: 'Deploy Script',
      content: `#!/bin/bash
echo "Deploying to production..."
git pull origin main
npm install
npm run build
pm2 restart all
echo "Deployment complete!"`,
      description: 'Basic deployment script for Node.js apps',
      collectionId: createdCollections['DevOps'],
    },
  ]

  const links = [
    {
      title: 'Docker Documentation',
      url: 'https://docs.docker.com/',
      description: 'Official Docker documentation and guides',
      collectionId: createdCollections['DevOps'],
    },
    {
      title: 'GitHub Actions Docs',
      url: 'https://docs.github.com/en/actions',
      description: 'Learn about CI/CD with GitHub Actions',
      collectionId: createdCollections['DevOps'],
    },
    {
      title: 'Tailwind CSS',
      url: 'https://tailwindcss.com/',
      description: 'Utility-first CSS framework',
      collectionId: createdCollections['Design Resources'],
    },
    {
      title: 'Shadcn UI',
      url: 'https://ui.shadcn.com/',
      description: 'Beautiful, accessible UI components',
      collectionId: createdCollections['Design Resources'],
    },
    {
      title: 'Radix UI',
      url: 'https://www.radix-ui.com/',
      description: 'Unstyled, accessible component primitives',
      collectionId: createdCollections['Design Resources'],
    },
    {
      title: 'Lucide Icons',
      url: 'https://lucide.dev/',
      description: 'Beautiful, consistent icon set',
      collectionId: createdCollections['Design Resources'],
    },
  ]

  console.log('Seeding snippets...')
  for (const snippet of snippets) {
    const exists = await prisma.item.findFirst({
      where: { title: snippet.title, userId: user.id },
    })
    if (!exists) {
      const item = await prisma.item.create({
        data: {
          title: snippet.title,
          content: snippet.content,
          language: snippet.language,
          userId: user.id,
          typeId: createdTypes['snippet'],
        },
      })
      await prisma.itemCollection.create({
        data: { itemId: item.id, collectionId: snippet.collectionId },
      })
      console.log(`  Created: ${snippet.title}`)
    } else {
      console.log(`  Already exists: ${snippet.title}`)
    }
  }

  console.log('Seeding prompts...')
  for (const prompt of prompts) {
    const exists = await prisma.item.findFirst({
      where: { title: prompt.title, userId: user.id },
    })
    if (!exists) {
      const item = await prisma.item.create({
        data: {
          title: prompt.title,
          content: prompt.content,
          userId: user.id,
          typeId: createdTypes['prompt'],
        },
      })
      await prisma.itemCollection.create({
        data: { itemId: item.id, collectionId: prompt.collectionId },
      })
      console.log(`  Created: ${prompt.title}`)
    } else {
      console.log(`  Already exists: ${prompt.title}`)
    }
  }

  console.log('Seeding commands...')
  for (const cmd of commands) {
    const exists = await prisma.item.findFirst({
      where: { title: cmd.title, userId: user.id },
    })
    const typeId = cmd.title === 'Deploy Script' ? createdTypes['snippet'] : createdTypes['command']
    if (!exists) {
      const item = await prisma.item.create({
        data: {
          title: cmd.title,
          content: cmd.content,
          description: cmd.description,
          userId: user.id,
          typeId,
        },
      })
      await prisma.itemCollection.create({
        data: { itemId: item.id, collectionId: cmd.collectionId },
      })
      console.log(`  Created: ${cmd.title}`)
    } else {
      console.log(`  Already exists: ${cmd.title}`)
    }
  }

  console.log('Seeding links...')
  for (const link of links) {
    const exists = await prisma.item.findFirst({
      where: { title: link.title, userId: user.id },
    })
    if (!exists) {
      const item = await prisma.item.create({
        data: {
          title: link.title,
          url: link.url,
          description: link.description,
          userId: user.id,
          typeId: createdTypes['link'],
        },
      })
      await prisma.itemCollection.create({
        data: { itemId: item.id, collectionId: link.collectionId },
      })
      console.log(`  Created: ${link.title}`)
    } else {
      console.log(`  Already exists: ${link.title}`)
    }
  }

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })