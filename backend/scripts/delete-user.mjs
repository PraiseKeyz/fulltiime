// Delete a user account by email.
//   Usage: node --env-file=.env scripts/delete-user.mjs <email>
//
// Favorites (team/league) are M2M and clear automatically. Authored articles use
// a required FK with no cascade, so we delete them in the same transaction.

import pkg from '../generated/prisma/index.js'
const { PrismaClient } = pkg
const prisma = new PrismaClient()

const email = process.argv[2]
if (!email) {
  console.error('Usage: node --env-file=.env scripts/delete-user.mjs <email>')
  process.exit(1)
}

const user = await prisma.user.findUnique({
  where:  { email },
  select: { id: true, email: true, username: true, full_name: true, role: true },
})

if (!user) {
  console.log(`No user found with email: ${email}`)
  await prisma.$disconnect()
  process.exit(0)
}

const articles = await prisma.article.count({ where: { author_id: user.id } })

console.log('Deleting:')
console.log(`  ${user.full_name ?? user.username} <${user.email}>  (role: ${user.role})`)
console.log(`  authored articles to remove: ${articles}`)

await prisma.$transaction([
  prisma.article.deleteMany({ where: { author_id: user.id } }),
  prisma.user.delete({ where: { id: user.id } }),
])

console.log(`\n✓ Deleted ${user.email}`)
await prisma.$disconnect()
