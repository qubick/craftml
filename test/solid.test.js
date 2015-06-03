var chai = require('chai'),
    // fs = require('fs'),
    inspect = require('eyes').inspector()

chai.should()

var Solid = require('../lib/solid'),
    Location = require('../lib/location'),
    Size = require('../lib/size'),
    $$$ = require('../lib/scad')

describe('#Solid', function() {

    var cube = $$$.cube([10,10,10])

    it('construct default', function() {

        var s = new Solid()
        // inspect(s)
    })

    describe('transform', function(){

        var s

        beforeEach(function(){
            s = new Solid(cube)
        })

        it('getBounds', function(){

            s.getBounds().location.should.be.eql(new Location(0,0,0))
            s.getBounds().size.should.be.eql(new Size(10,10,10))

        })

        it('translate and apply', function(){

            s.translate(10,10,10)
            s.translate(10,10,10)

            s.apply()

            var b = s.debug().getPolygonsBoundingBox()
            b.location.should.be.eql(new Location(20,20,20))
            b.size.should.be.eql(new Size(10,10,10))

        })

        it('translate', function(){

            s.translate(10,10,10)
            s.getLocation().should.be.eql(new Location(10,10,10))

            s.translate(5,-5,0)
            s.getLocation().should.be.eql(new Location(15,5,10))

        })

        it('translateTo', function(){

            s.translateTo(20,20,20)
            s.getLocation().should.be.eql(new Location(20,20,20))

            s.translateTo(10,10,10)
            s.getLocation().should.be.eql(new Location(10,10,10))

        })


        it('translateTo and apply', function(){

            s.translateTo(20,20,20)
            s.translateTo(10,10,10)

            s.apply()

            var b = s.debug().getPolygonsBoundingBox()
            b.location.should.be.eql(new Location(10,10,10))
            b.size.should.be.eql(new Size(10,10,10))
        })

        it('centerAt', function(){

            s.centerAt(20,20,20)
            s.getLocation().should.be.eql(new Location(15,15,15))

        })

        it('centerAt and apply', function(){

            s.centerAt(20,20,20)
            s.getLocation().should.be.eql(new Location(15,15,15))

            s.apply()

            var b = s.debug().getPolygonsBoundingBox()
            b.location.should.be.eql(new Location(15,15,15))
            b.size.should.be.eql(new Size(10,10,10))

        })

        it('scale (2,1,1)', function(){
            s.scale(2,1,1)
            s.getLocation().should.be.eql(new Location(0,0,0))
            s.getSize().should.be.eql(new Size(20,10,10))
        })

        it('scale (2)', function(){
            s.scale(2)
            s.getLocation().should.be.eql(new Location(0,0,0))
            s.getSize().should.be.eql(new Size(20,20,20))
        })

        it('scale and apply', function(){
            s.scale(2,1,1)
            s.scale(1,1,2)
            s.scale(1,3,1)

            s.apply()

            var b = s.debug().getPolygonsBoundingBox()
            b.location.should.be.eql(new Location(0,0,0))
            b.size.should.be.eql(new Size(20,30,20))
        })

        it('scaleTo (20,20,30)', function(){
            s.scaleTo(20,20,30)
            s.getLocation().should.be.eql(new Location(0,0,0))
            s.getSize().should.be.eql(new Size(20,20,30))
        })

        it('scaleTo (20)', function(){
            s.scaleTo(20)
            s.getLocation().should.be.eql(new Location(0,0,0))
            s.getSize().should.be.eql(new Size(20,20,20))
        })

        it('translate, scale, apply', function(){
            s.translate(-10,0,0)
            s.scale(2,1,1)

            s.apply()

            var b = s.debug().getPolygonsBoundingBox()
            b.location.should.be.eql(new Location(-10,0,0))
            b.size.should.be.eql(new Size(20,10,10))
        })

        it('rotateX(90)', function(){
            s.rotateX(90)
            s.getLocation().should.be.eql(new Location(0,0,0))
            s.getSize().should.be.eql(new Size(10,10,10))
        })

        it('rotateZ(45)', function(){
            s.rotateZ(45)

            var loc = s.getLocation()
            loc.should.have.property('x').to.be.closeTo(-2.07,0.01)
            loc.should.have.property('y').to.be.closeTo(-2.07,0.01)
            loc.should.have.property('z').to.be.eql(0)

            var size = s.getSize()
            size.should.have.property('x').to.be.closeTo(14.14,0.01)
            size.should.have.property('y').to.be.closeTo(14.14,0.01)
            size.should.have.property('z').to.be.eql(10)
        })

        it('rotateZ(45) rotateY(90)', function(){
            s.rotateZ(45)
            s.rotateY(90)

            var loc = s.getLocation()
            loc.should.have.property('x').to.be.closeTo(0,0.01)
            loc.should.have.property('y').to.be.closeTo(-2.07,0.01)
            loc.should.have.property('z').to.be.closeTo(-2.07,0.01)

            var size = s.getSize()
            size.should.have.property('x').to.be.eql(10)
            size.should.have.property('y').to.be.closeTo(14.14,0.01)
            size.should.have.property('z').to.be.closeTo(14.14,0.01)
        })

        it('rotateZ(90) w.r.t. [0,0,0]', function(){
            s.rotateZ(90, [0,0,0])

            var b = s.getBounds()
            b.location.should.be.eql(new Location(-10,0,0))
            b.size.should.be.eql(new Size(10,10,10))
        })

    })


    describe.only('transformEval', function(){

        var s, r

        beforeEach(function(){
            s = new Solid(cube)
            r = new Solid(cube)
        })

        it('translate(10,0,0)', function(){

            s.transformEval('translate(10,0,0)')

            r.translate(10,0,0)

            var b1 = s.getBounds()
            var b2 = r.getBounds()
            b1.location.should.be.eql(b2.location)
            b1.size.should.be.eql(b2.size)
        })

        it('translate scale rotateX', function(){

            s.transformEval('translate(10,0,0) scale(3) rotateX(45)')

            r.translate(10,0,0)
            r.scale(3)
            r.rotateX(45)

            var b1 = s.getBounds()
            var b2 = r.getBounds()
            b1.location.should.be.eql(b2.location)
            b1.size.should.be.eql(b2.size)
        })

        it('translate(a,b,c) where a=1 b=2 c=3', function(){

            s.transformEval('translate(a,b,c)', {a:1,b:2,c:3})

            r.translate(1,2,3)

            var b1 = s.getBounds()
            var b2 = r.getBounds()
            b1.location.should.be.eql(b2.location)
            b1.size.should.be.eql(b2.size)
        })

        it('rotateX rotateY rotateZ', function(){

            s.transformEval('rotateX(45) rotateY(60) rotateZ(30)')

            r.rotateX(45)
            r.rotateY(60)
            r.rotateZ(30)

            var b1 = s.getBounds()
            var b2 = r.getBounds()
            b1.location.should.be.eql(b2.location)
            b1.size.should.be.eql(b2.size)
        })

        it('spaces in expression e.g., translate( 1 , 2 , 3) scale( 3 ) ', function(){

            s.transformEval('translate( 1 , 2 , 3) scale( 3 ); ')

            r.translate(1,2,3)
            r.scale(3)

            var b1 = s.getBounds()
            var b2 = r.getBounds()
            b1.location.should.be.eql(b2.location)
            b1.size.should.be.eql(b2.size)
        })

        it('calculations in expression e.g., scale(s/2) s = 3 ', function(){

            s.transformEval('scale(s/2) translate(s*2, s+5, s+6)', {s:4})

            var k = 4
            r.scale(k/2)
            r.translate(k*2, k+5, k+6)

            var b1 = s.getBounds()
            var b2 = r.getBounds()
            b1.location.should.be.eql(b2.location)
            b1.size.should.be.eql(b2.size)
        })

    })
})
