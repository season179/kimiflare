/** In-memory store for raw tool outputs.
 *  Artifacts are never persisted to disk. Eviction is LRU by insertion order. */
export class ToolArtifactStore {
  private artifacts = new Map<string, string>();
  private nextId = 0;
  private maxArtifacts: number;
  private maxTotalChars: number;

  constructor(opts?: { maxArtifacts?: number; maxTotalChars?: number }) {
    this.maxArtifacts = opts?.maxArtifacts ?? 500;
    this.maxTotalChars = opts?.maxTotalChars ?? 2_000_000;
  }

  /** Store raw content and return a stable artifact ID. */
  store(raw: string): string {
    const id = `art_${++this.nextId}`;

    // Evict oldest artifacts until we have room
    while (this.totalChars() + raw.length > this.maxTotalChars && this.artifacts.size > 0) {
      this.evictOldest();
    }
    while (this.artifacts.size >= this.maxArtifacts && this.artifacts.size > 0) {
      this.evictOldest();
    }

    this.artifacts.set(id, raw);
    return id;
  }

  retrieve(id: string): string | undefined {
    return this.artifacts.get(id);
  }

  has(id: string): boolean {
    return this.artifacts.has(id);
  }

  clear(): void {
    this.artifacts.clear();
    this.nextId = 0;
  }

  size(): number {
    return this.artifacts.size;
  }

  private totalChars(): number {
    let sum = 0;
    for (const raw of this.artifacts.values()) {
      sum += raw.length;
    }
    return sum;
  }

  private evictOldest(): void {
    // Map preserves insertion order; first key is oldest
    const first = this.artifacts.keys().next().value;
    if (first !== undefined) {
      this.artifacts.delete(first);
    }
  }
}
