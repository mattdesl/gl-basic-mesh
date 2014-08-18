var createMesh = require('../')

var createBackground = require('gl-vignette-background')
var TestFont = require('fontpath-test-fonts/lib/OpenSans-Regular.ttf');    
var OrthographicCamera = require('cam3d').OrthographicCamera
var Matrix4 = require('vecmath').Matrix4

require('canvas-testbed')(render, start, {
    context: 'webgl',
})

// var createFBO = require('gl-fbo')

var TextRenderer = require('./fontpath-gl')

var cam = new OrthographicCamera(),
    background,
    renderer

function render(gl, width, height) {
    cam.setToOrtho(true, width, height)

    gl.disable(gl.CULL_FACE)
    gl.viewport(0, 0, width, height)

    gl.clearColor(1,1,1,1)
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

    var radius = Math.max(height, width) * 1.05

    //style background
    background.style({
        scale: [ 1/width * radius, 1/height * radius],
        aspect: 1,
        color1: [1, 1, 1],
        color2: [40/255, 56/255, 68/255], //rgb expressed in 0.0 - 1.0
        smoothing: [ -0.5, 1.0 ],
        noiseAlpha: 0.07,
    })
    background.draw()

    var pad = 20
    renderer.layout(window.innerWidth-pad*2); 
    renderer.projection = cam.combined.val

    var b = renderer.getBounds()
    var x = width/2 - b.width/2,
        y = height/2 - b.height/2 - b.y

    // renderer.color = [0.15, 0.15, 0.15, 0.4]
    // renderer.draw(gl.TRIANGLES, x, y)

    renderer.color = [0.15, 0.15, 0.15, 0.5]
    renderer.draw(gl.LINES, x, y)
} 

function start(gl) {
    background = createBackground(gl)

    renderer = TextRenderer(gl)

    //setup the text renderer
    renderer.text = 'can you dig it?'.toUpperCase()
    renderer.font = TestFont;
    renderer.fontSize = 150;
    renderer.align = 'center';
}