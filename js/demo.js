import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

document.addEventListener('DOMContentLoaded', () => {
  // Stress Simulation Logic
  let stressLevel = 30;
  let simulationInterval = null;
  const maxStress = 100;
  const minStress = 0;

  function updateStressDisplay() {
    document.getElementById('stress-progress')?.style.setProperty('width', `${stressLevel}%`);
    document.getElementById('stress-value')!.textContent = `${Math.round(stressLevel)}%`;
    document.getElementById('heart-rate')!.textContent = `${Math.floor(80 + (stressLevel * 0.4))}`;
    document.getElementById('oxygen')!.textContent = `${Math.max(85, 100 - Math.floor(stressLevel * 0.15))}`;
  }

  window.startScenario = () => {
    if (simulationInterval) return;
    simulationInterval = setInterval(() => {
      if (stressLevel < maxStress) {
        stressLevel += Math.random() * 1.5;
        updateStressDisplay();
      }
    }, 2000);
  };

  window.resetScenario = () => {
    clearInterval(simulationInterval);
    simulationInterval = null;
    stressLevel = 30;
    updateStressDisplay();
  };

  window.applyBreathing = () => {
    stressLevel = Math.max(minStress, stressLevel - 20);
    updateStressDisplay();
  };

  window.findSolution = () => {
    stressLevel = Math.max(minStress, stressLevel - 10);
    updateStressDisplay();
  };

  updateStressDisplay();

  // === 3D Scene Setup ===
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);
  camera.position.set(0, 0, 0.001);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  // Sphere Geometry
  const geometry = new THREE.SphereGeometry(500, 32, 16);
  geometry.scale(-1, 1, 1);

  let needsUpdate = true;

  // Load 360° Environment
  const loader = new THREE.TextureLoader();
  loader.load(
    'img/er.png',
    (texture) => {
      const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide, transparent: true });
      scene.add(new THREE.Mesh(geometry, material));
      console.log('360° Environment Loaded');
      needsUpdate = true;
    },
    undefined,
    (err) => {
      console.error('Texture Load Error:', err);
      const fallbackMaterial = new THREE.MeshBasicMaterial({ color: 0x404040, side: THREE.BackSide });
      scene.add(new THREE.Mesh(geometry, fallbackMaterial));
      needsUpdate = true;
    }
  );

  // Orbit Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.rotateSpeed = -0.25;

  // Render Loop
  function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  // Window Resize Handling
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    needsUpdate = true;
  });

  // Cleanup on Exit
  window.addEventListener('beforeunload', () => {
    clearInterval(simulationInterval);
    renderer.dispose();
    controls.dispose();
    geometry.dispose();
  });
});