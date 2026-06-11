import pkg from './generated/prisma/index.js'
import { writeFileSync } from 'node:fs'

const { PrismaClient } = pkg
const prisma = new PrismaClient()

// No `select` → returns every scalar column on the User model.
const users = await prisma.user.findMany({ orderBy: { created_at: 'asc' } })

const cell = (v) => {
  if (v === null || v === undefined) return '—'
  if (v instanceof Date) return v.toISOString()
  return String(v).replace(/\|/g, '\\|').replace(/\n/g, ' ')
}

let md = `# Users table dump\n\n`
md += `_Generated ${new Date().toISOString()}_\n\n`
md += `**Total users:** ${users.length}\n\n`
md += `> ⚠️ Contains password hashes and auth tokens — do not commit or share this file.\n\n`

users.forEach((u, i) => {
  md += `## ${i + 1}. ${u.email}\n\n`
  md += `| field | value |\n|---|---|\n`
  for (const [key, value] of Object.entries(u)) {
    md += `| \`${key}\` | ${cell(value)} |\n`
  }
  md += `\n`
})

writeFileSync('users.md', md)
console.log(`Wrote users.md — ${users.length} users, all columns.`)

await prisma.$disconnect()
