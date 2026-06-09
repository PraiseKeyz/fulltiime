import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

// Delete all BBC-synced articles (those with source_url set).
// They will be re-created by the next sync run with clean slugs.
const { count } = await prisma.article.deleteMany({
  where: { source_url: { not: null } },
});

console.log(`Deleted ${count} BBC article(s). Run POST /sync/news to re-sync.`);
await prisma.$disconnect();
