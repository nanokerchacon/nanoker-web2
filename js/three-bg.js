import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

export function initThreeBackground() {
  // --- CONFIGURACIÓN ---
  const STATES = {
    hero: {
      color: new THREE.Color(0xffffff),
      emissive: new THREE.Color(0x000000),
      roughness: 0.1,
      metalness: 1.0,
      waveType: 0,
      freq: 0.2,
      amp: 1.0,
    },
    quantum: {
      color: new THREE.Color(0x220011),
      emissive: new THREE.Color(0xff0055),
      roughness: 0.0,
      metalness: 0.8,
      waveType: 1,
      freq: 2.0,
      amp: 0.5,
    },
    semi: {
      color: new THREE.Color(0x001133),
      emissive: new THREE.Color(0x00ffff),
      roughness: 0.2,
      metalness: 0.9,
      waveType: 2,
      freq: 0.8,
      amp: 0.4,
    },
    extreme: {
      color: new THREE.Color(0x221100),
      emissive: new THREE.Color(0xffaa00),
      roughness: 0.4,
      metalness: 0.6,
      waveType: 0,
      freq: 0.1,
      amp: 2.5,
    },
  };

  let current = { ...STATES.hero };
  let target = STATES.hero;

  // --- SETUP ---
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020202);
  scene.fog = new THREE.FogExp2(0x020202, 0.02);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 25, 50);

  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  document.body.appendChild(renderer.domElement);

  // --- LUCES ---
  scene.add(new THREE.AmbientLight(0xffffff, 2.0));
  const mainLight = new THREE.DirectionalLight(0xffffff, 3.0);
  mainLight.position.set(10, 20, 10);
  scene.add(mainLight);

  // --- GEOMETRÍA ---
  const geometry = new THREE.TetrahedronGeometry(0.15, 0);
  geometry.scale(1, 5, 1);
  geometry.rotateX(Math.PI / 2);

  const material = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.1,
    metalness: 1.0,
    emissive: 0x000000,
    emissiveIntensity: 1.0,
  });

  const ROWS = 100;
  const COLS = 100;

  const mesh = new THREE.InstancedMesh(geometry, material, ROWS * COLS);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(mesh);

  const dummy = new THREE.Object3D();
  const positions = [];
  for (let i = 0; i < COLS; i++) {
    for (let j = 0; j < ROWS; j++) {
      positions.push({ x: (i - COLS / 2) * 0.7, z: (j - ROWS / 2) * 0.7 });
      mesh.setMatrixAt(i * ROWS + j, dummy.matrix);
    }
  }

  // --- POST-PROCESSING ---
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
  bloomPass.threshold = 0.1;
  bloomPass.strength = 0.6;
  bloomPass.radius = 0.8;
  composer.addPass(bloomPass);

  // --- INPUT ---
  const clock = new THREE.Clock();
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const targetPos = new THREE.Vector3(0, -100, 0);

  window.addEventListener("mousemove", (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // --- API para controlar estado desde main.js ---
  function setTargetState(name) {
    const next = STATES[name] ?? STATES.hero;
    target = next;
  }

  // --- LOOP ---
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    const lerp = 0.05;

    // Interpolación
    current.color.lerp(target.color, lerp);
    current.emissive.lerp(target.emissive, lerp);
    current.roughness += (target.roughness - current.roughness) * lerp;
    current.metalness += (target.metalness - current.metalness) * lerp;
    current.waveType += (target.waveType - current.waveType) * lerp;
    current.freq += (target.freq - current.freq) * lerp;
    current.amp += (target.amp - current.amp) * lerp;

    material.color.copy(current.color);
    material.emissive.copy(current.emissive);
    material.roughness = current.roughness;
    material.metalness = current.metalness;

    // Mouse influence
    raycaster.setFromCamera(mouse, camera);
    const intersect = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersect);
    if (intersect) targetPos.lerp(intersect, 0.1);

    // Cámara
    camera.position.x += (mouse.x * 2 - camera.position.x) * 0.02;
    camera.position.y = 25 + Math.sin(t * 0.2) * 2;
    camera.lookAt(0, 0, 0);

    // Grid
    let idx = 0;
    const animTime = t * current.freq;

    for (let i = 0; i < COLS; i++) {
      for (let j = 0; j < ROWS; j++) {
        const p = positions[idx];

        const valWave = Math.sin(p.x * 0.2 + animTime) + Math.cos(p.z * 0.15 + animTime * 0.8);
        const valJitter = Math.sin(p.x * 10 + t * 10) * Math.cos(p.z * 10 + t * 10);

        const rawGrid = Math.sin(p.x * 0.3 + animTime) * Math.cos(p.z * 0.3 + animTime);
        const valGrid = Math.pow(rawGrid, 3) * 4.0;

        let finalVal = 0;
        if (current.waveType < 0.5) finalVal = valWave;
        else if (current.waveType < 1.5) finalVal = valWave * 0.2 + valJitter * 0.8;
        else finalVal = valGrid;

        let y = finalVal * current.amp;

        const dist = Math.sqrt((p.x - targetPos.x) ** 2 + (p.z - targetPos.z) ** 2);
        const influence = Math.max(0, 1 - dist / 15);
        const smoothInf = influence * influence * (3 - 2 * influence);
        y = y * (1 - smoothInf);

        const rotX = Math.cos(p.x * 0.2 + t) * 0.5 * (1 - smoothInf) * current.amp;
        const rotZ = Math.sin(p.z * 0.2 + t) * 0.5 * (1 - smoothInf) * current.amp;

        dummy.position.set(p.x, y, p.z);
        dummy.rotation.set(rotX, 0, rotZ);

        const s = 1 + smoothInf * 0.5;
        dummy.scale.set(s, s, s);

        dummy.updateMatrix();
        mesh.setMatrixAt(idx, dummy.matrix);
        idx++;
      }
    }

    mesh.instanceMatrix.needsUpdate = true;
    composer.render();
  }

  // Resize
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
  });

  animate();

  // Lo que exponemos al exterior
  return {
    setTargetState,
  };
}
