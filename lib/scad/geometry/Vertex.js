// # class Vertex
// Represents a vertex of a polygon. Use your own vertex class instead of this
// one to provide additional features like texture coordinates and vertex
// colors. Custom vertex classes need to provide a `pos` property
// `flipped()`, and `interpolate()` methods that behave analogous to the ones
// defined by `Vertex`.

var Vector3D = require('./Vector3D')

var Vertex = function(pos) {
    this.pos = pos;
};

// create from an untyped object with identical property names:
Vertex.fromObject = function(obj) {
    var pos = new Vector3D(obj.pos);
    return new Vertex(pos);
};

var getTag = require('./tag')

Vertex.prototype = {
    // Return a vertex with all orientation-specific data (e.g. vertex normal) flipped. Called when the
    // orientation of a polygon is flipped.
    flipped: function() {
        return this;
    },

    getTag: function() {
        var result = this.tag;
        if(!result) {
            result = getTag()
            this.tag = result;
        }
        return result;
    },

    // Create a new vertex between this vertex and `other` by linearly
    // interpolating all properties using a parameter of `t`. Subclasses should
    // override this to interpolate additional properties.
    interpolate: function(other, t) {
        var newpos = this.pos.lerp(other.pos, t);
        return new Vertex(newpos);
    },

    // Affine transformation of vertex. Returns a new Vertex
    transform: function(matrix4x4) {
        var newpos = this.pos.multiply4x4(matrix4x4);
        return new Vertex(newpos);
    },

    toStlString: function() {
        return "vertex " + this.pos.toStlString() + "\n";
    },

    toAMFString: function() {
        return "<vertex><coordinates>" + this.pos.toAMFString() + "</coordinates></vertex>\n";
    },

    toString: function() {
        return this.pos.toString();
    }
};

module.exports = Vertex
