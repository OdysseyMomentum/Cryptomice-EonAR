import React, { Component } from 'react'
import jsQR from 'jsqr'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

class WebCamStream extends Component {
  constructor (props) {
    super(props)

    this.state = {
      isVideoLoading: true
    }

    this.videoTag = React.createRef()
    this.canvas = React.createRef()
    this.divscene = React.createRef()
    this.mount = React.createRef()
    this.tick = this.tick.bind(this)

    this.innerWidth = 800
    this.innerHeight = 600
  }

  setControls (controls) {
    controls.rotateSpeed = 1
    controls.zoomSpeed = 0.9

    controls.minDistance = 3
    controls.maxDistance = 20

    controls.minPolarAngle = 0 // radians
    controls.maxPolarAngle = 0 // radians

    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.autoRotate = true
    controls.autoRotateSpeed = 1
  }

  setRenderer (renderer) {
    renderer.setSize(this.innerWidth, this.innerHeight)
	 renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(this.innerWidth, this.innerHeight)
    renderer.toneMapping = THREE.LinearToneMapping
    renderer.toneMappingExposure = Math.pow(0.94, 5.0)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
  }

  loadGLTF () {
    var loader = new GLTFLoader()
    loader.crossOrigin = true
    var self = this

    loader.load('http://localhost:3000/OdysseyMomentum/Cryptomice-EonAR/magic_green/scene.gltf', function (data) {
      self.magicGreenScene = data.scene
      self.magicGreenScene.position.set(0, -10, -0.75)
	  // self.showGreen()
    })

    loader.load('http://localhost:3000/OdysseyMomentum/Cryptomice-EonAR/magic_red/scene.gltf', function (data) {
      self.magicRedScene = data.scene
      self.magicRedScene.position.set(0, -10, -0.75)
      self.showRed()
    })
  }

  loadVR () {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(80, this.innerWidth / this.innerHeight, 1, 10000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.setRenderer(renderer)
    this.scene = scene

    const controls = new OrbitControls(camera, renderer.domElement)
    this.setControls(controls)

    this.mount.appendChild(renderer.domElement)

    var renderCalls = []
    function render () {
      requestAnimationFrame(render)
      renderCalls.forEach((callback) => { callback() })
    }
    render()

    function renderScene () {
      renderer.render(scene, camera)
    }
    renderCalls.push(renderScene)
    renderCalls.push(function () {
      controls.update()
    })

    var light = new THREE.PointLight(0xffffcc, 20, 200)
    light.position.set(4, 30, -20)
    scene.add(light)

    this.loadGLTF()
  }

  showRed () {
    this.scene.remove(this.magicGreenScene)
    this.scene.add(this.magicRedScene)
  }

  showGreen () {
    this.scene.remove(this.magicRedScene)
    this.scene.add(this.magicGreenScene)
  }

  componentDidMount () {
    this.loadVR()
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        const video = this.videoTag.current
        video.srcObject = stream
        video.setAttribute('playsinline', true)
        video.play()
        requestAnimationFrame(this.tick)
      })
  }

  drawLine (begin, end, color) {
    const canvasElement = this.canvas.current
    const canvas = canvasElement.getContext('2d')
    canvas.beginPath()
    canvas.moveTo(begin.x, begin.y)
    canvas.lineTo(end.x, end.y)
    canvas.lineWidth = 4
    canvas.strokeStyle = color
    canvas.stroke()
  }

  tick () {
    const video = this.videoTag.current

    const checkVideoState = setInterval(() => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        clearInterval(checkVideoState)

        this.setState({ isVideoLoading: false })

        const canvasElement = this.canvas.current
        const canvas = canvasElement.getContext('2d')
        canvasElement.height = video.videoHeight
        canvasElement.width = video.videoWidth
        canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height)
        const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height)
        var code = jsQR(imageData.data, imageData.width, imageData.height)

        /* if (code) {
          this.drawLine(
            code.location.topLeftCorner,
            code.location.topRightCorner,
            '#FF3B58'
          )
          this.drawLine(
            code.location.topRightCorner,
            code.location.bottomRightCorner,
            '#FF3B58'
          )
          this.drawLine(
            code.location.bottomRightCorner,
            code.location.bottomLeftCorner,
            '#FF3B58'
          )
          this.drawLine(
            code.location.bottomLeftCorner,
            code.location.topLeftCorner,
            '#FF3B58'
          )
        } */
        fetch('http://ec2-18-202-26-252.eu-west-1.compute.amazonaws.com:5005/model/test4/predict?data=1,0,1,0.2,0')
          .then(res => res.json())
          .then(
            (result) => {
              console.log(result)
              this.setState({
                isLoaded: true,
                items: result.items
              })
            },
            // Note: it's important to handle errors here
            // instead of a catch() block so that we don't swallow
            // exceptions from actual bugs in components.
            (error) => {
              console.log(error)
              this.setState({
                isLoaded: true,
                error
              })
            }
          )
        requestAnimationFrame(this.tick)
      }
    }, 10)
  }

  render () {
    const { isVideoLoading } = this.state

    return (
      <div style={{ width: '800px', height: '600px' }}>
        <video
          ref={this.videoTag}
          width='800'
          height='600'
          autoPlay
          style={{ display: 'none', zIndex: -1 }}
        />

        {!isVideoLoading && <canvas ref={this.canvas} />}

        <div
          style={{ width: '800px', height: '600px', position: 'fixed', top: '50px' }}
          ref={mount => { this.mount = mount }} />

        {isVideoLoading && <p>Please wait while we load the video stream.</p>}
      </div>
    )
  }
}

export default WebCamStream
