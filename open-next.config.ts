import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";
// 如果你使用 ISR (revalidate)，也需要队列
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";

export default defineCloudflareConfig({
  // 使用 R2 作为增量缓存来存储 SSG 页面
  incrementalCache: withRegionalCache(r2IncrementalCache, {
    mode: "long-lived",
    // 启用懒更新，提高缓存命中率
    shouldLazilyUpdateOnCacheHit: true,
  }),

  // 如果你的 SSG 页面有 revalidate 时间，则需要队列来处理重新验证
  queue: doQueue,

  // 对缓存的路由开启拦截，可以提升性能
  enableCacheInterception: true,
});
