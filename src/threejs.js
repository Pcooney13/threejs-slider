import * as THREE from "three";
import { InteractionManager } from "three.interactive";
import fragment from "./shaders/fragment.glsl";
import vertex from "./shaders/vertex.glsl";

// HIDING
import GUI from "lil-gui";
const gui = new GUI();

export default class Sketch {
  constructor(options) {
    this.clicked = false;
    // Scene
    this.scene = new THREE.Scene();
    // Get Container Dimensions - set in ./script.js
    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0xe15136, 0);
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    // Raycaster
    this.raycaster = new THREE.Raycaster();
    this.clickRaycaster = new THREE.Raycaster();
    // Mouse Positions
    this.mouse = {
      x: undefined,
      y: undefined,
    };
    this.clicked
    // Add Scene to page
    this.container.appendChild(this.renderer.domElement);
    // Camera
    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );
    this.camera.position.set(-0.625, 0, 1.6);
    // Time
    this.time = 0;
    // Click Manager
    this.interactionManager = new InteractionManager(
      this.renderer,
      this.camera,
      this.renderer.domElement
    );

    console.log(this.interactionManager)

    this.handlerShaderMaterials();
    this.render();
    this.materials = [];
    this.meshes = [];
    this.groups = [];
    this.handleImages();
    window.addEventListener("mousemove", this.onMouseMove, false);
    this.addGUI();
    // // Add Clicked Event
    // // https:stackoverflow.com/questions/7984471/how-to-get-clicked-element-in-three-js
    window.addEventListener("click", this.mouseDown, false);
    // window.addEventListener("mouseup", this.mouseUp, false);
  }

  addGUI() {
    gui
      .add(this.camera.position, "x")
      .min(-2)
      .max(2)
      .step(0.001)
      .name("camera x");
    gui
      .add(this.camera.position, "y")
      .min(-2)
      .max(2)
      .step(0.001)
      .name("camera y");
    gui
      .add(this.camera.position, "z")
      .min(-2)
      .max(2)
      .step(0.001)
      .name("camera z");
      gui.add(this.camera.rotation, 'x').min(-2).max(2).step(.001).name('camera x')
      gui.add(this.camera.rotation, 'y').min(-2).max(2).step(.001).name('camera y')
      gui.add(this.camera.rotation, 'z').min(-2).max(2).step(.001).name('camera z')
    gui
      .add(this.groups[0].rotation, "x")
      .min(-2)
      .max(2)
      .step(0.001)
      .name("mesh 1 x");
    gui
      .add(this.groups[0].rotation, "y")
      .min(-2)
      .max(2)
      .step(0.001)
      .name("mesh 1 y");
    gui
      .add(this.groups[0].rotation, "z")
      .min(-2)
      .max(2)
      .step(0.001)
      .name("mesh 1 z");
  }

    mouseDown = (event) => {
        if (this.clicked === true) {
            this.clicked = false;
        } else {
            this.clicked = true;
        }
    };
    // mouseUp = (event) => {
    //     this.clicked = false;
    // };

  onMouseMove = (event) => {
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  };
  
  handlerShaderMaterials() {
    this.material = new THREE.ShaderMaterial({
      // Pass variables to frag & vertex shaders
      uniforms: {
        time: { type: "f", value: 0 },
        bend: { type: "f", value: 0.05 },
        opacity: { type: "f", value: 1.0 },
        distanceFromCenter: { type: "f", value: null },
        texture1: { type: "t", value: null },
        resolution: { type: "v4", value: new THREE.Vector4() },
        uvRate1: {
          value: new THREE.Vector2(1, 1),
        },
      },
      // Shaders
      vertexShader: vertex,
      fragmentShader: fragment,
      // Add opacity
      transparent: true,
    });
  }

  handleImages() {
    // Adds the images in the slider - pulls from <img> will cause confusion
    // need to load images in js
    let images = [...document.querySelectorAll("img")];
    images.forEach((image, i) => {
        // create a clone of above shaderMaterial
        let loopMaterial = this.material.clone();
        // add to materials array
        this.materials.push(loopMaterial);
        // create new Group
        let loopGroup = new THREE.Group();
        // push image as shader texture
        loopMaterial.uniforms.texture1.value = new THREE.Texture(image);
        // shader needs to be told to update
        loopMaterial.uniforms.texture1.value.needsUpdate = true;
        // Create geometry
        let loopGeometry = new THREE.PlaneBufferGeometry(1.35, 1, 20, 20);
        // Create mesh
        let loopMesh = new THREE.Mesh(loopGeometry, loopMaterial);
        // Add Mesh to Group
        loopGroup.add(loopMesh);
        // push created group to global group array - used in ./script.js
        this.groups.push(loopGroup);
        //add click event
        this.interactionManager.add(loopMesh);
        loopMesh.addEventListener("click", (event) => {
            alert("gun");
        });
        // add group to scene
        this.scene.add(loopGroup);
        // push created mesh to global mesh array - used in ./script.js
        this.meshes.push(loopMesh);
        // move the mesh up
        loopMesh.position.y = i * 1.2;
        // rotate group of image
        loopGroup.rotation.set(-0.3, -0.3, -0.3);
    });
  }

  render() {
    this.time += 0.05;
    this.interactionManager.update();
    this.groups &&
      this.groups.forEach((m) => {
        m.children[0].material.uniforms.opacity.value = 1.0;
        // m.children[0].material.transparent = true;
      });

    // if (this.clicked === true) {
    //     this.clickRaycaster.setFromCamera(this.mouse, this.camera);
    //     // calculate objects intersecting the picking ray
    //     const intersects = this.clickRaycaster.intersectObjects(
    //       this.scene.children
    //     );

    //     for (let i = 0; i < intersects.length; i++) {
    //       intersects[i].object.material.uniforms.distanceFromCenter.value = 2;
    //     }
    // }
    if (this.clicked === true) {

        this.raycaster.setFromCamera(this.mouse, this.camera);
        // calculate objects intersecting the picking ray
        const intersects = this.raycaster.intersectObjects(this.scene.children);
        
        for (let i = 0; i < intersects.length; i++) {
            console.log(intersects[i].object);
            intersects[i].object.material.uniforms.opacity.value = 0.9;
            intersects[i].object.material.uniforms.bend.value = 0.0;
            this.groups[i].rotation.x = 0.0;
            this.groups[i].rotation.y = 0.0;
            this.groups[i].rotation.z = 0.0;
            this.camera.position.x = 0;
        }
    }

    // slides
    if (this.materials) {
      this.materials.forEach((m) => {
        m.uniforms.time.value = this.time;
      });
    }
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}