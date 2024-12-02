import * as THREE from 'three';
import { GUI } from 'dat.gui';
import { OrbitControls } from 'three-stdlib';

// Scene, camera, and renderer setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Orbit Controls to allow camera movement
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Smooth camera movement
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false; // Prevent camera panning when moving

// Texture loader for particles
const textureLoader = new THREE.TextureLoader();
const particleTexture = textureLoader.load('/textures/particle.png');

// Parameters for fireworks
const params = {
    insideColor: '#ff0000',
    outsideColor: '#ffff00',
    particleSize: 0.2,
    fireworkSpeed: 2,
    particleCount: 500,
    randomness: 5,
    fireworkDesign: 'explosion', // Can be 'explosion' or 'spiral'
    fadeOutSpeed: 2,  // Speed at which particles fade out
};

// Vibrant Colors Array for Randomization
const vibrantColors = ['#ff0044', '#ffbb00', '#00ff44', '#00bbff', '#ff00ff', '#ffff00', '#ff5733'];

// Particle material
function createParticleMaterial() {
    return new THREE.PointsMaterial({
        size: params.particleSize,
        map: particleTexture,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
        vertexColors: true,
    });
}

// Function to update the colors of the particles when parameters change
function updateFireworkColors(firework, insideColor, outsideColor) {
    const colors = firework.geometry.attributes.color.array;
    for (let i = 0; i < colors.length; i += 3) {
        const color = new THREE.Color(insideColor).lerp(new THREE.Color(outsideColor), Math.random());
        colors[i] = color.r;
        colors[i + 1] = color.g;
        colors[i + 2] = color.b;
    }
    firework.geometry.attributes.color.needsUpdate = true;
}

// Function to create a firework with explosion design
function createExplosionFirework(position) {
    const fireworkGeometry = new THREE.BufferGeometry();
    const count = params.particleCount;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const lifetimes = new Float32Array(count); // Store the lifespan of each particle

    for (let i = 0; i < count; i++) {
        const randomRadius = Math.random() * params.randomness;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() - 0.5) * 2);
        const x = randomRadius * Math.sin(phi) * Math.cos(theta);
        const y = randomRadius * Math.sin(phi) * Math.sin(theta);
        const z = randomRadius * Math.cos(phi);

        positions[i * 3] = position.x + x;
        positions[i * 3 + 1] = position.y + y;
        positions[i * 3 + 2] = position.z + z;

        velocities[i * 3] = x * params.fireworkSpeed * 0.05;
        velocities[i * 3 + 1] = y * params.fireworkSpeed * 0.05;
        velocities[i * 3 + 2] = z * params.fireworkSpeed * 0.05;

        // Randomly select a color from the vibrant colors array
        const color = new THREE.Color(vibrantColors[Math.floor(Math.random() * vibrantColors.length)]);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;

        // Assign a random lifetime to each particle
        lifetimes[i] = Math.random() * 3; // Random lifespan between 0 and 3 seconds
    }

    fireworkGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    fireworkGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    fireworkGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    fireworkGeometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));

    const points = new THREE.Points(fireworkGeometry, createParticleMaterial());
    scene.add(points);

    // Update colors dynamically based on the current color parameters
    updateFireworkColors(points, params.insideColor, params.outsideColor);

    return points;
}

// Function to create a spiral design firework
function createSpiralFirework(position) {
    const fireworkGeometry = new THREE.BufferGeometry();
    const count = params.particleCount;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const lifetimes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * params.randomness;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        const z = Math.random() * 5;

        positions[i * 3] = position.x + x;
        positions[i * 3 + 1] = position.y + y;
        positions[i * 3 + 2] = position.z + z;

        velocities[i * 3] = (Math.cos(angle) + Math.random() * 0.5) * params.fireworkSpeed * 0.1;
        velocities[i * 3 + 1] = (Math.sin(angle) + Math.random() * 0.5) * params.fireworkSpeed * 0.1;
        velocities[i * 3 + 2] = Math.random() * 0.5;

        // Randomly select a color from the vibrant colors array
        const color = new THREE.Color(vibrantColors[Math.floor(Math.random() * vibrantColors.length)]);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;

        // Assign a random lifetime to each particle
        lifetimes[i] = Math.random() * 3; // Random lifespan between 0 and 3 seconds
    }

    fireworkGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    fireworkGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    fireworkGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    fireworkGeometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));

    const points = new THREE.Points(fireworkGeometry, createParticleMaterial());
    scene.add(points);

    // Update colors dynamically based on the current color parameters
    updateFireworkColors(points, params.insideColor, params.outsideColor);

    return points;
}

// Create fireworks based on the selected design
function createFirework(position) {
    if (params.fireworkDesign === 'spiral') {
        return createSpiralFirework(position);
    } else {
        return createExplosionFirework(position);
    }
}

// Firework spawn loop
const fireworks = [];
const MAX_FIREWORKS = 20;
const FIREWORK_INTERVAL = 800;

function spawnFirework() {
    const x = (Math.random() - 0.5) * 30;
    const y = (Math.random() - 0.5) * 15 + 10;
    const z = (Math.random() - 0.5) * 30;

    const firework = createFirework(new THREE.Vector3(x, y, z));
    fireworks.push(firework);

    setTimeout(() => {
        scene.remove(firework);
        fireworks.splice(fireworks.indexOf(firework), 1);
    }, 3000);
}

// Start spawning fireworks in a loop
setInterval(() => {
    if (fireworks.length < MAX_FIREWORKS) {
        spawnFirework();
    }
}, FIREWORK_INTERVAL);

// Animation loop
const clock = new THREE.Clock();
function animate() {
    const delta = clock.getDelta();

    fireworks.forEach((firework) => {
        const positions = firework.geometry.attributes.position;
        const velocities = firework.geometry.attributes.velocity;
        const lifetimes = firework.geometry.attributes.lifetime.array;

        for (let i = 0; i < positions.count; i++) {
            const x = i * 3;
            const y = i * 3 + 1;
            const z = i * 3 + 2;

            // Apply velocity update
            positions.array[x] += velocities.array[x] * delta;
            positions.array[y] += velocities.array[y] * delta;
            positions.array[z] += velocities.array[z] * delta;

            // Apply gravity and damping to velocity
            velocities.array[y] -= delta * 0.1; // Gravity
            velocities.array[x] *= 0.99; // Damping effect
            velocities.array[z] *= 0.99; // Damping effect

            // Decrease the lifetime of each particle
            lifetimes[i] -= delta;

            // Fade out the particles based on lifetime
            if (lifetimes[i] <= 0) {
                positions.array[x] = positions.array[y] = positions.array[z] = -100; // Move off-screen
            }
        }

        positions.needsUpdate = true;
    });

    controls.update(); // Update camera controls
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

// GUI for controlling fireworks
const gui = new GUI();
gui.addColor(params, 'insideColor').name('Inside Color').onChange(() => {
    fireworks.forEach((firework) => updateFireworkColors(firework, params.insideColor, params.outsideColor));
});
gui.addColor(params, 'outsideColor').name('Outside Color').onChange(() => {
    fireworks.forEach((firework) => updateFireworkColors(firework, params.insideColor, params.outsideColor));
});
gui.add(params, 'particleSize', 0.1, 1, 0.01).name('Particle Size');
gui.add(params, 'fireworkSpeed', 0.5, 5, 0.1).name('Speed');
gui.add(params, 'particleCount', 100, 1000, 50).name('Count');
gui.add(params, 'randomness', 1, 10, 0.1).name('Randomness');
gui.add(params, 'fireworkDesign', ['explosion', 'spiral']).name('Firework Design');

// Handle window resizing
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// Start animation
animate();