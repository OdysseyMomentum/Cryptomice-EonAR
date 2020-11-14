import React, { Component } from "react";
import jsQR from "jsqr";
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

class WebCamStream extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isVideoLoading: true
    };

    this.videoTag = React.createRef();
    this.canvas = React.createRef();
    this.tick = this.tick.bind(this);
  }
  
  loadVR() {
	const renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
	const controls = new OrbitControls( camera, renderer.domElement );	  
}

  componentDidMount() {
    // getting access to webcam
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
    }, 1000);
  }

  render() {
	this.loadVR();
    const { isVideoLoading } = this.state;

    return (
      <div>
        <video
          ref={this.videoTag}
          width="400"
          height="400"
          autoPlay
          style={{ display: "none" }}
        />

        {!isVideoLoading && <canvas ref={this.canvas} />}

        {isVideoLoading && <p>Please wait while we load the video stream.</p>}
      </div>
    );
  }
}

export default WebCamStream;