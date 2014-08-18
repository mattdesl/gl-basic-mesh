# gl-basic-mesh

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

A basic mesh wrapper, similar to [gl-simplicial-complex](https://www.npmjs.org/package/gl-simplicial-complex) but a little lower level. It creates a new shader with [gl-basic-shader](https://github.com/mattdesl/gl-basic-shader).

A typical use case may be rendering a triangulated 2D or 3D mesh with custom shader effects, or inheriting this class for your custom sprite or polygon batcher. For example, [fontpath-gl](https://github.com/mattdesl/fontpath-gl) utilizes this to generate a default shader and create glyph meshes. 

[![demo1](http://i.imgur.com/tlvIlJQ.png)](http://mattdesl.github.io/gl-basic-mesh/demo/index.html)  
<sup>click to view demo</sup>

## Usage

[![NPM](https://nodei.co/npm/gl-basic-mesh.png)](https://nodei.co/npm/gl-basic-mesh/)

```js
var mesh = require('gl-basic-mesh')(gl, {
	positions: new Float32Array([ -1, -1, 0, 0, ... ])
})

//you can access the gl-buffer like so:
mesh.positions.update( ... ) 

//bind the mesh and its associated shader
mesh.bind()

//draw with a red tint
mesh.shader.uniforms.tint = [1, 0, 0, 1]
mesh.draw()

mesh.unbind()
```

You can find a full demo in the [demo](demo/) folder.

### ```mesh = createMesh(gl, options)```

Creates a mesh where options can be:

- `positions` a data type (anything that gl-buffer accepts, eg. Float32Array) for vertex positions
- `positionSize` the number of position components per vertex, default 3 (for XYZ)
- `colors` a data type for colors
- `colorSize` the number of color components per vertex, default 4
- `normals` a data type for normals, expects 3 components per vertex
- `texcoords` a data type for texcoords, expects 2 components per vertex
- `elements` optional data type (eg. Uint16Array), if specified they will be used for drawing
- `usage` the usage type for vertex attribuets, such as `gl.DYNAMIC_DRAW`. defaults to `gl.STATIC_DRAW`
- `shader` a shader this mesh will be associated with, otherwise a *new* default shader will be created 

If a shader is not specified, a new one will be compiled with [gl-basic-shader](https://npmjs.org/package/gl-basic-shader). If you plan on creating multiple meshes you should try to find a way to use a common shader. 

If colors, normals or texcoords is not specified, no buffers or attributes will be set up for those. If positions is not set up, the position buffer will be an empty array, and you will be expected to fill it yourself with `mesh.positions.update`.

### `mesh.bind()`

Binds the mesh VAO and its associated shader. You can set shader uniforms after this.

### `mesh.unbind()`

Unbinds the mesh VAO.

### `mesh.draw([mode, count, offset])`

Draws the mesh with the given mode, primitive count, and offset. These are passed along to `vao.draw(..)`. 

The mode defaults to `gl.TRIANGLES` if unspecified. The count defaults to the total vertex count (if no elements were specified) or total element count (if elements were specified). The offset defaults to zero.

### `mesh.dispose()`

Disposes of this mesh VAO and VBOs. If you specified a shader in the constructor, it will *not* dispose of it; otherwise it will dispose of its `defaultShader`. 

## default shader

The default shader is created with [gl-basic-shader](https://npmjs.org/package/gl-basic-shader), which gives you a few features out of the box.

Attributes:

- `position` 
- `normal` if you specified `normals`
- `color` if you specified `colors`
- `texcoord0` if you specified `texcoords`

Uniforms:

- `tint`, defaults to white
- `texture0` a sampler2D for `texcoord0`, if you specified `texcoords`
- `model` mat4
- `view` mat4
- `projection` mat4

## License

MIT, see [LICENSE.md](http://github.com/mattdesl/gl-basic-mesh/blob/master/LICENSE.md) for details.
