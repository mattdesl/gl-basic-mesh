var TextRenderer = require('fontpath-renderer'); //require the fontpath-renderer base

var decompose = require('fontpath-shape2d');
var triangulate = require('shape2d-triangulate');
var toGlyphMatrix3 = require('fontpath-vecmath').toGlyphMatrix3;

var createShader = require('gl-basic-shader')

var Vector3 = require('vecmath').Vector3;
var Matrix4 = require('vecmath').Matrix4;
var tmpMat = new Matrix4();
var tmpVec = new Vector3()

var createMesh = require('../')


function randomSteinerPoints(glyph, N) {
    var steinerPoints = [];
    N = typeof N === "number" ? N : 500;
    for (var count=0; count<N; count++) {
        var dat = { 
            x: Math.round(Math.random()*(glyph.width+glyph.hbx)), 
            y: -glyph.hby + Math.round(Math.random()*(glyph.height+glyph.hby)) 
        };
        steinerPoints.push(dat);
    }
    return steinerPoints;
}

function TriangleRenderer(gl, font, options) {
    if (!(this instanceof TriangleRenderer))
        return new TriangleRenderer(gl, font, options)
    options = options||{}

    if (!gl)
        throw 'must specify gl parameter'
    this.gl = gl
    
    this.projection = new Matrix4().val
    this.view = new Matrix4().val

    options.fontSize = typeof options.fontSize === 'number' ? options.fontSize : 32
    this.simplifyAmount = typeof options.simplifyAmount === 'number' ? options.simplify : 0.00

    this.color = [1, 1, 1, 1]
    this.shader = options.shader || createShader(gl)
    

    TextRenderer.call(this, font, options.fontSize)
    this.meshCache = {}
}

//inherits from TextRenderer
TriangleRenderer.prototype = Object.create(TextRenderer.prototype);
TriangleRenderer.constructor = TriangleRenderer;

//copy statics
TriangleRenderer.Align = TextRenderer.Align;

//Triangulates a glyph and returns a list of triangle positions
TriangleRenderer.prototype._triangulate = function(glyph) {
    var shapes = decompose(glyph)

    for (var i=0; i<shapes.length; i++) 
        shapes[i].simplify( this.font.units_per_EM*this.simplifyAmount, shapes[i] )
    
    var triList = triangulate(shapes, randomSteinerPoints(glyph))

    // unroll into a single array
    var tris = []
    for (var i=0; i<triList.length; i++) {
        var t = triList[i].getPoints();
        tris.push(t[0].x, t[0].y)
        tris.push(t[1].x, t[1].y)
        tris.push(t[2].x, t[2].y)
    }
    return tris
}

TriangleRenderer.prototype.renderGlyph = function(i, glyph, scale, x, y) {
    var chr = this.text.charAt(i)
    var cached = this.meshCache[ chr ]
    if (!cached) {
        var triangles = this._triangulate(glyph)

        var newMesh = createMesh(this.gl, {
            positions: new Float32Array(triangles),
            positionSize: 2,
            shader: this.shader
        })

        cached = {
            mesh: newMesh,
            transform: new Matrix4(),
            count: triangles.length/2
        }

        this.meshCache[chr] = cached
    }

    var mesh = cached.mesh,
        count = cached.count,
        transform = cached.transform
    mesh.bind()
    mesh.shader.uniforms.projection = this.projection
    mesh.shader.uniforms.view = this.view
    
    transform.idt();
    transform.translate( tmpVec.set(x, y) );
    transform.scale( tmpVec.set(scale, -scale) );

    mesh.shader.uniforms.tint = this.color
    mesh.shader.uniforms.model = transform.val
    mesh.draw(this.mode, count)

    mesh.unbind()
};

TriangleRenderer.prototype.renderUnderline = function(x, y, width, height) {
    throw 'unsupported operation'
};

TriangleRenderer.prototype.draw = function(mode, x, y, start, end) {
    this.mode = mode || this.gl.TRIANGLES
    this.render(x, y, start, end)
};

module.exports = TriangleRenderer;