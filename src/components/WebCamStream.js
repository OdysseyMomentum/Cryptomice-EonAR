import React, { Component } from "react";
import jsQR from "jsqr";
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

class WebCamStream extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isVideoLoading: true
    };

    this.videoTag = React.createRef();
    this.canvas = React.createRef();
    this.divscene = React.createRef();
    this.mount = React.createRef();
    this.tick = this.tick.bind(this);

	this.innerWidth = 800
	this.innerHeight = 600
	
  }
  
  loadVR() {
	  
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true});
renderer.setSize( this.innerWidth, this.innerHeight );
this.mount.appendChild( renderer.domElement );
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 80, this.innerWidth / this.innerHeight, 1, 10000 );
const controls = new OrbitControls( camera, renderer.domElement );
var renderCalls = [];
function render () {
  requestAnimationFrame( render );
  renderCalls.forEach((callback)=>{ callback(); });
}
render();
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( this.innerWidth, this.innerHeight );

renderer.toneMapping = THREE.LinearToneMapping;
renderer.toneMappingExposure = Math.pow( 0.94, 5.0 );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
function renderScene(){ renderer.render( scene, camera ); }
renderCalls.push(renderScene);

//const controls = new OrbitControls( camera, renderer );
controls.rotateSpeed = 1;
controls.zoomSpeed = 0.9;

controls.minDistance = 3;
controls.maxDistance = 20;

controls.minPolarAngle = 0; // radians
controls.maxPolarAngle = 0; // radians

controls.enableDamping = true;
controls.dampingFactor = 0.05;

renderCalls.push(function(){
  controls.update()
});
controls.autoRotate = true;
controls.autoRotateSpeed = 1;

var light = new THREE.PointLight( 0xffffcc, 20, 200 );
light.position.set( 4, 30, -20 );
scene.add( light );

var light2 = new THREE.AmbientLight( 0x20202A, 20, 100 );
light2.position.set( 30, -10, 30 );
scene.add( light2 );

var loader = new GLTFLoader();
loader.crossOrigin = true;
var self=this
this.scene = scene


loader.load( 'http://localhost:3000/OdysseyMomentum/Cryptomice-EonAR/magic_green/scene.gltf', function ( data ) {
	self.magicGreenScene = data.scene;
	self.magicGreenScene.position.set(0, -10, -0.75);
	  //self.showGreen()
});

loader.load( 'http://localhost:3000/OdysseyMomentum/Cryptomice-EonAR/magic_red/scene.gltf', function ( data ) {
	self.magicRedScene = data.scene;
	self.magicRedScene.position.set(0, -10, -0.75);
	self.showRed()
});
}

showRed() {
	this.scene.remove(this.magicGreenScene);
	this.scene.add(this.magicRedScene)
}
showGreen() {
	this.scene.remove(this.magicRedScene);
	this.scene.add(this.magicGreenScene)
}

  componentDidMount() { 
	  this.loadVR()
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then(stream => {
        const video = this.videoTag.current;
        video.srcObject = stream;
        video.setAttribute("playsinline", true);
        video.play();
        requestAnimationFrame(this.tick);
      });
  }

  drawLine(begin, end, color) {
    const canvasElement = this.canvas.current;
    const canvas = canvasElement.getContext("2d");

    canvas.beginPath();
    canvas.moveTo(begin.x, begin.y);
    canvas.lineTo(end.x, end.y);
    canvas.lineWidth = 4;
    canvas.strokeStyle = color;
    canvas.stroke();
  }

  tick() {
    const video = this.videoTag.current;
	
    const checkVideoState = setInterval(() => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        clearInterval(checkVideoState);

        this.setState({ isVideoLoading: false });

          const canvasElement = this.canvas.current;
          const canvas = canvasElement.getContext("2d");

          canvasElement.height = video.videoHeight;
          canvasElement.width = video.videoWidth;
		  
          canvas.drawImage(
            video,
            0,
            0,
            canvasElement.width,
            canvasElement.height
          );
          let imageData = canvas.getImageData(
            0,
            0,
            canvasElement.width,
            canvasElement.height
          );

          var code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code) {
            this.drawLine(
              code.location.topLeftCorner,
              code.location.topRightCorner,
              "#FF3B58"
            );
            this.drawLine(
              code.location.topRightCorner,
              code.location.bottomRightCorner,
              "#FF3B58"
            );
            this.drawLine(
              code.location.bottomRightCorner,
              code.location.bottomLeftCorner,
              "#FF3B58"
            );
            this.drawLine(
              code.location.bottomLeftCorner,
              code.location.topLeftCorner,
              "#FF3B58"
            );
          } 
        requestAnimationFrame(this.tick);
      }
    }, 10);
  }

  render() {
    const { isVideoLoading } = this.state;

    return (
      <div style={{ width: "800px", height: "600px"}}>
        <video
          ref={this.videoTag}
          width="800"
          height="600"
          autoPlay
          style={{ display: "none", "zIndex": -1 }}
        />

        {!isVideoLoading && <canvas ref={this.canvas} />}
		
        <div 
		style={{ width: "800px", height: "600px", position: "fixed", top: "50px" }}
		ref={mount => { this.mount = mount}} />
		
        {isVideoLoading && <p>Please wait while we load the video stream.</p>}
      </div>
    );
  }
}

export default WebCamStream;