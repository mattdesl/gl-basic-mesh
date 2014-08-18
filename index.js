var createBuffer = require('gl-buffer')
var createVAO = require('gl-vao')
var createShader = require('gl-basic-shader')

function BasicMesh(gl, options) {
    if (!(this instanceof BasicMesh))
        return new BasicMesh(gl, options)
    
    options = options||{}

    this.gl = gl

    var usage = typeof options.usage === 'number' ? options.usage : gl.STATIC_DRAW
    var attribs = []
        
    //position 
    var positionSize = options.positionSize || 3

    //default positions to empty array
    if (options.positions !== 0 && !options.positions) {
        options.positions = new Float32Array()
    }  

    //positions is expected
    this.positions = createBuffer(gl, options.positions, gl.ARRAY_BUFFER, usage)
    attribs.push({
        buffer: this.positions,
        size: positionSize
    })
    this.drawCount = this.positions.length / 4 / positionSize

    if (options.colors) {
        var colorSize = options.colorSize || 4
        this.colors = createBuffer(gl, options.colors, gl.ARRAY_BUFFER, usage)
        attribs.push({
            buffer: this.colors,
            size: colorSize,
            normalized: true
        })
    }
    if (options.normals) {
        this.normals = createBuffer(gl, options.normals, gl.ARRAY_BUFFER, usage)
        attribs.push({
            buffer: this.normals,
            size: 3,
            normalized: false
        })
    }
    if (options.texcoords) {
        this.texcoords = createBuffer(gl, options.texcoords, gl.ARRAY_BUFFER, usage)
        attribs.push({
            buffer: this.texcoords,
            size: 2,
            normalized: false
        })
    }

    if (options.elements) {
        this.elements = createBuffer(gl, options.elements, gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW)
        this.drawCount = this.elements.length / 2
    }

    this.vao = createVAO(gl, attribs, this.elements)

    var shader = options.shader
    if (!shader) {
        this.defaultShader = createShader(gl, {
            normal: Boolean(options.normals),
            color: Boolean(options.colors),
            texcoord: options.texcoords ? 1 : 0
        })
        shader = this.defaultShader
    }
    this.shader = shader
}

BasicMesh.prototype.bind = function() {
    this.shader.bind()
    this.vao.bind()
}

BasicMesh.prototype.unbind = function() {
    this.vao.unbind()
}

BasicMesh.prototype.draw = function(mode, count, offset) {
    //for convenience, try to render all vertices or elements 
    //if the user hasn't specified a number
    count = typeof count === 'number' ? count : this.drawCount
    this.vao.draw(typeof mode === 'number' ? mode : this.gl.TRIANGLES, count, offset || 0)
}

BasicMesh.prototype.dispose = function() {
    if (this.defaultShader) {
        this.defaultShader.dispose()
        this.defaultShader = null
    }
    this.vao.dispose()
    this.positions.dispose()
    if (this.texcoords) this.texcoords.dispose()
    if (this.colors) this.colors.dispose()
    if (this.normals) this.normals.dispose()
    this.gl = null
}

module.exports = BasicMesh