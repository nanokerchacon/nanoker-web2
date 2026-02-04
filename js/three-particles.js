import * as THREE from "three";

export function initParticlesBackground({
  mount = document.body,
  count = 12000,
  area = 80,
  height = 22,
  depth = 70,
  baseSize = 0.055,
} = {}) {
  const reduceMotion =
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    300
  );
  camera.position.set(0, 6, 30);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // canvas full-screen dentro del mount
  renderer.domElement.classList.add("particles-canvas");
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.display = "block";
  renderer.domElement.style.pointerEvents = "none";

  mount.appendChild(renderer.domElement);

  const geo = new THREE.BufferGeometry();

  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  const weights = new Float32Array(count);

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    positions[i3] = rand(-area / 2, area / 2);
    positions[i3 + 1] = rand(-height / 2, height / 2);
    positions[i3 + 2] = rand(-depth / 2, depth / 2);

    // drift muy lento (microgravedad)
    velocities[i3] = rand(-0.006, 0.006);
    velocities[i3 + 1] = rand(-0.004, 0.004);
    velocities[i3 + 2] = rand(-0.006, 0.006);

    phases[i] = Math.random() * Math.PI * 2;
    weights[i] = rand(0.6, 1.4);
  }

  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("velocity", new THREE.BufferAttribute(velocities, 3));
  geo.setAttribute("phase", new THREE.BufferAttribute(phases, 1));
  geo.setAttribute("weight", new THREE.BufferAttribute(weights, 1));

  const mat = new THREE.PointsMaterial({
    color: new THREE.Color(0x00ffdc),
    size: baseSize,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geo, mat);
  points.position.y = -2;
  scene.add(points);

  scene.add(new THREE.AmbientLight(0xffffff, 0.2));

  const bounds = { x: area / 2, y: height / 2, z: depth / 2 };

  let raf = 0;
  let t = 0;

  function animate() {
    raf = requestAnimationFrame(animate);

    if (!reduceMotion) {
      t += 0.006;

      points.rotation.y += 0.00035;
      points.rotation.x = Math.sin(t * 0.25) * 0.01;

      const pos = geo.attributes.position.array;
      const vel = geo.attributes.velocity.array;
      const ph = geo.attributes.phase.array;
      const w = geo.attributes.weight.array;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;

        const breathe = Math.sin(t + ph[i]) * 0.0009 * w[i];

        pos[i3] += vel[i3] * w[i];
        pos[i3 + 1] += vel[i3 + 1] * w[i] + breathe;
        pos[i3 + 2] += vel[i3 + 2] * w[i];

        // rebote suave
        if (pos[i3] > bounds.x || pos[i3] < -bounds.x) vel[i3] *= -1;
        if (pos[i3 + 1] > bounds.y || pos[i3 + 1] < -bounds.y) vel[i3 + 1] *= -1;
        if (pos[i3 + 2] > bounds.z || pos[i3 + 2] < -bounds.z) vel[i3 + 2] *= -1;
      }

      geo.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
  }

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  }

  window.addEventListener("resize", onResize);
  animate();

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", onResize);
    geo.dispose();
    mat.dispose();
    renderer.dispose();
    renderer.domElement?.remove();
  };
}
