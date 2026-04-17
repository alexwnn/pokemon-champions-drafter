const DAY = 24 * 60 * 60 * 1000;

export const TTL = {
  pokemonDetail: 30 * DAY,
  usage: 6 * 60 * 60 * 1000,
  topList: 6 * 60 * 60 * 1000,
} as const;

export function isFresh(fetchedAt: number, ttlMs: number): boolean {
  return Date.now() - fetchedAt < ttlMs;
}
