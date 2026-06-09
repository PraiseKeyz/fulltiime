import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();
const articles = await prisma.article.findMany({
  select: { slug: true, is_published: true, source_url: true },
  orderBy: { created_at: 'desc' },
  take: 20,
});
console.log(`Total found: ${articles.length}`);
articles.forEach(a => console.log(`  is_published=${a.is_published}  slug=${a.slug}`));
await prisma.$disconnect();
