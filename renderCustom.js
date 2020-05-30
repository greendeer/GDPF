/**
* See [Demo.js](https://github.com/liabru/matter-js/blob/master/demo/js/Demo.js)
* and [DemoMobile.js](https://github.com/liabru/matter-js/blob/master/demo/js/DemoMobile.js) for usage examples.
*
* @class RenderCustom
*/

function ThresholdFilter()
{
    PIXI.filters.AbstractFilter.call(this,
        // vertex shader
        null,
        // fragment shader
        [
'precision mediump float;',

'varying vec2 vTextureCoord;',

'uniform sampler2D uSampler;',
'uniform float threshold;',

'void main(void)',
'{',
'    vec4 color = texture2D(uSampler, vTextureCoord);',
'    vec3 blue = vec3(51.0/255.0, 153.0/255.0, 255.0/255.0);',
/*'    float alpha = color.a / threshold;',
'    if (alpha > 1.0) {',
'        alpha = 1.0;',
'    }',
'    if (alpha == 0.95) {',
'        gl_FragColor = vec4(vec3(0.0), 1.0);',
'    } else {',
'        gl_FragColor = vec4(blue*alpha, 1.0);',
'    }',*/
'    if (color.a < threshold) {',
'       gl_FragColor = vec4(vec3(0.0), 1.0);',
'    } else {',
'       gl_FragColor = vec4(blue, 1.0);',
'    }',
'}',
        ].join('\n'),
        // custom uniforms
        {
            threshold: { type: '1f', value: 0.5 }
        }
    );
}

ThresholdFilter.prototype = Object.create(PIXI.filters.AbstractFilter.prototype);
ThresholdFilter.prototype.constructor = ThresholdFilter;

Object.defineProperties(ThresholdFilter.prototype, {
    threshold: {
        get: function ()
        {
            return this.uniforms.threshold.value;
        },
        set: function (value)
        {
            this.uniforms.threshold.value = value;
        }
    }
});


var b = new PIXI.filters.BlurFilter();
b.blurX = 80;
b.blurY = 80;
b.blur = 80;
b.passes = 10;

var t = new ThresholdFilter();
t.threshold = 0.05;

var stats;

var RenderCustom = {};

var Common = Matter.Common;
var Composite = Matter.Composite;
var Bounds = Matter.Bounds;

var filtersMask = 0;

/**
 * Creates a new Pixi.js WebGL renderer
 * @method create
 * @param {object} options
 * @return {RenderCustom} A new renderer
 */
RenderCustom.create = function(options) {
    var defaults = {
        controller: RenderCustom,
        element: null,
        canvas: null,
        options: {
            width: 1200,
            height: 1200,
            background: '#fafafa',
            wireframeBackground: '#222',
            hasBounds: false,
            enabled: true,
            wireframes: true,
            showSleeping: true,
            showDebug: false,
            showBroadphase: false,
            showBounds: false,
            showVelocity: false,
            showCollisions: false,
            showAxes: false,
            showPositions: false,
            showAngleIndicator: false,
            showIds: false,
            showShadows: false
        }
    };

    var render = Common.extend(defaults, options),
        transparent = !render.options.wireframes && render.options.background === 'transparent';

    // init pixi
    render.context = new PIXI.WebGLRenderer(render.options.width * 3, render.options.height, {
        view: render.canvas,
        transparent: transparent,
        antialias: true,
        backgroundColor: options.background
    });
    
    render.canvas = render.context.view;
    
    render.stage = new PIXI.Container();
    render.container = new PIXI.Container();
    render.bounds = render.bounds || {
        min: {
            x: 0,
            y: 0
        },
        max: {
            x: render.options.width,
            y: render.options.height
        }
    };

    // caches
    render.textures = {};
    render.sprites = {};
    render.primitives = {};

    // use a sprite batch for performance
    render.spriteContainer = new PIXI.Container();
    //render.container.addChild(render.spriteContainer);
    
    // insert canvas
    if (Common.isElement(render.element)) {
        render.element.appendChild(render.canvas);
    } else {
        Common.log('No "render.element" passed, "render.canvas" was not inserted into document.', 'warn');
    }
    
    //stats = new Stats();
	
	/*render.element.appendChild( stats.domElement );
	stats.domElement.style.position = "absolute";
	stats.domElement.style.top = "0px";*/

    // prevent menus on canvas
    render.canvas.oncontextmenu = function() { return false; };
    render.canvas.onselectstart = function() { return false; };
    
    filtersMask = 0;
    
    // render.texture = new PIXI.RenderTexture(render.context, render.options.width, render.options.height);
    // render.texture.render(render.container);
    
    // render.texture2 = new PIXI.RenderTexture(render.context, render.options.width, render.options.height);
    // render.texture2.render(render.container);
    
    render.texture3 = new PIXI.RenderTexture(render.context, render.options.width, render.options.height);
    render.texture3.render(render.container);
    
    // render.sprite = new PIXI.Sprite(render.texture);
    // render.sprite2 = new PIXI.Sprite(render.texture2);
    render.sprite3 = new PIXI.Sprite(render.texture3);
    
    // render.sprite.x = 0;
    // render.sprite.y = 0;
    
    // render.sprite2.x = render.options.width;
    // render.sprite2.y = 0;
    
    render.sprite3.x = 0;
    render.sprite3.y = 0;
    
    render.stage.addChild(render.sprite3);
    // render.stage.addChild(render.sprite2);
    // render.stage.addChild(render.sprite);
    
    // var pass1 = new PIXI.Text('Pass 1:\nHigh Constrast Render', {font: 'bold 12px Arial', fill : 0xffffff, stroke : 0x000000, strokeThickness : 2 });
    // pass1.x = 10;
    // pass1.y = 10;
    // render.stage.addChild(pass1);
    
    // var pass2 = new PIXI.Text('Pass 2:\nGaussian Blur', {font: 'bold 12px Arial', fill : 0xffffff, stroke : 0x000000, strokeThickness : 2 });
    // pass2.x = 10 + render.options.width;
    // pass2.y = 10;
    // render.stage.addChild(pass2);
    
    var pass3 = new PIXI.Text('Pass 3:\nThreshold Filter', {font: 'bold 12px Arial', fill : 0xffffff, stroke : 0x000000, strokeThickness : 2 });
    pass3.x = 10;
    pass3.y = 10;
    render.stage.addChild(pass3);
    
    return render;
};

/**
 * Clears the scene graph
 * @method clear
 * @param {RenderCustom} render
 */
RenderCustom.clear = function(render) {
    var container = render.container,
        spriteContainer = render.spriteContainer;

    // clear stage container
    while (container.children[0]) {
        container.removeChild(container.children[0]);
    }

    // clear sprite batch
    while (spriteContainer.children[0]) {
        spriteContainer.removeChild(spriteContainer.children[0]);
    }

    var bgSprite = render.sprites['bg-0'];

    // clear caches
    render.textures = {};
    render.sprites = {};
    render.primitives = {};

    // set background sprite
    render.sprites['bg-0'] = bgSprite;
    if (bgSprite)
        container.addChildAt(bgSprite, 0);

    // add sprite batch back into container
    render.container.addChild(render.spriteContainer);

    // reset background state
    render.currentBackground = null;

    // reset bounds transforms
    container.scale.set(1, 1);
    container.position.set(0, 0);
};

/**
 * Sets the background of the canvas
 * @method setBackground
 * @param {RenderCustom} render
 * @param {string} background
 */
RenderCustom.setBackground = function(render, background) {
    if (render.currentBackground !== background) {
        var isColor = background.indexOf && background.indexOf('#') !== -1,
            bgSprite = render.sprites['bg-0'];

        if (isColor) {
            // if solid background color
            var color = Common.colorToNumber(background);
            render.context.backgroundColor = color;

            // remove background sprite if existing
            if (bgSprite)
                render.container.removeChild(bgSprite);
        } else {
            // initialise background sprite if needed
            if (!bgSprite) {
                var texture = _getTexture(render, background);

                bgSprite = render.sprites['bg-0'] = new PIXI.Sprite(texture);
                bgSprite.position.x = 0;
                bgSprite.position.y = 0;
                render.container.addChildAt(bgSprite, 0);
            }
        }

        render.currentBackground = background;
    }
};

/**
 * Description
 * @method world
 * @param {engine} engine
 */
RenderCustom.world = function({ engine }) {
    //stats.begin();
    //console.log(engine);
    var render = engine.render,
        world = engine.world,
        context = render.context,
        container = render.container,
        options = render.options,
        bodies = Composite.allBodies(world),
        allConstraints = Composite.allConstraints(world),
        constraints = [],
        i;

    /*if (options.wireframes) {
        RenderCustom.setBackground(render, options.wireframeBackground);
    } else {
        RenderCustom.setBackground(render, options.background);
    }

    // handle bounds
    var boundsWidth = render.bounds.max.x - render.bounds.min.x,
        boundsHeight = render.bounds.max.y - render.bounds.min.y,
        boundsScaleX = boundsWidth / render.options.width,
        boundsScaleY = boundsHeight / render.options.height;

    if (options.hasBounds) {
        // Hide bodies that are not in view
        for (i = 0; i < bodies.length; i++) {
            var body = bodies[i];
            body.render.sprite.visible = Bounds.overlaps(body.bounds, render.bounds);
        }

        // filter out constraints that are not in view
        for (i = 0; i < allConstraints.length; i++) {
            var constraint = allConstraints[i],
                bodyA = constraint.bodyA,
                bodyB = constraint.bodyB,
                pointAWorld = constraint.pointA,
                pointBWorld = constraint.pointB;

            if (bodyA) pointAWorld = Vector.add(bodyA.position, constraint.pointA);
            if (bodyB) pointBWorld = Vector.add(bodyB.position, constraint.pointB);

            if (!pointAWorld || !pointBWorld)
                continue;

            if (Bounds.contains(render.bounds, pointAWorld) || Bounds.contains(render.bounds, pointBWorld))
                constraints.push(constraint);
        }

        // transform the view
        container.scale.set(1 / boundsScaleX, 1 / boundsScaleY);
        container.position.set(-render.bounds.min.x * (1 / boundsScaleX), -render.bounds.min.y * (1 / boundsScaleY));
    } else {
        constraints = allConstraints;
    }*/

    for (i = 0; i < bodies.length; i++)
        RenderCustom.body(engine, bodies[i]);

    /*for (i = 0; i < constraints.length; i++)
        RenderCustom.constraint(engine, constraints[i]);*/

    /*var newFiltersMask = (options.blurFilter ? 1 : 0) + (options.thresholdFilter ? 2 : 0);
    
    if (newFiltersMask != filtersMask) {
        var filters = [];
        if (options.blurFilter)
            filters.push(b);
        if (options.thresholdFilter)
            filters.push(t);
        if (filters.length > 0)
            container.filters = filters;
        else
            container.filters = null;
            
        filtersMask = newFiltersMask;
    }*/
    
    //context.render(container);
    
    //render.container.filters = [b, t];
    render.texture.clear();
    render.texture2.clear();
    render.texture3.clear();
    
    render.container.filters = null;
    render.texture.render(render.container);
    render.container.filters = [b];
    render.texture2.render(render.container);
    render.container.filters = [b, t];
    render.texture3.render(render.container);
    
    render.context.render(render.stage);
    //render.context.render(render.sprite);
    
    /*render.container.filters = [b];
    render.context2.render(render.container);
    render.container.filters = [b, t];
    render.context3.render(render.container);*/
    
    //stats.end();
};


/**
 * Description
 * @method constraint
 * @param {engine} engine
 * @param {constraint} constraint
 */
RenderCustom.constraint = function(engine, constraint) {
    var render = engine.render,
        bodyA = constraint.bodyA,
        bodyB = constraint.bodyB,
        pointA = constraint.pointA,
        pointB = constraint.pointB,
        container = render.container,
        constraintRender = constraint.render,
        primitiveId = 'c-' + constraint.id,
        primitive = render.primitives[primitiveId];

    // initialise constraint primitive if not existing
    if (!primitive)
        primitive = render.primitives[primitiveId] = new PIXI.Graphics();

    // don't render if constraint does not have two end points
    if (!constraintRender.visible || !constraint.pointA || !constraint.pointB) {
        primitive.clear();
        return;
    }

    // add to scene graph if not already there
    if (Common.indexOf(container.children, primitive) === -1)
        container.addChild(primitive);

    // render the constraint on every update, since they can change dynamically
    primitive.clear();
    primitive.beginFill(0, 0);
    primitive.lineStyle(constraintRender.lineWidth, Common.colorToNumber(constraintRender.strokeStyle), 1);
    
    if (bodyA) {
        primitive.moveTo(bodyA.position.x + pointA.x, bodyA.position.y + pointA.y);
    } else {
        primitive.moveTo(pointA.x, pointA.y);
    }

    if (bodyB) {
        primitive.lineTo(bodyB.position.x + pointB.x, bodyB.position.y + pointB.y);
    } else {
        primitive.lineTo(pointB.x, pointB.y);
    }

    primitive.endFill();
};

/**
 * Description
 * @method body
 * @param {engine} engine
 * @param {body} body
 */
RenderCustom.body = function(engine, body) {
    var render = engine.render,
        bodyRender = body.render;

    if (!bodyRender.visible)
        return;

    if (bodyRender.sprite && bodyRender.sprite.texture) {
        var spriteId = 'b-' + body.id,
            sprite = render.sprites[spriteId],
            spriteContainer = render.spriteContainer;

        // initialise body sprite if not existing
        if (!sprite)
            sprite = render.sprites[spriteId] = _createBodySprite(render, body);

        // add to scene graph if not already there
        if (Common.indexOf(spriteContainer.children, sprite) === -1)
            spriteContainer.addChild(sprite);

        // update body sprite
        sprite.position.x = body.position.x;
        sprite.position.y = body.position.y;
        sprite.rotation = body.angle;
        sprite.scale.x = bodyRender.sprite.xScale || 1;
        sprite.scale.y = bodyRender.sprite.yScale || 1;
    } else {
        var primitiveId = 'b-' + body.id,
            primitive = render.primitives[primitiveId],
            container = render.container;
            
        //var primitive2 = render.primitives2[primitiveId];
        //var primitive3 = render.primitives3[primitiveId];

        // initialise body primitive if not existing
        if (!primitive) {
            primitive = render.primitives[primitiveId] = _createBodyPrimitive(render, body);
            //primitive2 = render.primitives2[primitiveId] = _createBodyPrimitive(render, body);
            //primitive3 = render.primitives3[primitiveId] = _createBodyPrimitive(render, body);
            primitive.initialAngle = body.angle;
            //primitive2.initialAngle = body.angle;
            //primitive3.initialAngle = body.angle;
            
            container.addChild(primitive);
        }

        // add to scene graph if not already there
        /*if (Common.indexOf(container.children, primitive) === -1) {
            container.addChild(primitive);
            //render.container2.addChild(primitive2);
            //render.container3.addChild(primitive3);
        }*/

        // update body primitive
        primitive.position.x = body.position.x;
        primitive.position.y = body.position.y;
        primitive.rotation = body.angle - primitive.initialAngle;
        
        // update body primitive
        /*primitive2.position.x = body.position.x;
        primitive2.position.y = body.position.y;
        primitive2.rotation = body.angle - primitive2.initialAngle;
        
        // update body primitive
        primitive3.position.x = body.position.x;
        primitive3.position.y = body.position.y;
        primitive3.rotation = body.angle - primitive3.initialAngle;*/
    }
};

/**
 * Creates a body sprite
 * @method _createBodySprite
 * @private
 * @param {RenderCustom} render
 * @param {body} body
 * @return {PIXI.Sprite} sprite
 */
var _createBodySprite = function(render, body) {
    var bodyRender = body.render,
        texturePath = bodyRender.sprite.texture,
        texture = _getTexture(render, texturePath),
        sprite = new PIXI.Sprite(texture);

    sprite.anchor.x = 0.5;
    sprite.anchor.y = 0.5;

    return sprite;
};

/**
 * Creates a body primitive
 * @method _createBodyPrimitive
 * @private
 * @param {RenderCustom} render
 * @param {body} body
 * @return {PIXI.Graphics} graphics
 */
var _createBodyPrimitive = function(render, body) {
    var bodyRender = body.render,
        options = render.options,
        primitive = new PIXI.Graphics(),
        fillStyle = Common.colorToNumber(bodyRender.fillStyle),
        strokeStyle = Common.colorToNumber(bodyRender.strokeStyle),
        strokeStyleIndicator = Common.colorToNumber(bodyRender.strokeStyle),
        strokeStyleWireframe = Common.colorToNumber('#bbb'),
        strokeStyleWireframeIndicator = Common.colorToNumber('#CD5C5C'),
        part;

    primitive.clear();

    // handle compound parts
    for (var k = body.parts.length > 1 ? 1 : 0; k < body.parts.length; k++) {
        part = body.parts[k];

        if (!options.wireframes) {
            primitive.beginFill(fillStyle, 1);
            primitive.lineStyle(bodyRender.lineWidth, strokeStyle, 1);
        } else {
            primitive.beginFill(0, 0);
            primitive.lineStyle(1, strokeStyleWireframe, 1);
        }

        primitive.moveTo(part.vertices[0].x - body.position.x, part.vertices[0].y - body.position.y);

        for (var j = 1; j < part.vertices.length; j++) {
            primitive.lineTo(part.vertices[j].x - body.position.x, part.vertices[j].y - body.position.y);
        }

        primitive.lineTo(part.vertices[0].x - body.position.x, part.vertices[0].y - body.position.y);

        primitive.endFill();

        // angle indicator
        if (options.showAngleIndicator || options.showAxes) {
            primitive.beginFill(0, 0);

            if (options.wireframes) {
                primitive.lineStyle(1, strokeStyleWireframeIndicator, 1);
            } else {
                primitive.lineStyle(1, strokeStyleIndicator);
            }

            primitive.moveTo(part.position.x - body.position.x, part.position.y - body.position.y);
            primitive.lineTo(((part.vertices[0].x + part.vertices[part.vertices.length-1].x) / 2 - body.position.x),
                             ((part.vertices[0].y + part.vertices[part.vertices.length-1].y) / 2 - body.position.y));

            primitive.endFill();
        }
    }

    return primitive;
};

/**
 * Gets the requested texture (a PIXI.Texture) via its path
 * @method _getTexture
 * @private
 * @param {RenderCustom} render
 * @param {string} imagePath
 * @return {PIXI.Texture} texture
 */
var _getTexture = function(render, imagePath) {
    var texture = render.textures[imagePath];

    if (!texture)
        texture = render.textures[imagePath] = PIXI.Texture.fromImage(imagePath);

    return texture;
};
