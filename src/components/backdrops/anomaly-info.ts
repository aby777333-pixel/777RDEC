/**
 * The two events that tie the Cosmic Anomaly pen's target nav to its scene,
 * and how many targets there are.
 *
 * Kept apart from the scene so the nav can render with the page while the
 * scene's Three.js arrives in a chunk of its own.
 */

/** Pulsar, spiral galaxy, black hole. */
export const ANOMALY_COUNT = 3

/** Controls → scene: `detail` is -1 or 1. */
export const ANOMALY_MORPH = 'anomaly:morph'
/** Scene → controls: a morph was accepted; `detail` is the target's index. */
export const ANOMALY_TARGET = 'anomaly:target'
