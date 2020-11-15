import React, { Component } from 'react'
import { Link, Redirect } from 'react-router-dom'
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
    this.state = { isVideoLoading: false, marginLeft: 0, marginTop: 0 }
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
    controls.autoRotateSpeed = 20
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

    loader.load(process.env.PUBLIC_URL + '/magic_green/scene.gltf', function (data) {
      self.magicGreenScene = data.scene
      self.magicGreenScene.position.set(0, -10, -0.75)
	  // self.showGreen()
    })

    loader.load(process.env.PUBLIC_URL + '/magic_red/scene.gltf', function (data) {
      self.magicRedScene = data.scene
      self.magicRedScene.position.set(0, -10, -0.75)
      // self.showRed()
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

  showRedMarker () {
    if (!this.isVisibleRed) {
      this.scene.remove(this.magicGreenScene)
      this.scene.add(this.magicRedScene)
      this.isVisibleRed = true
      this.isVisibleGreen = false
    }
  }

  showGreenMarker () {
	  if (!this.isVisibleGreen) {
      this.scene.remove(this.magicRedScene)
      this.scene.add(this.magicGreenScene)
      this.isVisibleGreen = true
      this.isVisibleRed = false
    }
  }

  hideMarkers () {
    if (this.isVisibleGreen) {
      this.isVisibleGreen = false
      this.scene.remove(this.magicGreenScene)
    }
    if (this.magicRedScene) {
      this.isVisibleRed = false
      this.scene.remove(this.magicRedScene)
    }
  }

  move (x, y, lenght) {
    const xpos = x - this.innerWidth / 2 + lenght / 2
    const ypos = y - this.innerHeight / 2 + lenght / 2
    this.setState({ isVideoLoading: false, marginLeft: xpos, marginTop: ypos })
 	// $('#sceneElement').css( 'margin-left', xpos).css( 'margin-top', ypos)
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

  tick () {
    const video = this.videoTag.current
    const self = this

    const checkVideoState = setInterval(() => {
      if (!video) return
      else if (video.readyState === video.HAVE_ENOUGH_DATA) {
        clearInterval(checkVideoState)
        if (!this.canvas.current) { return }
        this.setState({ isVideoLoading: false, marginLeft: this.state.marginLeft, marginTop: this.state.marginTop })

        const imageData = getImageData(this.canvas.current, video)
        var code = jsQR(imageData.data, imageData.width, imageData.height)
        if (code && code.data.startsWith('https://eonar.cryptomice.eu/?')) {
          self.centerMarker(code)
		  var serial = code.data.split('?')[1].split('=')[1]
		  self.state.scanned = serial
		  self.setState(self.state)
		  self.fetchSerial(serial)
        } else if (!self.state.isNetworkLoading) {
          self.hideMarkers()
		  self.state.scanned = ''
		  self.setState(self.state)
        }
        requestAnimationFrame(this.tick)
      }
    }, 10)
  }

  centerMarker (code) {
    var xcenter = (code.location.bottomRightCorner.x - code.location.bottomLeftCorner.x) / 2 + code.location.topLeftCorner.x
    var ycenter = (code.location.bottomRightCorner.y - code.location.topLeftCorner.y) / 2 + code.location.topLeftCorner.y
    var lenght = code.location.bottomRightCorner.x - code.location.bottomLeftCorner.x
		  self.move(xcenter, ycenter, lenght)
	  }

  getImageData (canvasElement, video) {
	  const canvas = canvasElement.getContext('2d')
    canvasElement.height = video.videoHeight
    canvasElement.width = video.videoWidth
    canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height)
    return canvas.getImageData(0, 0, canvasElement.width, canvasElement.height)
  }

  fetchSerial (code) {
	  if (this.state.isNetworkLoading) return
      this.state.isNetworkLoading = true
      fetch('https://eonml.cryptomice.eu/model/test4/predict?data=1,0,1,0.2,0')
				  .then(res => res.json())
				  .then(
          (result) => {
					  const risk = parseFloat(result['results'][0])
					  if (risk) { self.showRedMarker() } else { self.showGreenMarker() }
					  setTimeout(function () {
						  self.state.isNetworkLoading = false
						   self.setState(self.state)
            }, 5000)
          },
          (error) => {
					  self.state.isNetworkLoading = false
					  self.state.scanned = ''
					  self.setState(self.state)
          }
				  )
    }
  }
  forward (e) {
    e.preventDefault()
    console.log('The link was clicked.')
    if (this.state.scanned !== '') {
      this.state.goDetails = true
      this.setState(this.state)
    }
	  }

  render () {
    const { isVideoLoading, isNetworkLoading, marginTop, marginLeft, goDetails, scanned } = this.state
	 if (this.state.goDetails) { return <Redirect to={`/detail/${this.state.scanned}`} /> }
    function handleClick (e) { this.forward(e) }

    return (
      <div>
        <h2>Scan Qr code</h2>
        <div style={{ width: '800px', height: '550px' }} onClick={handleClick}>
          <video
            ref={this.videoTag}
            width='800'
            height='600'
            autoPlay
            style={{ display: 'none', zIndex: -1 }}
          />

          {!isVideoLoading && <canvas ref={this.canvas} />}
          <div style={{ width: '800px', height: '600px', position: 'fixed', top: '0px', marginTop: marginTop, marginLeft: marginLeft }}
            ref={mount => { this.mount = mount }} />
          {isVideoLoading && <p>Please wait while we load the video stream.</p>}
        </div>

        <img src={process.env.PUBLIC_URL + '/gs1-resolver.jpg'} height='150px' />
        {isNetworkLoading && (<Link to={`/detail/${this.state.scanned}`}>
          <button variant='outlined' style={{ position: 'absolute', right: '20px', top: '10px' }}>
				SERIAL information
          </button>
        </Link>)}
      </div>
    )
  }
}

export default WebCamStream
