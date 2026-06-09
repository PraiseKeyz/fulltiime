import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service.js';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Return a fresh cached value for `key`, or fetch + store it.
   *
   *   1. Look up the key. Fresh (expires_at in the future)? → return it.
   *   2. Missing or stale? → run `fetcher`, store with a new TTL, return.
   *
   * @param key      unique cache key, e.g. `bracket:<leagueId>`
   * @param ttlMs    how long the stored value stays fresh, in milliseconds
   * @param fetcher  produces the value on a miss (the slow external call)
   */
  async getOrSet<T>(key: string, ttlMs: number, fetcher: () => Promise<T>): Promise<T> {
    const hit = await this.prisma.cache.findUnique({ where: { key } });

    if (hit && hit.expires_at > new Date()) {
      this.logger.log(`Cache HIT  ${key}`);
      return hit.payload as T; // fresh — no external call
    }

    // Miss or stale → fetch fresh
    this.logger.log(`Cache MISS ${key} → fetching`);
    const value = await fetcher();

    // Only cache real values (don't store null/empty failures)
    if (value != null) {
      const expires_at = new Date(Date.now() + ttlMs);
      try {
        await this.prisma.cache.upsert({
          where:  { key },
          update: { payload: value as any, expires_at },
          create: { key, payload: value as any, expires_at },
        });
      } catch (err: any) {
        this.logger.warn(`Failed to write cache for ${key}: ${err.message}`);
      }
    }

    return value;
  }

  async get<T>(key: string): Promise<T | null> {
    const hit = await this.prisma.cache.findUnique({ where: { key } });
    if (!hit || hit.expires_at <= new Date()) return null;
    return hit.payload as T;
  }

  async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    const expires_at = new Date(Date.now() + ttlMs);
    await this.prisma.cache.upsert({
      where:  { key },
      update: { payload: value as any, expires_at },
      create: { key, payload: value as any, expires_at },
    });
  }

  async invalidate(key: string): Promise<void> {
    await this.prisma.cache.deleteMany({ where: { key } });
  }
}
