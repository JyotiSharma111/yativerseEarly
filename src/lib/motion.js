// Shared animation variants — import these instead of defining per-component

export const ease = [0.22, 1, 0.36, 1]

export const fadeUp = (delay = 0, distance = 32) => ({
  initial:     { opacity: 0, y: distance },
  whileInView: { opacity: 1, y: 0 },
  viewport:    { once: true, amount: 0.15 },
  transition:  { duration: 0.75, delay, ease },
})

export const fadeIn = (delay = 0) => ({
  initial:     { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport:    { once: true },
  transition:  { duration: 0.7, delay, ease },
})

export const fadeLeft = (delay = 0) => ({
  initial:     { opacity: 0, x: -28 },
  whileInView: { opacity: 1, x: 0 },
  viewport:    { once: true, amount: 0.2 },
  transition:  { duration: 0.7, delay, ease },
})

export const fadeRight = (delay = 0) => ({
  initial:     { opacity: 0, x: 28 },
  whileInView: { opacity: 1, x: 0 },
  viewport:    { once: true, amount: 0.2 },
  transition:  { duration: 0.7, delay, ease },
})

export const scaleIn = (delay = 0) => ({
  initial:     { opacity: 0, scale: 0.94 },
  whileInView: { opacity: 1, scale: 1 },
  viewport:    { once: true, amount: 0.15 },
  transition:  { duration: 0.65, delay, ease },
})

export const stagger = (staggerChildren = 0.08, delayChildren = 0) => ({
  initial:     {},
  whileInView: {},
  viewport:    { once: true, amount: 0.1 },
  transition:  { staggerChildren, delayChildren },
})

export const staggerChild = {
  initial:    { opacity: 0, y: 20 },
  whileInView:{ opacity: 1, y: 0 },
  transition: { duration: 0.6, ease },
}

// Hero entrance (triggered on mount, not scroll)
export const heroEntrance = (delay = 0) => ({
  initial:    { opacity: 0, y: 28 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease },
})
