/**
 * What the Cosmic Anomaly pen's telemetry panel says about each of its three
 * targets, verbatim, and the two events that tie its controls to its scene.
 *
 * Kept apart from the scene so the controls can render with the page while the
 * scene's Three.js arrives in a chunk of its own.
 */
export const ANOMALY_INFO = [
  {
    name: 'Pulsar (Neutron Star)',
    copy: 'A highly magnetized, rapidly rotating neutron star. Born from the supernova explosion of a massive star, channeling intense electromagnetic radiation through its poles.',
    form: 'Hyper-dense core, twisting toroidal magnetic filaments, extreme non-linear polar jets.',
    palette: 'Blinding magenta core, deep neon violet flux lines, piercing cyan gamma emissions.',
    motion: 'Violent rotational spin with oscillating magnetic sweeping.',
  },
  {
    name: 'Spiral Galaxy',
    copy: 'A gravitationally bound system of stars, stellar remnants, interstellar gas, and dark matter. It slowly rotates, forming majestic, density-clustered spiral arms.',
    form: 'Dense galactic bulge, logarithmic arms with secondary branches and structural dust lanes.',
    palette: 'Blazing golden core, saturated teal/cyan stellar nurseries, deep indigo dust.',
    motion: 'Majestic galactic rotation with fluid local orbital shearing.',
  },
  {
    name: 'Singularity (Black Hole)',
    copy: 'A region of spacetime where gravity is so intense that nothing can escape. Matter falling towards it forms a superheated accretion disk affected by relativistic Doppler beaming.',
    form: 'Absolute void event horizon, warped accretion disk, 3D gravitational lensing.',
    palette: 'X-ray blue/white inner horizon shifting to crimson plasma, enhanced by Doppler blueshift.',
    motion: 'Extreme orbital velocity causing intense mathematical shearing and light warping.',
  },
] as const

export const ANOMALY_COUNT = ANOMALY_INFO.length

/** Controls → scene: `detail` is -1 or 1. */
export const ANOMALY_MORPH = 'anomaly:morph'
/** Scene → controls: a morph was accepted; `detail` is the target's index. */
export const ANOMALY_TARGET = 'anomaly:target'
