import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

// Mirrors TRANSFER_PATTERNS in src/news/news-sync.service.ts
const TRANSFER_PATTERNS = [
  /\btransfer(s|red)?\b/i,
  /\bsigns?\b/i,
  /\bsigning\b/i,
  /\bjoins?\b/i,
  /\bloan\b/i,
  /\bmoves? to\b/i,
  /\bagrees? (a |to )?(deal|move|terms)\b/i,
  /\bin talks\b/i,
  /\blinked with\b/i,
  /\b(undergoes|completes) (a |his |her )?medical\b/i,
];

const articles = await prisma.article.findMany({
  where:  { source_url: { not: null }, category: 'NEWS' },
  select: { id: true, title: true },
});

let updated = 0;

for (const article of articles) {
  if (TRANSFER_PATTERNS.some(re => re.test(article.title))) {
    await prisma.article.update({
      where: { id: article.id },
      data:  { category: 'TRANSFER' },
    });
    console.log(`TRANSFER: ${article.title}`);
    updated++;
  }
}

console.log(`\nRe-categorized ${updated} of ${articles.length} BBC article(s) as TRANSFER.`);
await prisma.$disconnect();
