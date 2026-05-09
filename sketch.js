import * as THREE from 'three';
import { ARButton } from 'three/addons/webxr/ARButton.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

		let camera, scene, renderer;
		let controller;

		const modelInstances = [];// Declare an array to store instances of the 3D model
		
		init();
		animate();

		// Initialize the scene
		function init() {

			const container = document.createElement('div');
			document.body.appendChild(container);

			scene = new THREE.Scene();

			camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

			// Create a new HemisphereLight to provide ambient lighting to the scene
			const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
			light.position.set(0.5, 1, 0.25);
			scene.add(light);

			// Create a new DirectionalLight to provide directional lighting to the scene
			const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
			directionalLight.position.set(0, 1, 0);
			scene.add(directionalLight);


			// Create a new WebGLRenderer with antialiasing and alpha support
			renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
			renderer.setPixelRatio(window.devicePixelRatio);
			renderer.setSize(window.innerWidth, window.innerHeight);
			renderer.xr.enabled = true;
			container.appendChild(renderer.domElement);


			// Add ARButton to the document body
			document.body.appendChild(ARButton.createButton(renderer));

			// Load the 3D model using the GLTFLoader
			const loader = new GLTFLoader();
			loader.load( 'assets/ro.glb', function(gltf) {
				const model = gltf.scene;
				modelInstances.push(model);
			
			});

			// Create a new controller and add it to the scene
			controller = renderer.xr.getController(0);
			controller.addEventListener('select', onSelect);
			scene.add(controller);

			// Add an event listener for window resize
			window.addEventListener('resize', onWindowResize);
			
			// Handle the controller select event
			function onSelect() {
				const modelInstance = modelInstances[modelInstances.length - 1].clone();
				modelInstance.scale.set(0.3, 0.3, 0.3);
				modelInstance.position.set(0, 0, -1).applyMatrix4(controller.matrixWorld);
				modelInstance.quaternion.setFromRotationMatrix(controller.matrixWorld);
				scene.add(modelInstance);
				modelInstances.push(modelInstance);
			}

			

		}

		//resizes the browser window
		function onWindowResize() {

			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();

			renderer.setSize(window.innerWidth, window.innerHeight);

		}

		//Create animation loop command
		function animate() {
			renderer.setAnimationLoop(render);

		}

		function render() {

			renderer.render(scene, camera);

		}