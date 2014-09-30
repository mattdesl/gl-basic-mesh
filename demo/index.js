var mat4 = require('gl-matrix').mat4
var createMesh = require('../')
var bunny = require("bunny");

function concat(a, b) {
    return a.concat(b)
}

var gl = require('canvas-testbed')(render, start, {
    context: 'webgl',
    width: 400,
    height: 400
})

var mesh,
    view,
    projection,
    vertCount

function createBunny(gl) {
    //flatten the arrays
    var positions = bunny.positions.reduce(concat);
    var cells = bunny.cells.reduce(concat);

    return createMesh(gl, {
        positions: new Float32Array(positions),
        cells: new Uint16Array(cells)
    })
}

function start(gl, width, height) {
    //create our mesh
    mesh = createBunny(gl)

    //setup our perspective projection
    projection = mat4.create()
    mat4.perspective(projection, 50, 1, 1, 1000)

    //and a view matrix
    view = mat4.create()
    mat4.translate(view, view, [0, 5, -50])
    mat4.scale(view, view, [1, -1, 1])
}

function render(gl, width, height, dt) {
    gl.clearColor(0,0,0,1)
    gl.clear(gl.COLOR_BUFFER_BIT)

    mesh.bind()

    //rotate our view transform
    mat4.rotateY(view, view, dt/1000)
    mesh.shader.uniforms.view = view
    mesh.shader.uniforms.projection = projection

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    //we can apply a global color tint here..
    mesh.shader.uniforms.tint = [0.5, 0.5, 0.5, 0.5]
    mesh.draw(gl.POINTS)

    //draw a few triangles on top
    mesh.shader.uniforms.tint = [0.6, 0.5, 0.8, 0.9]
    mesh.draw(gl.TRIANGLES, 2048)

    mesh.unbind()
}