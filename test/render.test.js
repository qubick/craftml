var chai = require('chai'),
    assert = require('chai').assert,
    sinon = require("sinon"),
    sinonChai = require("sinon-chai"),
    debug = require('debug')('craftml.test.render')

chai.should()
chai.use(sinonChai);

var render = require('../lib/render'),
    Solid = require('../lib/solid1'),
    Scope = require('../lib/scope'),
    chaiSubset = require('chai-subset'),
    inspect = require('eyes').inspector(),
    EventEmitter = require("events").EventEmitter


var mock = require('./mock')

var script = mock.script,
    a = mock.a,
    unit = mock.unit,
    craft = mock.craft,
    parameter = mock.parameter,
    group = mock.group,
    solid = mock.solid,
    grp = mock.grp,
    content = mock.content,
    foo = mock.foo

function match(actual, expected) {

    if (_.isArray(expected) && _.isArray(actual)) {

        actual.should.have.length(expected.length)

        for (var i = 0; i < actual.length; i++) {

            actual[i].type.should.be.equal(expected[i].type)

        }

    } else {

        actual.type.should.be.equal(expected.type)

        if (actual.children)
            match(actual.children, expected.children)

    }
}    

describe('render#', function() {

    it('can render a single unit', function() {

        var c = unit()
        // inspect(c)
        var r = render(c)
        // inspect(r)
        match(r, solid())
    })

    it('can render an array of two units', function() {

        var c = [unit(), unit()]

        var r = render(c)

        match(r, [solid(), solid()])
    })

    it('can render a group of two units', function() {

        var c = group(unit(), unit())

        var r = render(c)

        match(r,
            grp(solid(),
                solid()))
    })

    it('can render a group of two units within another group', function() {

        var c = group(unit(), group(unit(), unit()))
            // inspect(c)

        var r = render(c)
            // inspect(r)

        match(r,
            grp(solid(),
                grp(solid(),
                    solid())))
    })

    it('does not render <craft> to anything', function() {

        var c = craft(unit())
            // inspect(c)

        var r = render(c)
            // inspect(r)

        assert.isUndefined(r)

    })

    it('can resolve <foo> to <craft name="foo"><unit>', function() {

        var c = [
            craft(a('name', 'foo'),
                unit()),
            foo()
        ]

        // inspect(c)

        var r = render(c)
            // inspect(r)

        match(r, [solid()])

    })

    it('can resolve <foo> three times', function() {

        var c = [
            craft(a('name', 'foo'),
                unit()),
            foo(),
            foo(),
            foo()
        ]

        // inspect(c)

        var r = render(c)
            // inspect(r)

        match(r, [solid(), solid(), solid()])

    })

    it('can resolve <content>', function() {
        var u = unit()
        var spy = sinon.spy(u, 'create')

        var c = [
                craft(a('name', 'foo'),
                    content()),
                foo(u, u)
            ]
            // inspect(c)

        var r = render(c)

        // inspect(r)

        spy.should.have.been.calledTwice

    })

    it('can resolve <content> multiple times', function() {
        var u = unit()
        var spy = sinon.spy(u, 'create')

        var c = [
                craft(a('name', 'foo'),
                    content(), content()),
                foo(u)
            ]
            // inspect(c)

        var r = render(c)

        // inspect(r)

        spy.should.have.been.calledTwice

    })

    describe('layout', function() {

        it('can compute group size', function() {

            var c = group(unit(), unit())

            // inspect(c)
            var r = render(c)

            // inspect(r)

            r.should.has.property('layout')
            r.layout.should.containSubset({
                size: {
                    x: 1,
                    y: 1,
                    z: 1
                }
            })
        })
        
    })

    describe('script', function(){

        it('can run a script in an array', function() {
            var spy = sinon.spy()
            var c = [unit(), script(spy)]

            // inspect(c)
            render(c)
            spy.should.have.been.calledOnce
        })

        it('can run a script with parameters injected', function() {
            var spy = sinon.spy()
            var c = [
                parameter(a('name', 'p1'), a('default', 2), a('type', 'int')),
                script(spy)
            ]
            //inspect(c)
            render(c)
            spy.should.have.been.calledWith({p1:2})
        })

        it('can run a script that changes the layout', function() {
            var spy = sinon.spy()
            var c = [
                unit(),
                script(function(params, scope){
                    scope.solids[0].layout.size.x = 100
                })
            ]
            // inspect(c)
            var r = render(c)
            // inspect(r)
            
            r[0].should.containSubset({
                layout: {
                    size: {
                        x: 100
                    }
                }
            })
        })
    })

    describe('parameters', function() {

        it('can inject default parameter values', function() {
            var u = unit()
            var spy = sinon.spy(u, 'create')

            var c = [
                parameter(a('name', 'p1'), a('default', 2), a('type', 'int')),
                parameter(a('name', 'p2'), a('default', 5), a('type', 'int')),
                u
            ]

            // inspect(c)
            var r = render(c)

            spy.should.have.been.calledWith({
                'p1': 2,
                'p2': 5
            })

        })

        it('can override default parameter values', function() {
            var u = unit()
            var spy = sinon.spy(u, 'create')

            var c = [
                parameter(a('name', 'p1'), a('default', 2), a('type', 'int')),
                parameter(a('name', 'p2'), a('default', 5), a('type', 'int')),
                u
            ]

            // inspect(c)
            var r = render(c, {
                parameters: {
                    'p1': 5
                }
            })

            spy.should.have.been.calledWith({
                'p1': 5,
                'p2': 5
            })

        })

        it('can inject tag attribues as parameters to an inner craft', function() {
            var u = unit()
            var spy = sinon.spy(u, 'create')

            var c = [
                craft(a('name', 'foo'),
                    parameter(a('name', 'p1'), a('default', 2), a('type', 'int')),
                    u),
                foo(a('p1', 5))
            ]

            // inspect(c)

            var r = render(c)

            spy.should.have.been.calledWith({
                'p1': 5
            })

        })

        it('can inject default parameter values to an inner craft', function() {
            var u = unit()
            var spy = sinon.spy(u, 'create')

            var c = [
                craft(a('name', 'foo'),
                    parameter(a('name', 'p1'), a('default', 2), a('type', 'int')),
                    parameter(a('name', 'p2'), a('default', 10), a('type', 'int')),
                    u),
                foo()
            ]

            // inspect(c)

            var r = render(c)

            spy.should.have.been.calledWith({
                'p1': 2,
                'p2': 10
            })
        })

        it('can resolve {{param}} from default parameter values', function() {
            var u = unit()
            var spy = sinon.spy(u, 'create')

            var c = [
                parameter(a('name', 'q1'), a('default', 10), a('type', 'int')),
                craft(a('name', 'foo'),
                    parameter(a('name', 'p1'), a('default', 2), a('type', 'int')),
                    u),
                foo(a('p1', '{{q1}}'))
            ]

            // inspect(c)

            var r = render(c)

            spy.should.have.been.calledWith({
                'p1': 10
            })
        })

        it('can resolve {{param}} from supplied parameter values', function() {
            var u = unit()
            var spy = sinon.spy(u, 'create')

            var c = [
                parameter(a('name', 'q1'), a('default', 10), a('type', 'int')),
                craft(a('name', 'foo'),
                    parameter(a('name', 'p1'), a('default', 2), a('type', 'int')),
                    u),
                foo(a('p1', '{{q1}}'))
            ]

            // inspect(c)

            var scope = new Scope()
            scope.parameters = {
                q1: 20
            }
            var r = render(c, scope)

            spy.should.have.been.calledWith({
                'p1': 20
            })
        })
    })



})