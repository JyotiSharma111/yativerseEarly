/**
 * yAtIverse image optimization helpers
 * Use these instead of raw Unsplash URLs for better performance.
 */

/**
 * Returns an optimized Unsplash URL with width, quality, and format parameters.
 * @param {string} baseUrl  - Raw Unsplash photo URL (without params)
 * @param {object} opts
 * @param {number} opts.w   - Width in px (default 800)
 * @param {number} opts.q   - Quality 1-100 (default 80)
 * @param {string} opts.fit - Crop mode: crop | clamp | fill (default crop)
 * @param {string} opts.fm  - Format: webp | jpg | png | auto (default webp)
 */
export function imgUrl(baseUrl, { w = 800, q = 80, fit = 'crop', fm = 'webp' } = {}) {
  // Strip existing params
  const clean = baseUrl.split('?')[0]
  return `${clean}?auto=format&fit=${fit}&w=${w}&q=${q}&fm=${fm}`
}

/**
 * Returns a srcSet string for responsive images.
 * @param {string} baseUrl
 * @param {number[]} widths - Array of widths e.g. [400, 800, 1200]
 * @param {number} quality
 */
export function srcSet(baseUrl, widths = [400, 800, 1200, 1600], quality = 80) {
  return widths
    .map(w => `${imgUrl(baseUrl, { w, q: quality })} ${w}w`)
    .join(', ')
}

/**
 * Returns sizes attribute string for responsive images.
 * @param {string} defaultSize - e.g. "100vw" or "50vw"
 */
export function sizes(breakpoints = {
  sm: '100vw',
  md: '50vw',
  lg: '33vw',
  default: '100vw',
}) {
  const { sm, md, lg, default: def } = breakpoints
  return [
    lg  ? `(min-width: 1024px) ${lg}`  : null,
    md  ? `(min-width: 768px) ${md}`   : null,
    sm  ? `(min-width: 640px) ${sm}`   : null,
    def,
  ].filter(Boolean).join(', ')
}

/**
 * Prebuilt presets for common use cases.
 */
export const preset = {
  hero:      (url) => imgUrl(url, { w: 1600, q: 90 }),
  heroMobile:(url) => imgUrl(url, { w: 800,  q: 85 }),
  product:   (url) => imgUrl(url, { w: 1200, q: 85 }),
  card:      (url) => imgUrl(url, { w: 600,  q: 80 }),
  thumb:     (url) => imgUrl(url, { w: 200,  q: 75 }),
  avatar:    (url) => imgUrl(url, { w: 120,  q: 80 }),
}
