import * as THREE from 'three';
import { ARButton } from 'three/addons/webxr/ARButton.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let camera, scene, renderer;
let controller;

const modelInstances = [];

init();
animate();

function init() {

	const container = document.createElement('div');
	document.body.appendChild(container);

	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(
		70,
		window.innerWidth / window.innerHeight,
		0.01,
		20
	);

	// Light
	const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
	light.position.set(0.5, 1, 0.25);
	scene.add(light);

	const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
	directionalLight.position.set(0, 1, 0);
	scene.add(directionalLight);

	// Renderer（关键：截图支持）
	renderer = new THREE.WebGLRenderer({
		antialias: true,
		alpha: true,
		preserveDrawingBuffer: true // ✅ 允许截图
	});

	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.xr.enabled = true;

	container.appendChild(renderer.domElement);

	// AR Button
	document.body.appendChild(ARButton.createButton(renderer));

	// ===== 保存按钮（新增）=====
	const saveBtn = document.createElement('button');
	saveBtn.innerHTML = '📷 保存照片';

	saveBtn.style.position = 'absolute';
	saveBtn.style.bottom = '20px';
	saveBtn.style.left = '20px';
	saveBtn.style.zIndex = '999';
	saveBtn.style.padding = '12px 18px';
	saveBtn.style.fontSize = '14px';

	document.body.appendChild(saveBtn);

	saveBtn.addEventListener('click', saveScreenshot);

	// Load Model
	const loader = new GLTFLoader();

	loader.load('assets/ro.glb', function (gltf) {

		const model = gltf.scene;

		modelInstances.push(model);

	});

	// Controller
	controller = renderer.xr.getController(0);
	controller.addEventListener('select', onSelect);
	scene.add(controller);

	window.addEventListener('resize', onWindowResize);
}

// ===== 放置模型 =====
function onSelect() {

	const modelInstance = modelInstances[modelInstances.length - 1].clone();

	modelInstance.scale.set(0.3, 0.3, 0.3);

	modelInstance.position
		.set(0, 0, -1)
		.applyMatrix4(controller.matrixWorld);

	modelInstance.quaternion.setFromRotationMatrix(controller.matrixWorld);

	// 顺时针旋转90度（你的需求）
	modelInstance.rotateY(-Math.PI / 2);

	scene.add(modelInstance);

	modelInstances.push(modelInstance);
}

// ===== 截图功能（新增）=====
function saveScreenshot() {

	// iPad XRViewer 提示（更稳定）
	if (/iPad|iPhone|Macintosh/.test(navigator.userAgent)) {

		alert('请使用 iPad 系统截图：电源键 + 音量+');

		return;
	}

	// Web fallback（只能截3D canvas）
	const a = document.createElement('a');
	a.download = 'AR_Snapshot.png';
	a.href = renderer.domElement.toDataURL('image/png');
	a.click();
}

// Resize
function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animate
function animate() {
	renderer.setAnimationLoop(render);
}

function render() {
	renderer.render(scene, camera);
}