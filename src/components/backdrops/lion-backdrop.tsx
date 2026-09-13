'use client'

import {
  BoxGeometry,
  BufferAttribute,
  ColorManagement,
  CylinderGeometry,
  DirectionalLight,
  Group,
  HemisphereLight,
  LinearSRGBColorSpace,
  type Material,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  TorusGeometry,
  Vector3,
  WebGLRenderer,
} from 'three'
import { cn } from '@/lib/utils'
import { type BackdropScene, isInteractiveTarget, useBackdropCanvas } from './use-backdrop-canvas'

/**
 * "Chill the lion" by Yakudoo, ported.
 * https://codepen.io/Yakudoo/pen/YXxmYR
 *
 * A low-poly lion sitting behind a little desk fan. The fan follows the
 * pointer; the lion watches it, head, eyes and knees turning to track it. Press
 * and hold and the fan spins up and blows: the lion shuts its eyes, turns its
 * face into the wind with a blissful grin, and its mane, ears and whiskers
 * ripple — harder the closer the fan is. Let go and the fan winds down and the
 * lion goes back to watching.
 *
 * Every mesh, material, light, easing, rule-of-three mapping and the wind
 * maths are the pen's, values included.
 *
 * Asked for on this page:
 *
 * - **The background is black**, and so is the floor, which in the pen is the
 *   page's own pale pink so the shadows fall on the page.
 * - **The text is gone**: the "Press and drag to make wind" instructions and
 *   the credits line.
 *
 * What changed, because three changed underneath the pen (it is r70):
 *
 * - **Colour and light.** r70 had no colour management and did not divide
 *   diffuse light by π. The colours are taken as written, the output is left
 *   linear, and every intensity is scaled by π, so the lion is the pen's
 *   yellow and red rather than a washed-out one.
 * - **Shadows.** r70's directional shadow camera covered ±500 by default and
 *   today's covers ±5; the pen's defaults are set back. `shadowDarkness` is
 *   now `shadow.intensity`.
 * - **The body.** The pen pulls the top of the body's cylinder toward the head
 *   by editing `geometry.vertices`, which no longer exists; the same vertices
 *   are edited in the position buffer instead.
 * - **The pointer is the hero's.** The pen tracks the whole window; here the
 *   fan follows the pointer over this band, measured from where the lion sits,
 *   and a press on a link or a button in the hero is left alone. Touch blows
 *   too, but no longer stops the page from scrolling.
 * - **The view is centred right of the copy on a wide band**, by offsetting
 *   the camera's frustum, and the field of view is narrowed to suit a band
 *   rather than a window, so the lion is the size it is in the pen.
 */

const WIDE_CENTRE_X = 0.68
/**
 * The pen's camera sees 60° of a full window; a hero band is a third of that
 * height, and at 60° the lion shrank to a third with it. 42° frames about 600
 * units — the lion at the size it has in the pen, and still the whole of the
 * fan's ±250 of travel.
 */
const BAND_FOV = 42
const WIDE_FROM = 1024
const PI = Math.PI

function rule3(v: number, vmin: number, vmax: number, tmin: number, tmax: number) {
  const nv = Math.max(Math.min(v, vmax), vmin)
  const dv = vmax - vmin
  const pc = (nv - vmin) / dv
  const dt = tmax - tmin
  return tmin + pc * dt
}

function lambert(color: number) {
  return new MeshLambertMaterial({ color, flatShading: true })
}

class Fan {
  isBlowing = false
  speed = 0
  acc = 0
  tPosX = 0
  tPosY = 0
  targetSpeed = 0
  redMat = lambert(0xad3525)
  greyMat = lambert(0x653f4c)
  yellowMat = lambert(0xfdd276)
  core: Mesh
  sphere: Mesh
  propeller = new Group()
  threegroup = new Group()
  geometries: BoxGeometry[]

  constructor() {
    const coreGeom = new BoxGeometry(10, 10, 20)
    const sphereGeom = new BoxGeometry(10, 10, 3)
    const propGeom = new BoxGeometry(10, 30, 2)
    propGeom.applyMatrix4(new Matrix4().makeTranslation(0, 25, 0))
    this.geometries = [coreGeom, sphereGeom, propGeom]

    this.core = new Mesh(coreGeom, this.greyMat)

    const prop1 = new Mesh(propGeom, this.redMat)
    prop1.position.z = 15
    const prop2 = prop1.clone()
    prop2.rotation.z = PI / 2
    const prop3 = prop1.clone()
    prop3.rotation.z = PI
    const prop4 = prop1.clone()
    prop4.rotation.z = -PI / 2

    this.sphere = new Mesh(sphereGeom, this.yellowMat)
    this.sphere.position.z = 15

    this.propeller.add(prop1, prop2, prop3, prop4)
    this.threegroup.add(this.core, this.propeller, this.sphere)
  }

  update(xTarget: number, yTarget: number, deltaTime: number) {
    this.threegroup.lookAt(new Vector3(0, 80, 60))
    this.tPosX = rule3(xTarget, -200, 200, -250, 250)
    this.tPosY = rule3(yTarget, -200, 200, 250, -250)

    this.threegroup.position.x += (this.tPosX - this.threegroup.position.x) * deltaTime * 4
    this.threegroup.position.y += (this.tPosY - this.threegroup.position.y) * deltaTime * 4

    this.targetSpeed = this.isBlowing ? 15 * deltaTime : 5 * deltaTime
    if (this.isBlowing && this.speed < this.targetSpeed) {
      this.acc += 0.01 * deltaTime
      this.speed += this.acc
    } else if (!this.isBlowing) {
      this.acc = 0
      this.speed *= Math.pow(0.4, deltaTime)
    }
    this.propeller.rotation.z += this.speed
  }

  materials(): Material[] {
    return [this.redMat, this.greyMat, this.yellowMat]
  }
}

type ManePart = { mesh: Mesh; amp: number; zOffset: number; periodOffset: number }

class Lion {
  windTime = 0
  maneParts: ManePart[] = []
  threegroup = new Group()
  yellowMat = lambert(0xfdd276)
  redMat = lambert(0xad3525)
  pinkMat = lambert(0xe55d2b)
  whiteMat = lambert(0xffffff)
  purpleMat = lambert(0x451954)
  greyMat = lambert(0x653f4c)
  blackMat = lambert(0x302925)
  geometries: (BoxGeometry | CylinderGeometry | TorusGeometry)[] = []

  body: Mesh
  /** The top of the body: indices into the position buffer, and their rest x. */
  bodyTop: { index: number; x: number }[] = []
  leftKnee: Mesh
  rightKnee: Mesh
  mane = new Group()
  face: Mesh
  mustaches: Mesh[] = []
  leftEye: Mesh
  rightEye: Mesh
  leftIris: Mesh
  rightIris: Mesh
  mouth: Mesh
  smile: Mesh
  lips: Mesh
  rightEar: Mesh
  leftEar: Mesh
  nose: Mesh
  head = new Group()

  tHeagRotY = 0
  tHeadRotX = 0
  tHeadPosX = 0
  tHeadPosY = 0
  tHeadPosZ = 0
  tEyeScale = 1
  tIrisYScale = 1
  tIrisZScale = 1
  tIrisPosY = 0
  tLeftIrisPosZ = 0
  tRightIrisPosZ = 0
  tLipsPosX = 0
  tLipsPosY = 0
  tSmilePosX = 0
  tMouthPosZ = 0
  tSmilePosZ = 0
  tSmilePosY = 0
  tSmileRotZ = 0
  tRightKneeRotZ = 0
  tLeftKneeRotZ = 0

  constructor() {
    const bodyGeom = new CylinderGeometry(30, 80, 140, 4)
    const maneGeom = new BoxGeometry(40, 40, 15)
    const faceGeom = new BoxGeometry(80, 80, 80)
    const spotGeom = new BoxGeometry(4, 4, 4)
    const mustacheGeom = new BoxGeometry(30, 2, 1)
    mustacheGeom.applyMatrix4(new Matrix4().makeTranslation(15, 0, 0))
    const earGeom = new BoxGeometry(20, 20, 20)
    const noseGeom = new BoxGeometry(40, 40, 20)
    const eyeGeom = new BoxGeometry(5, 30, 30)
    const irisGeom = new BoxGeometry(4, 10, 10)
    const mouthGeom = new BoxGeometry(20, 20, 10)
    const smileGeom = new TorusGeometry(12, 4, 2, 10, PI)
    const lipsGeom = new BoxGeometry(40, 15, 20)
    const kneeGeom = new BoxGeometry(25, 80, 80)
    kneeGeom.applyMatrix4(new Matrix4().makeTranslation(0, 50, 0))
    const footGeom = new BoxGeometry(40, 20, 20)
    this.geometries.push(
      bodyGeom, maneGeom, faceGeom, spotGeom, mustacheGeom, earGeom, noseGeom, eyeGeom,
      irisGeom, mouthGeom, smileGeom, lipsGeom, kneeGeom, footGeom,
    )

    // body — the pen moves the cylinder's top ring and cap centre to z = 70.
    this.body = new Mesh(bodyGeom, this.yellowMat)
    this.body.position.z = -60
    this.body.position.y = -30
    const positions = bodyGeom.attributes.position as BufferAttribute
    for (let i = 0; i < positions.count; i++) {
      if (Math.abs(positions.getY(i) - 70) < 1e-6) {
        positions.setZ(i, 70)
        this.bodyTop.push({ index: i, x: positions.getX(i) })
      }
    }

    // knee
    this.leftKnee = new Mesh(kneeGeom, this.yellowMat)
    this.leftKnee.position.set(65, -110, -20)
    this.leftKnee.rotation.z = -0.3

    this.rightKnee = new Mesh(kneeGeom, this.yellowMat)
    this.rightKnee.position.set(-65, -110, -20)
    this.rightKnee.rotation.z = 0.3

    // feet
    const backLeftFoot = new Mesh(footGeom, this.yellowMat)
    backLeftFoot.position.set(75, -90, 30)
    const backRightFoot = new Mesh(footGeom, this.yellowMat)
    backRightFoot.position.set(-75, -90, 30)
    const frontRightFoot = new Mesh(footGeom, this.yellowMat)
    frontRightFoot.position.set(-22, -90, 40)
    const frontLeftFoot = new Mesh(footGeom, this.yellowMat)
    frontLeftFoot.position.set(22, -90, 40)

    // mane
    for (let j = 0; j < 4; j++) {
      for (let k = 0; k < 4; k++) {
        const manePart = new Mesh(maneGeom, this.redMat)
        manePart.position.x = j * 40 - 60
        manePart.position.y = k * 40 - 60

        let amp: number
        let zOffset: number
        const periodOffset = Math.random() * PI * 2

        if ((j == 0 && k == 0) || (j == 0 && k == 3) || (j == 3 && k == 0) || (j == 3 && k == 3)) {
          amp = -10 - Math.floor(Math.random() * 5)
          zOffset = -5
        } else if (j == 0 || k == 0 || j == 3 || k == 3) {
          amp = -5 - Math.floor(Math.random() * 5)
          zOffset = 0
        } else {
          amp = 0
          zOffset = 0
        }

        this.maneParts.push({ mesh: manePart, amp, zOffset, periodOffset })
        this.mane.add(manePart)
      }
    }
    this.mane.position.y = -10
    this.mane.position.z = 80

    // face
    this.face = new Mesh(faceGeom, this.yellowMat)
    this.face.position.z = 135

    // mustaches — as the pen builds them, clones included
    const mustache1 = new Mesh(mustacheGeom, this.greyMat)
    mustache1.position.set(30, -5, 175)
    const mustache2 = mustache1.clone()
    mustache2.position.x = 35
    mustache2.position.y = -12
    const mustache3 = mustache1.clone()
    mustache3.position.y = -19
    mustache3.position.x = 30
    const mustache4 = mustache1.clone()
    mustache4.rotation.z = PI
    mustache4.position.x = -30
    const mustache5 = mustache2.clone()
    mustache5.rotation.z = PI
    mustache5.position.x = -35
    const mustache6 = mustache3.clone()
    mustache6.rotation.z = PI
    mustache6.position.x = -30
    this.mustaches.push(mustache1, mustache2, mustache3, mustache4, mustache5, mustache6)

    // spots
    const spot1 = new Mesh(spotGeom, this.redMat)
    spot1.position.x = 39
    spot1.position.z = 150
    const spot2 = spot1.clone()
    spot2.position.z = 160
    spot2.position.y = -10
    const spot3 = spot1.clone()
    spot3.position.z = 140
    spot3.position.y = -15
    const spot4 = spot1.clone()
    spot4.position.z = 150
    spot4.position.y = -20
    const spot5 = spot1.clone()
    spot5.position.x = -39
    const spot6 = spot2.clone()
    spot6.position.x = -39
    const spot7 = spot3.clone()
    spot7.position.x = -39
    const spot8 = spot4.clone()
    spot8.position.x = -39

    // eyes
    this.leftEye = new Mesh(eyeGeom, this.whiteMat)
    this.leftEye.position.set(40, 25, 120)
    this.rightEye = new Mesh(eyeGeom, this.whiteMat)
    this.rightEye.position.set(-40, 25, 120)

    // iris
    this.leftIris = new Mesh(irisGeom, this.purpleMat)
    this.leftIris.position.set(42, 25, 120)
    this.rightIris = new Mesh(irisGeom, this.purpleMat)
    this.rightIris.position.set(-42, 25, 120)

    // mouth
    this.mouth = new Mesh(mouthGeom, this.blackMat)
    this.mouth.position.z = 171
    this.mouth.position.y = -30
    this.mouth.scale.set(0.5, 0.5, 1)

    // smile
    this.smile = new Mesh(smileGeom, this.greyMat)
    this.smile.position.z = 173
    this.smile.position.y = -15
    this.smile.rotation.z = -PI

    // lips
    this.lips = new Mesh(lipsGeom, this.yellowMat)
    this.lips.position.z = 165
    this.lips.position.y = -45

    // ears
    this.rightEar = new Mesh(earGeom, this.yellowMat)
    this.rightEar.position.set(-50, 50, 105)
    this.leftEar = new Mesh(earGeom, this.yellowMat)
    this.leftEar.position.set(50, 50, 105)

    // nose
    this.nose = new Mesh(noseGeom, this.greyMat)
    this.nose.position.z = 170
    this.nose.position.y = 25

    // head
    this.head.add(
      this.face, this.mane, this.rightEar, this.leftEar, this.nose, this.leftEye, this.rightEye,
      this.leftIris, this.rightIris, this.mouth, this.smile, this.lips,
      spot1, spot2, spot3, spot4, spot5, spot6, spot7, spot8,
      mustache1, mustache2, mustache3, mustache4, mustache5, mustache6,
    )
    this.head.position.y = 60

    this.threegroup.add(
      this.body, this.head, this.leftKnee, this.rightKnee,
      backLeftFoot, backRightFoot, frontRightFoot, frontLeftFoot,
    )

    this.threegroup.traverse((object) => {
      if (object instanceof Mesh) {
        object.castShadow = true
        object.receiveShadow = true
      }
    })
  }

  updateBody(speed: number) {
    this.head.rotation.y += (this.tHeagRotY - this.head.rotation.y) / speed
    this.head.rotation.x += (this.tHeadRotX - this.head.rotation.x) / speed
    this.head.position.x += (this.tHeadPosX - this.head.position.x) / speed
    this.head.position.y += (this.tHeadPosY - this.head.position.y) / speed
    this.head.position.z += (this.tHeadPosZ - this.head.position.z) / speed

    this.leftEye.scale.y += (this.tEyeScale - this.leftEye.scale.y) / (speed * 2)
    this.rightEye.scale.y = this.leftEye.scale.y

    this.leftIris.scale.y += (this.tIrisYScale - this.leftIris.scale.y) / (speed * 2)
    this.rightIris.scale.y = this.leftIris.scale.y

    this.leftIris.scale.z += (this.tIrisZScale - this.leftIris.scale.z) / (speed * 2)
    this.rightIris.scale.z = this.leftIris.scale.z

    this.leftIris.position.y += (this.tIrisPosY - this.leftIris.position.y) / speed
    this.rightIris.position.y = this.leftIris.position.y
    this.leftIris.position.z += (this.tLeftIrisPosZ - this.leftIris.position.z) / speed
    this.rightIris.position.z += (this.tRightIrisPosZ - this.rightIris.position.z) / speed

    this.rightKnee.rotation.z += (this.tRightKneeRotZ - this.rightKnee.rotation.z) / speed
    this.leftKnee.rotation.z += (this.tLeftKneeRotZ - this.leftKnee.rotation.z) / speed

    this.lips.position.x += (this.tLipsPosX - this.lips.position.x) / speed
    this.lips.position.y += (this.tLipsPosY - this.lips.position.y) / speed
    this.smile.position.x += (this.tSmilePosX - this.smile.position.x) / speed
    this.mouth.position.z += (this.tMouthPosZ - this.mouth.position.z) / speed
    this.smile.position.z += (this.tSmilePosZ - this.smile.position.z) / speed
    this.smile.position.y += (this.tSmilePosY - this.smile.position.y) / speed
    this.smile.rotation.z += (this.tSmileRotZ - this.smile.rotation.z) / speed
  }

  /** The pen's body-vertex follow: the top of the body leans to the head. */
  followHead() {
    const positions = (this.body.geometry as CylinderGeometry).attributes.position as BufferAttribute
    for (const top of this.bodyTop) positions.setX(top.index, top.x + this.head.position.x)
    positions.needsUpdate = true
  }

  look(xTarget: number, yTarget: number) {
    this.tHeagRotY = rule3(xTarget, -200, 200, -PI / 4, PI / 4)
    this.tHeadRotX = rule3(yTarget, -200, 200, -PI / 4, PI / 4)
    this.tHeadPosX = rule3(xTarget, -200, 200, 70, -70)
    this.tHeadPosY = rule3(yTarget, -140, 260, 20, 100)
    this.tHeadPosZ = 0

    this.tEyeScale = 1
    this.tIrisYScale = 1
    this.tIrisZScale = 1
    this.tIrisPosY = rule3(yTarget, -200, 200, 35, 15)
    this.tLeftIrisPosZ = rule3(xTarget, -200, 200, 130, 110)
    this.tRightIrisPosZ = rule3(xTarget, -200, 200, 110, 130)

    this.tLipsPosX = 0
    this.tLipsPosY = -45

    this.tSmilePosX = 0
    this.tMouthPosZ = 174
    this.tSmilePosZ = 173
    this.tSmilePosY = -15
    this.tSmileRotZ = -PI

    this.tRightKneeRotZ = rule3(xTarget, -200, 200, 0.3 - PI / 8, 0.3 + PI / 8)
    this.tLeftKneeRotZ = rule3(xTarget, -200, 200, -0.3 - PI / 8, -0.3 + PI / 8)

    this.updateBody(10)

    this.mane.rotation.y = 0
    this.mane.rotation.x = 0

    for (const part of this.maneParts) {
      part.mesh.position.z = 0
      part.mesh.rotation.y = 0
    }
    for (const m of this.mustaches) m.rotation.y = 0

    this.followHead()
  }

  cool(xTarget: number, yTarget: number, deltaTime: number) {
    this.tHeagRotY = rule3(xTarget, -200, 200, PI / 4, -PI / 4)
    this.tHeadRotX = rule3(yTarget, -200, 200, PI / 4, -PI / 4)
    this.tHeadPosX = rule3(xTarget, -200, 200, -70, 70)
    this.tHeadPosY = rule3(yTarget, -140, 260, 100, 20)
    this.tHeadPosZ = 100

    this.tEyeScale = 0.1
    this.tIrisYScale = 0.1
    this.tIrisZScale = 3

    this.tIrisPosY = 20
    this.tLeftIrisPosZ = 120
    this.tRightIrisPosZ = 120

    this.tLipsPosX = rule3(xTarget, -200, 200, -15, 15)
    this.tLipsPosY = rule3(yTarget, -200, 200, -45, -40)

    this.tMouthPosZ = 168
    this.tSmilePosX = rule3(xTarget, -200, 200, -15, 15)
    this.tSmilePosY = rule3(yTarget, -200, 200, -20, -8)
    this.tSmilePosZ = 176
    this.tSmileRotZ = rule3(xTarget, -200, 200, -PI - 0.3, -PI + 0.3)

    this.tRightKneeRotZ = rule3(xTarget, -200, 200, 0.3 + PI / 8, 0.3 - PI / 8)
    this.tLeftKneeRotZ = rule3(xTarget, -200, 200, -0.3 + PI / 8, -0.3 - PI / 8)

    this.updateBody(10)

    this.mane.rotation.y = -0.8 * this.head.rotation.y
    this.mane.rotation.x = -0.8 * this.head.rotation.x

    let dt = 20000 / (xTarget * xTarget + yTarget * yTarget)
    dt = Math.max(Math.min(dt, 1), 0.5)
    this.windTime += dt * deltaTime * 40

    for (const part of this.maneParts) {
      part.mesh.position.z = part.zOffset + Math.sin(this.windTime + part.periodOffset) * part.amp * dt * 2
    }

    this.leftEar.rotation.x = ((Math.cos(this.windTime) * PI) / 16) * dt
    this.rightEar.rotation.x = ((-Math.cos(this.windTime) * PI) / 16) * dt

    for (let i = 0; i < this.mustaches.length; i++) {
      const amp = i < 3 ? -PI / 8 : PI / 8
      this.mustaches[i].rotation.y = amp + Math.cos(this.windTime + i) * dt * amp
    }

    this.followHead()
  }

  materials(): Material[] {
    return [
      this.yellowMat, this.redMat, this.pinkMat, this.whiteMat,
      this.purpleMat, this.greyMat, this.blackMat,
    ]
  }
}

const STEP = 1 / 60

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  let renderer: WebGLRenderer
  try {
    renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true })
  } catch {
    host.dataset.gl = 'off'
    return null
  }
  renderer.outputColorSpace = LinearSRGBColorSpace
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = PCFShadowMap

  const section = host.parentElement ?? host

  const scene = new Scene()
  const camera = new PerspectiveCamera(BAND_FOV, 1, 1, 2000)
  camera.position.z = 800
  camera.position.y = 0
  camera.lookAt(new Vector3(0, 0, 0))

  // ---- lights, at r70's scale ----
  const light = new HemisphereLight(0xffffff, 0xffffff, 0.5 * PI)
  const shadowLight = new DirectionalLight(0xffffff, 0.8 * PI)
  shadowLight.position.set(200, 200, 200)
  shadowLight.castShadow = true
  const backLight = new DirectionalLight(0xffffff, 0.4 * PI)
  backLight.position.set(-100, 200, 50)
  backLight.castShadow = true
  for (const [lamp, darkness] of [
    [shadowLight, 0.2],
    [backLight, 0.1],
  ] as const) {
    const cam = lamp.shadow.camera
    cam.left = -500
    cam.right = 500
    cam.top = 500
    cam.bottom = -500
    cam.near = 50
    cam.far = 5000
    cam.updateProjectionMatrix()
    lamp.shadow.mapSize.set(512, 512)
    lamp.shadow.intensity = darkness
  }
  scene.add(backLight, light, shadowLight)

  // Colours as r70 read them.
  const managed = ColorManagement.enabled
  ColorManagement.enabled = false

  // ---- floor: the pen's page colour, black on this page ----
  const floorGeom = new PlaneGeometry(1000, 500)
  const floorMat = new MeshBasicMaterial({ color: 0x000000 })
  const floor = new Mesh(floorGeom, floorMat)
  floor.rotation.x = -PI / 2
  floor.position.y = -100
  floor.receiveShadow = true
  scene.add(floor)

  const lion = new Lion()
  scene.add(lion.threegroup)

  const fan = new Fan()
  fan.threegroup.position.z = 350
  scene.add(fan.threegroup)

  ColorManagement.enabled = managed

  // ---- pointer, over the band ----
  let width = 1
  let height = 1
  let centreX = 0.5
  let mousePos = { x: 0, y: 0 }
  let isBlowing = false

  const local = (clientX: number, clientY: number) => {
    const rect = host.getBoundingClientRect()
    return { x: clientX - rect.left, y: clientY - rect.top }
  }
  const onPointerMove = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return
    mousePos = local(e.clientX, e.clientY)
  }
  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return
    if (isInteractiveTarget(e.target)) return
    isBlowing = true
  }
  const onPointerUp = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return
    isBlowing = false
  }
  const onTouchStart = (e: TouchEvent) => {
    if (isInteractiveTarget(e.target)) return
    if (e.touches.length > 1) {
      mousePos = local(e.touches[0].clientX, e.touches[0].clientY)
      isBlowing = true
    }
  }
  const onTouchMove = (e: TouchEvent) => {
    if (e.touches.length == 1) {
      mousePos = local(e.touches[0].clientX, e.touches[0].clientY)
      isBlowing = true
    }
  }
  const onTouchEnd = () => {
    isBlowing = false
  }
  section.addEventListener('pointermove', onPointerMove)
  section.addEventListener('pointerdown', onPointerDown)
  window.addEventListener('pointerup', onPointerUp)
  section.addEventListener('touchstart', onTouchStart, { passive: true })
  section.addEventListener('touchmove', onTouchMove, { passive: true })
  window.addEventListener('touchend', onTouchEnd)

  let last = -1
  let carry = 0

  const tick = (deltaTime: number) => {
    const xTarget = mousePos.x - width * centreX
    const yTarget = mousePos.y - height / 2
    fan.isBlowing = isBlowing
    fan.update(xTarget, yTarget, deltaTime)
    if (isBlowing) lion.cool(xTarget, yTarget, deltaTime)
    else lion.look(xTarget, yTarget)
  }

  return {
    resize(w, h, dpr) {
      width = w
      height = h
      centreX = w >= WIDE_FROM ? WIDE_CENTRE_X : 0.5
      renderer.setPixelRatio(dpr)
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      if (w >= WIDE_FROM) camera.setViewOffset(w, h, w * (0.5 - WIDE_CENTRE_X), 0, w, h)
      else camera.clearViewOffset()
      camera.updateProjectionMatrix()
      renderer.render(scene, camera)
    },
    frame(seconds) {
      const delta = last < 0 ? STEP : Math.min(0.1, Math.max(0, seconds - last))
      last = seconds
      // The pen eases by a fixed fraction per frame; keep that to its 60 a
      // second, handing each step its own slice of the elapsed time.
      carry += delta
      let steps = 0
      while (carry >= STEP && steps < 6) {
        tick(STEP)
        carry -= STEP
        steps++
      }
      if (steps === 6) carry = 0
      renderer.render(scene, camera)
    },
    dispose() {
      section.removeEventListener('pointermove', onPointerMove)
      section.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
      section.removeEventListener('touchstart', onTouchStart)
      section.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      for (const g of [...lion.geometries, ...fan.geometries, floorGeom]) g.dispose()
      for (const m of [...lion.materials(), ...fan.materials(), floorMat]) m.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
    },
  }
}

export function LionBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 2 })
  return <div ref={hostRef} className={cn('pen-scene pen-scene--lion', className)} aria-hidden />
}
