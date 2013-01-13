/**
 * enchant.js v0.6.2
 * http://enchantjs.com
 * 
 * Copyright Ubiquitous Entertainment Inc.
 * Released under the MIT license.
 */

(function(window, undefined){

/**
 * ECMA-262 5th edition Functions
 */
if (typeof Object.defineProperty !== 'function') {
    Object.defineProperty = function(obj, prop, desc) {
        if ('value' in desc) {
            obj[prop] = desc.value;
        }
        if ('get' in desc) {
            obj.__defineGetter__(prop, desc.get);
        }
        if ('set' in desc) {
            obj.__defineSetter__(prop, desc.set);
        }
        return obj;
    };
}
if (typeof Object.defineProperties !== 'function') {
    Object.defineProperties = function(obj, descs) {
        for (var prop in descs) {
            if (descs.hasOwnProperty(prop)) {
                Object.defineProperty(obj, prop, descs[prop]);
            }
        }
        return obj;
    };
}
if (typeof Object.create !== 'function') {
    Object.create = function(prototype, descs) {
        function F() {
        }

        F.prototype = prototype;
        var obj = new F();
        if (descs != null) {
            Object.defineProperties(obj, descs);
        }
        return obj;
    };
}
if (typeof Object.getPrototypeOf !== 'function') {
    Object.getPrototypeOf = function(obj) {
        return obj.__proto__;
    };
}

if (typeof Function.prototype.bind !== 'function') {
    Function.prototype.bind = function(thisObject) {
        var func = this;
        var args = Array.prototype.slice.call(arguments, 1);
        var Nop = function() {
        };
        var bound = function() {
            var a = args.concat(Array.prototype.slice.call(arguments));
            return func.apply(
                this instanceof Nop ? this : thisObject || window, a);
        };
        Nop.prototype = func.prototype;
        bound.prototype = new Nop();
        return bound;
    };
}

window.getTime = (function() {

    if (window.performance && window.performance.now) {
        return function() {
            return window.performance.now();
        };
    } else if (window.performance && window.performance.webkitNow) {
        return function() {
            return window.performance.webkitNow();
        };
    } else {
        return Date.now;
    }
}());

var enchant = function() {};

window.enchant = enchant;
enchant.Class = function(superclass, definition) {
    return enchant.Class.create(superclass, definition);
};

enchant.Class.create = function(superclass, definition) {
    if (superclass == null && definition){
        throw new Error("superclass is undefined (enchant.Class.create)");
    }else if(superclass == null){
        throw new Error("definition is undefined (enchant.Class.create)");
    }

    if (arguments.length === 0) {
        return enchant.Class.create(Object, definition);
    } else if (arguments.length === 1 && typeof arguments[0] !== 'function') {
        return enchant.Class.create(Object, arguments[0]);
    }

    for (var prop in definition) {
        if (definition.hasOwnProperty(prop)) {
            if (typeof definition[prop] === 'object' && definition[prop] !== null && Object.getPrototypeOf(definition[prop]) === Object.prototype) {
                if (!('enumerable' in definition[prop])) {
                    definition[prop].enumerable = true;
                }
            } else {
                definition[prop] = { value: definition[prop], enumerable: true, writable: true };
            }
        }
    }
    var Constructor = function() {
        if (this instanceof Constructor) {
            Constructor.prototype.initialize.apply(this, arguments);
        } else {
            return new Constructor();
        }
    };
    Constructor.prototype = Object.create(superclass.prototype, definition);
    Constructor.prototype.constructor = Constructor;
    if (Constructor.prototype.initialize == null) {
        Constructor.prototype.initialize = function() {
            superclass.apply(this, arguments);
        };
    }

    var tree = this.getInheritanceTree(superclass);
    for (var i = tree.length - 1; i >= 0; i--) {
        if (typeof tree[i]._inherited === 'function') {
            tree[i]._inherited(Constructor);
            break;
        }
    }

    return Constructor;
};

enchant.Class.getInheritanceTree = function(Constructor) {
    var ret = [];
    var C = Constructor;
    var proto = C.prototype;
    while (C !== Object) {
        ret.push(C);
        proto = Object.getPrototypeOf(proto);
        C = proto.constructor;
    }
    return ret;
};


enchant.ENV = {

    VERSION: "0.6.1",

    VENDOR_PREFIX: (function() {

            return '';

    }()),

    TOUCH_ENABLED: (function() {
        return false;
    }()),

    RETINA_DISPLAY: (function() {
        return false;
    }()),

    USE_FLASH_SOUND: (function() {
        return false;
    }()),

    USE_DEFAULT_EVENT_TAGS: ['input', 'textarea', 'select', 'area'],
    CANVAS_DRAWING_METHODS: [
        'putImageData', 'drawImage', 'drawFocusRing', 'fill', 'stroke',
        'clearRect', 'fillRect', 'strokeRect', 'fillText', 'strokeText'
    ],

    KEY_BIND_TABLE: {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    },
    PREVENT_DEFAULT_KEY_CODES: [37, 38, 39, 40, 32],

    SOUND_ENABLED_ON_MOBILE_SAFARI: false,

    USE_WEBAUDIO: (function(){
        return false;
    }()),

    USE_ANIMATION: true
};

enchant.Event = enchant.Class.create({
    initialize: function(type) {
        this.type = type;
        this.target = null;
        this.x = 0;
        this.y = 0;
        this.localX = 0;
        this.localY = 0;
    },
    _initPosition: function(pageX, pageY) {
        var core = enchant.Core.instance;
        this.x = this.localX = (pageX - core._pageX) / core.scale;
        this.y = this.localY = (pageY - core._pageY) / core.scale;
    }
});

enchant.Event.LOAD = 'load';
enchant.Event.PROGRESS = 'progress';
enchant.Event.ENTER_FRAME = 'enterframe';
enchant.Event.EXIT_FRAME = 'exitframe';
enchant.Event.ENTER = 'enter';
enchant.Event.EXIT = 'exit';
enchant.Event.CHILD_ADDED = 'childadded';
enchant.Event.ADDED = 'added';
enchant.Event.ADDED_TO_SCENE = 'addedtoscene';
enchant.Event.CHILD_REMOVED = 'childremoved';
enchant.Event.REMOVED = 'removed';
enchant.Event.REMOVED_FROM_SCENE = 'removedfromscene';
enchant.Event.TOUCH_START = 'touchstart';
enchant.Event.TOUCH_MOVE = 'touchmove';
enchant.Event.TOUCH_END = 'touchend';
enchant.Event.RENDER = 'render';
enchant.Event.INPUT_START = 'inputstart';
enchant.Event.INPUT_CHANGE = 'inputchange';
enchant.Event.INPUT_END = 'inputend';
enchant.Event.LEFT_BUTTON_DOWN = 'leftbuttondown';
enchant.Event.LEFT_BUTTON_UP = 'leftbuttonup';
enchant.Event.RIGHT_BUTTON_DOWN = 'rightbuttondown';
enchant.Event.RIGHT_BUTTON_UP = 'rightbuttonup';
enchant.Event.UP_BUTTON_DOWN = 'upbuttondown';
enchant.Event.UP_BUTTON_UP = 'upbuttonup';
enchant.Event.DOWN_BUTTON_DOWN = 'downbuttondown';
enchant.Event.DOWN_BUTTON_UP = 'downbuttonup';
enchant.Event.A_BUTTON_DOWN = 'abuttondown';
enchant.Event.A_BUTTON_UP = 'abuttonup';
enchant.Event.B_BUTTON_DOWN = 'bbuttondown';
enchant.Event.B_BUTTON_UP = 'bbuttonup';
enchant.Event.ADDED_TO_TIMELINE = "addedtotimeline";
enchant.Event.REMOVED_FROM_TIMELINE = "removedfromtimeline";
enchant.Event.ACTION_START = "actionstart";
enchant.Event.ACTION_END = "actionend";
enchant.Event.ACTION_TICK = "actiontick";
enchant.Event.ACTION_ADDED = "actionadded";
enchant.Event.ACTION_REMOVED = "actionremoved";

enchant.EventTarget = enchant.Class.create({

    initialize: function() {
        this._listeners = {};
    },

    addEventListener: function(type, listener) {
        var listeners = this._listeners[type];
        if (listeners == null) {
            this._listeners[type] = [listener];
        } else if (listeners.indexOf(listener) === -1) {
            listeners.unshift(listener);
        }
    },

    on: function() {
        this.addEventListener.apply(this, arguments);
    },

    removeEventListener: function(type, listener) {
        var listeners = this._listeners[type];
        if (listeners != null) {
            var i = listeners.indexOf(listener);
            if (i !== -1) {
                listeners.splice(i, 1);
            }
        }
    },

    clearEventListener: function(type) {
        if (type != null) {
            delete this._listeners[type];
        } else {
            this._listeners = {};
        }
    },

    dispatchEvent: function(e) {
        e.target = this;
        e.localX = e.x - this._offsetX;
        e.localY = e.y - this._offsetY;
        if (this['on' + e.type] != null){
            this['on' + e.type](e);
        }
        var listeners = this._listeners[e.type];
        if (listeners != null) {
            listeners = listeners.slice();
            for (var i = 0, len = listeners.length; i < len; i++) {
                listeners[i].call(this, e);
            }
        }
    }
});

(function() {
    var core;

    enchant.Core = enchant.Class.create(enchant.EventTarget, {

        initialize: function(width, height) {

            enchant.EventTarget.call(this);

            core = enchant.Core.instance = this;

            this.width = width || 320;
            this.height = height || 320;
            this.scale = 1;
            this.fps = 30;
            this.frame = 0;
            this.ready = false;
            this.running = false;
            this._scenes = [];
            this.currentScene = null;
            this.rootScene = new enchant.Scene();
            this.pushScene(this.rootScene);
            this._mousedownID = 0;
            this._surfaceID = 0;
            this._soundID = 0;
            this._activated = true;
            this._offsetX = 0;
            this._offsetY = 0;
        },

        start: function() {
            this.currentTime = 0;
            this._nextTime = 0;
            this.running = true;
            this.ready = true;
            this._activated = true;
            var e = new enchant.Event('load');
            this.dispatchEvent(e);
        },

        debug: function() {
            this._debug = true;
            this.start();
        },

        _tick: function(now) {
            var e = new enchant.Event('enterframe');
            if (this.currentTime === 0) {
                e.elapsed = 0;
            } else {
                e.elapsed = now - this.currentTime;
            }

            // frame fragment time, will be used in _checkTick
            this._nextTime = now + 1000 / this.fps;
            this.currentTime = now;

            var nodes = this.currentScene.childNodes.slice();
            var push = Array.prototype.push;
            while (nodes.length) {
                var node = nodes.pop();
                node.age++;
                node.dispatchEvent(e);
                if (node.childNodes) {
                    push.apply(nodes, node.childNodes);
                }
            }

            this.currentScene.age++;
            this.currentScene.dispatchEvent(e);
            this.dispatchEvent(e);

            this.dispatchEvent(new enchant.Event('exitframe'));
            this.frame++;
        },
        getTime: function() {
            return window.getTime();
        },

        stop: function() {
            this.ready = false;
            this.running = false;
        },

        pause: function() {
            this.ready = false;
        },

        resume: function() {
            if (this.ready) {
                return;
            }
            this.currentTime = 0;
            this.ready = true;
            this.running = true;
        },

        pushScene: function(scene) {
            if (this.currentScene) {
                this.currentScene.dispatchEvent(new enchant.Event('exit'));
            }
            this.currentScene = scene;
            this.currentScene.dispatchEvent(new enchant.Event('enter'));
            return this._scenes.push(scene);
        },

        popScene: function() {
            if (this.currentScene === this.rootScene) {
                return this.currentScene;
            }
            this._element.removeChild(this.currentScene._element);
            this.currentScene.dispatchEvent(new enchant.Event('exit'));
            this.currentScene = this._scenes[this._scenes.length - 2];
            this.currentScene.dispatchEvent(new enchant.Event('enter'));
            return this._scenes.pop();
        },

        replaceScene: function(scene) {
            this.popScene();
            return this.pushScene(scene);
        },

        removeScene: function(scene) {
            if (this.currentScene === scene) {
                return this.popScene();
            } else {
                var i = this._scenes.indexOf(scene);
                if (i !== -1) {
                    this._scenes.splice(i, 1);
                    this._element.removeChild(scene._element);
                    return scene;
                } else {
                    return null;
                }
            }
        },

        getElapsedTime: function() {
            return this.frame / this.fps;
        }
    });

    enchant.Core.instance = null;
}());

enchant.Node = enchant.Class.create(enchant.EventTarget, {

    initialize: function() {
        enchant.EventTarget.call(this);

        this._dirty = false;

        this._matrix = [ 1, 0, 0, 1, 0, 0 ];

        this._x = 0;
        this._y = 0;
        this._offsetX = 0;
        this._offsetY = 0;


        this.age = 0;


        this.parentNode = null;

        this.scene = null;

        this.addEventListener('touchstart', function(e) {
            if (this.parentNode) {
                this.parentNode.dispatchEvent(e);
            }
        });
        this.addEventListener('touchmove', function(e) {
            if (this.parentNode) {
                this.parentNode.dispatchEvent(e);
            }
        });
        this.addEventListener('touchend', function(e) {
            if (this.parentNode) {
                this.parentNode.dispatchEvent(e);
            }
        });

        if(enchant.ENV.USE_ANIMATION){
            var tl = this.tl = new enchant.Timeline(this);
        }
    },

    moveTo: function(x, y) {
        this._x = x;
        this._y = y;
        this._dirty = true;
    },

    moveBy: function(x, y) {
        this._x += x;
        this._y += y;
        this._dirty = true;
    },

    x: {
        get: function() {
            return this._x;
        },
        set: function(x) {
            this._x = x;
            this._dirty = true;
        }
    },

    y: {
        get: function() {
            return this._y;
        },
        set: function(y) {
            this._y = y;
            this._dirty = true;
        }
    },
    _updateCoordinate: function() {
        var node = this;
        var tree = [ node ];
        var parent = node.parentNode;
        var scene = this.scene;
        while (parent && node._dirty) {
            tree.unshift(parent);
            node = node.parentNode;
            parent = node.parentNode;
        }
        var matrix = enchant.Matrix.instance;
        var stack = matrix.stack;
        var mat = [];
        var newmat, ox, oy;
        stack.push(tree[0]._matrix);
        for (var i = 1, l = tree.length; i < l; i++) {
            node = tree[i];
            newmat = [];
            matrix.makeTransformMatrix(node, mat);
            matrix.multiply(stack[stack.length - 1], mat, newmat);
            node._matrix = newmat;
            stack.push(newmat);
            ox = (typeof node._originX === 'number') ? node._originX : node._width / 2 || 0;
            oy = (typeof node._originY === 'number') ? node._originY : node._height / 2 || 0;
            var vec = [ ox, oy ];
            matrix.multiplyVec(newmat, vec, vec);
            node._offsetX = vec[0] - ox;
            node._offsetY = vec[1] - oy;
            node._dirty = false;
        }
        matrix.reset();
    },
    remove: function() {
        if (this._listener) {
            this.clearEventListener();
        }
        if (this.parentNode) {
            this.parentNode.removeChild(this);
        }
    }
});

var _intersectBetweenClassAndInstance = function(Class, instance) {

    var ret = [];
    var c;
    for (var i = 0, l = Class.collection.length; i < l; i++) {
        c = Class.collection[i];
        if (instance._intersectone(c)) {
            ret.push(c);
        }
    }
    return ret;
};

var _intersectBetweenClassAndClass = function(Class1, Class2) {
    var ret = [];

    var c1, c2;
    for (var i = 0, l = Class1.collection.length; i < l; i++) {
        c1 = Class1.collection[i];
        for (var j = 0, ll = Class2.collection.length; j < ll; j++) {
            c2 = Class2.collection[j];
            if (c1._intersectone(c2)) {
                ret.push([ c1, c2 ]);
            }
        }
    }
    return ret;
};

var _staticintersect = function(other) {
    if (other instanceof enchant.Entity) {
        return _intersectBetweenClassAndInstance(this, other);
    } else if (typeof other === 'function' && other.collection) {
        return _intersectBetweenClassAndClass(this, other);
    }
    return false;
};

/**
 * @scope enchant.Entity.prototype
 */
enchant.Entity = enchant.Class.create(enchant.Node, {

    initialize: function() {
        var core = enchant.Core.instance;
        enchant.Node.call(this);

        this._rotation = 0;
        this._scaleX = 1;
        this._scaleY = 1;
        this._clipping = false;
        this._originX = null;
        this._originY = null;
        this._width = 0;
        this._height = 0;
        this._backgroundColor = null;
        this._opacity = 1;
        this._visible = true;
        this._style = {};
        this.__styleStatus = {};
        this.compositeOperation = null;

        this.enableCollection();
    },

    width: {
        get: function() {
            return this._width;
        },
        set: function(width) {
            this._width = width;
            this._dirty = true;
        }
    },

    height: {
        get: function() {
            return this._height;
        },
        set: function(height) {
            this._height = height;
            this._dirty = true;
        }
    },

    backgroundColor: {
        get: function() {
            return this._backgroundColor;
        },
        set: function(color) {
            this._backgroundColor = color;
        }
    },

    opacity: {
        get: function() {
            return this._opacity;
        },
        set: function(opacity) {
            this._opacity = parseFloat(opacity);
        }
    },

    visible: {
        get: function() {
            return this._visible;
        },
        set: function(visible) {
            this._visible = visible;
        }
    },

    intersect: function(other) {
        if (other instanceof enchant.Entity) {
            return this._intersectone(other);
        } else if (typeof other === 'function' && other.collection) {
            return _intersectBetweenClassAndInstance(other, this);
        }
        return false;
    },
    _intersectone: function(other) {
        if (this._dirty) {
            this._updateCoordinate();
        } if (other._dirty) {
            other._updateCoordinate();
        }
        return this._offsetX < other._offsetX + other.width && other._offsetX < this._offsetX + this.width &&
            this._offsetY < other._offsetY + other.height && other._offsetY < this._offsetY + this.height;
    },

    within: function(other, distance) {
        if (this._dirty) {
            this._updateCoordinate();
        } if (other._dirty) {
            other._updateCoordinate();
        }
        if (distance == null) {
            distance = (this.width + this.height + other.width + other.height) / 4;
        }
        var _;
        return (_ = this._offsetX - other._offsetX + (this.width - other.width) / 2) * _ +
            (_ = this._offsetY - other._offsetY + (this.height - other.height) / 2) * _ < distance * distance;
    },
    scale: function(x, y) {
        this._scaleX *= x;
        this._scaleY *= (y != null) ? y : x;
        this._dirty = true;
    },

    rotate: function(deg) {
        this._rotation += deg;
        this._dirty = true;
    },

    scaleX: {
        get: function() {
            return this._scaleX;
        },
        set: function(scaleX) {
            this._scaleX = scaleX;
            this._dirty = true;
        }
    },

    scaleY: {
        get: function() {
            return this._scaleY;
        },
        set: function(scaleY) {
            this._scaleY = scaleY;
            this._dirty = true;
        }
    },

    rotation: {
        get: function() {
            return this._rotation;
        },
        set: function(rotation) {
            this._rotation = rotation;
            this._dirty = true;
        }
    },

    originX: {
        get: function() {
            return this._originX;
        },
        set: function(originX) {
            this._originX = originX;
            this._dirty = true;
        }
    },

    originY: {
        get: function() {
            return this._originY;
        },
        set: function(originY) {
            this._originY = originY;
            this._dirty = true;
        }
    },

    enableCollection: function() {
        this.addEventListener('addedtoscene', this._addSelfToCollection);
        this.addEventListener('removedfromscene', this._removeSelfFromCollection);
        if (this.scene) {
            this._addSelfToCollection();
        }
    },

    disableCollection: function() {
        this.removeEventListener('addedtoscene', this._addSelfToCollection);
        this.removeEventListener('removedfromscene', this._removeSelfFromCollection);
        if (this.scene) {
            this._removeSelfFromCollection();
        }
    },
    _addSelfToCollection: function() {
        var Constructor = this.getConstructor();
        Constructor._collectionTarget.forEach(function(C) {
            C.collection.push(this);
        }, this);
    },
    _removeSelfFromCollection: function() {
        var Constructor = this.getConstructor();
        Constructor._collectionTarget.forEach(function(C) {
            var i = C.collection.indexOf(this);
            if (i !== -1) {
                C.collection.splice(i, 1);
            }
        }, this);
    },
    getConstructor: function() {
        return Object.getPrototypeOf(this).constructor;
    }
});

var _collectizeConstructor = function(Constructor) {
    if (Constructor._collective) {
        return;
    }
    var rel = enchant.Class.getInheritanceTree(Constructor);
    var i = rel.indexOf(enchant.Entity);
    if (i !== -1) {
        Constructor._collectionTarget = rel.splice(0, i + 1);
    } else {
        Constructor._collectionTarget = [];
    }
    Constructor.intersect = _staticintersect;
    Constructor.collection = [];
    Constructor._collective = true;
};

_collectizeConstructor(enchant.Entity);

enchant.Entity._inherited = function(subclass) {
    _collectizeConstructor(subclass);
};

enchant.Sprite = enchant.Class.create(enchant.Entity, {

    initialize: function(width, height) {
        enchant.Entity.call(this);
        this.width = width;
        this.height = height;
    },

    width: {
        get: function() {
            return this._width;
        },
        set: function(width) {
            this._width = width;
            this._dirty = true;
        }
    },

    height: {
        get: function() {
            return this._height;
        },
        set: function(height) {
            this._height = height;
            this._dirty = true;
        }
    }
});

enchant.Map = enchant.Class.create(enchant.Entity, {

    initialize: function(tileWidth, tileHeight) {
        var core = enchant.Core.instance;

        enchant.Entity.call(this);

		// TODO BDM: Remove hardcoded stuff
		this.width = 320;
		this.height = 200;		
        this._tileWidth = tileWidth || 0;
        this._tileHeight = tileHeight || 0;
        this._image = null;
        this._data = [[[]]];
        this._dirty = false;
        this._tight = false;
        this.touchEnabled = false;
        this.collisionData = null;
    },

    loadData: function(data) {
        this._data = Array.prototype.slice.apply(arguments);
        this._dirty = true;

        this._tight = false;
        for (var i = 0, len = this._data.length; i < len; i++) {
            var c = 0;
            data = this._data[i];
            for (var y = 0, l = data.length; y < l; y++) {
                for (var x = 0, ll = data[y].length; x < ll; x++) {
                    if (data[y][x] >= 0) {
                        c++;
                    }
                }
            }
            if (c / (data.length * data[0].length) > 0.2) {
                this._tight = true;
                break;
            }
        }
    },

    checkTile: function(x, y) {
        if (x < 0 || this.width <= x || y < 0 || this.height <= y) {
            return false;
        }
        var width = this.width;
        var height = this.height;
        var tileWidth = this._tileWidth || width;
        var tileHeight = this._tileHeight || height;
        x = x / tileWidth | 0;
        y = y / tileHeight | 0;
        var data = this._data[0];
        return data[y][x];
    },

    hitTest: function(x, y) {
        if (x < 0 || this.width <= x || y < 0 || this.height <= y) {
            return false;
        }
        var width = this.width;
        var height = this.height;
        var tileWidth = this._tileWidth || width;
        var tileHeight = this._tileHeight || height;
        x = x / tileWidth | 0;
        y = y / tileHeight | 0;
        if (this.collisionData != null) {
            return this.collisionData[y] && !!this.collisionData[y][x];
        } else {
            for (var i = 0, len = this._data.length; i < len; i++) {
                var data = this._data[i];
                var n;
                if (data[y] != null && (n = data[y][x]) != null &&
                    0 <= n && n < (width / tileWidth | 0) * (height / tileHeight | 0)) {
                    return true;
                }
            }
            return false;
        }
    },

    tileWidth: {
        get: function() {
            return this._tileWidth;
        },
        set: function(tileWidth) {
            this._tileWidth = tileWidth;
            this._dirty = true;
        }
    },

    tileHeight: {
        get: function() {
            return this._tileHeight;
        },
        set: function(tileHeight) {
            this._tileHeight = tileHeight;
            this._dirty = true;
        }
    },

    width: {
        get: function() {
            return this._tileWidth * this._data[0][0].length;
        }
    },

    height: {
        get: function() {
            return this._tileHeight * this._data[0].length;
        }
    }
});


enchant.Group = enchant.Class.create(enchant.Node, {

    initialize: function() {

        this.childNodes = [];

        enchant.Node.call(this);

        this._rotation = 0;
        this._scaleX = 1;
        this._scaleY = 1;

        this._originX = null;
        this._originY = null;

        this.__dirty = false;

        [enchant.Event.ADDED_TO_SCENE, enchant.Event.REMOVED_FROM_SCENE]
            .forEach(function(event) {
                this.addEventListener(event, function(e) {
                    this.childNodes.forEach(function(child) {
                        child.scene = this.scene;
                        child.dispatchEvent(e);
                    }, this);
                });
            }, this);
    },

    addChild: function(node) {
        this.childNodes.push(node);
        node.parentNode = this;
        var childAdded = new enchant.Event('childadded');
        childAdded.node = node;
        childAdded.next = null;
        this.dispatchEvent(childAdded);
        node.dispatchEvent(new enchant.Event('added'));
        if (this.scene) {
            node.scene = this.scene;
            var addedToScene = new enchant.Event('addedtoscene');
            node.dispatchEvent(addedToScene);
        }
    },

    insertBefore: function(node, reference) {
        var i = this.childNodes.indexOf(reference);
        if (i !== -1) {
            this.childNodes.splice(i, 0, node);
            node.parentNode = this;
            var childAdded = new enchant.Event('childadded');
            childAdded.node = node;
            childAdded.next = reference;
            this.dispatchEvent(childAdded);
            node.dispatchEvent(new enchant.Event('added'));
            if (this.scene) {
                node.scene = this.scene;
                var addedToScene = new enchant.Event('addedtoscene');
                node.dispatchEvent(addedToScene);
            }
        } else {
            this.addChild(node);
        }
    },

    removeChild: function(node) {
        var i;
        if ((i = this.childNodes.indexOf(node)) !== -1) {
            this.childNodes.splice(i, 1);
            node.parentNode = null;
            var childRemoved = new enchant.Event('childremoved');
            childRemoved.node = node;
            this.dispatchEvent(childRemoved);
            node.dispatchEvent(new enchant.Event('removed'));
            if (this.scene) {
                node.scene = null;
                var removedFromScene = new enchant.Event('removedfromscene');
                node.dispatchEvent(removedFromScene);
            }
        }
    },

    firstChild: {
        get: function() {
            return this.childNodes[0];
        }
    },

    lastChild: {
        get: function() {
            return this.childNodes[this.childNodes.length - 1];
        }
    },

    rotation: {
        get: function() {
            return this._rotation;
        },
        set: function(rotation) {
            this._rotation = rotation;
            this._dirty = true;
        }
    },

    scaleX: {
        get: function() {
            return this._scaleX;
        },
        set: function(scale) {
            this._scaleX = scale;
            this._dirty = true;
        }
    },

    scaleY: {
        get: function() {
            return this._scaleY;
        },
        set: function(scale) {
            this._scaleY = scale;
            this._dirty = true;
        }
    },

    originX: {
        get: function() {
            return this._originX;
        },
        set: function(originX) {
            this._originX = originX;
            this._dirty = true;
        }
    },

    originY: {
        get: function() {
            return this._originY;
        },
        set: function(originY) {
            this._originY = originY;
            this._dirty = true;
        }
    },
    _dirty: {
        get: function() {
            return this.__dirty;
        },
        set: function(dirty) {
            dirty = !!dirty;
            this.__dirty = dirty;
            if (dirty) {
                for (var i = 0, l = this.childNodes.length; i < l; i++) {
                    this.childNodes[i]._dirty = true;
                }
            }
        }
    }
});
enchant.Matrix = enchant.Class.create({
    initialize: function() {
        if (enchant.Matrix.instance) {
            return enchant.Matrix.instance;
        }
        this.reset();
    },
    reset: function() {
        this.stack = [];
        this.stack.push([ 1, 0, 0, 1, 0, 0 ]);
    },
    makeTransformMatrix: function(node, dest) {
        var x = node._x;
        var y = node._y;
        var width = node.width || 0;
        var height = node.height || 0;
        var rotation = node._rotation || 0;
        var scaleX = (typeof node._scaleX === 'number') ? node._scaleX : 1;
        var scaleY = (typeof node._scaleY === 'number') ? node._scaleY : 1;
        var theta = rotation * Math.PI / 180;
        var tmpcos = Math.cos(theta);
        var tmpsin = Math.sin(theta);
        var w = (typeof node._originX === 'number') ? node._originX : width / 2;
        var h = (typeof node._originY === 'number') ? node._originY : height / 2;
        var a = scaleX * tmpcos;
        var b = scaleX * tmpsin;
        var c = scaleY * tmpsin;
        var d = scaleY * tmpcos;
        dest[0] = a;
        dest[1] = b;
        dest[2] = -c;
        dest[3] = d;
        dest[4] = (-a * w + c * h + x + w);
        dest[5] = (-b * w - d * h + y + h);
    },
    multiply: function(m1, m2, dest) {
        var a11 = m1[0], a21 = m1[2], adx = m1[4],
            a12 = m1[1], a22 = m1[3], ady = m1[5];
        var b11 = m2[0], b21 = m2[2], bdx = m2[4],
            b12 = m2[1], b22 = m2[3], bdy = m2[5];

        dest[0] = a11 * b11 + a21 * b12;
        dest[1] = a12 * b11 + a22 * b12;
        dest[2] = a11 * b21 + a21 * b22;
        dest[3] = a12 * b21 + a22 * b22;
        dest[4] = a11 * bdx + a21 * bdy + adx;
        dest[5] = a12 * bdx + a22 * bdy + ady;
    },
    multiplyVec: function(mat, vec, dest) {
        var x = vec[0], y = vec[1];
        var m11 = mat[0], m21 = mat[2], mdx = mat[4],
            m12 = mat[1], m22 = mat[3], mdy = mat[5];
        dest[0] = m11 * x + m21 * y + mdx;
        dest[1] = m12 * x + m22 * y + mdy;
    }
});
enchant.Matrix.instance = new enchant.Matrix();

enchant.DomManager = enchant.Class.create({
    initialize: function(node, elementDefinition) {
        var core = enchant.Core.instance;
        this.layer = null;
        this.targetNode = node;
        if (typeof elementDefinition === 'string') {

        } else if (elementDefinition instanceof HTMLElement) {
            this.element = elementDefinition;
        }

        var manager = this;
        this._setDomTarget = function() {
            manager.layer._touchEventTarget = manager.targetNode;
        };
        this._attachEvent();
    },
    getDomElement: function() {
        return this.element;
    },
    getDomElementAsNext: function() {
        return this.element;
    },
    getNextManager: function(manager) {

            return null;

    },
    addManager: function(childManager, nextManager) {
        var nextElement;
        if (nextManager) {
            nextElement = nextManager.getDomElementAsNext();
        }
        var element = childManager.getDomElement();
        if (element instanceof Array) {
            element.forEach(function(child) {
                this.element.insertBefore(child, nextElement);
            }, this);
        } else {
            this.element.insertBefore(element, nextElement);
        }
        this.setLayer(this.layer);
    },
    removeManager: function(childManager) {
        if (childManager instanceof enchant.DomlessManager) {
            childManager._domRef.forEach(function(element) {
                this.element.removeChild(element);
            }, this);
        } else {
            this.element.removeChild(childManager.element);
        }
        this.setLayer(this.layer);
    },
    setLayer: function(layer) {
        this.layer = layer;
        var node = this.targetNode;
        var manager;

    },
    render: function(inheritMat) {
        var node = this.targetNode;
        var matrix = enchant.Matrix.instance;
        var stack = matrix.stack;
        var dest = [];
        matrix.makeTransformMatrix(node, dest);
        matrix.multiply(stack[stack.length - 1], dest, dest);
        matrix.multiply(inheritMat, dest, inheritMat);
        node._matrix = inheritMat;
        var ox = (typeof node._originX === 'number') ? node._originX : node.width / 2 || 0;
        var oy = (typeof node._originY === 'number') ? node._originY : node.height / 2 || 0;
        var vec = [ ox, oy ];
        matrix.multiplyVec(dest, vec, vec);

        node._offsetX = vec[0] - ox;
        node._offsetY = vec[1] - oy;
        if(node.parentNode && !(node.parentNode instanceof enchant.Group)) {
            node._offsetX += node.parentNode._offsetX;
            node._offsetY += node.parentNode._offsetY;
        }

        this.domRender();
    },
    domRender: function() {
        var node = this.targetNode;
        if(!node._style) {
            node._style = {};
        }
        if(!node.__styleStatus) {
            node.__styleStatus = {};
        }
        node._style.width = node.width + 'px';
        node._style.height = node.height + 'px';
        node._style.opacity = node._opacity;
        node._style['background-color'] = node._backgroundColor;
        if (typeof node._visible !== 'undefined') {
            node._style.display = node._visible ? 'block' : 'none';
        }
        if (typeof node.domRender === 'function') {
            node.domRender(this.element);
        }

    },
    _attachEvent: function() {
        if (enchant.ENV.TOUCH_ENABLED) {
            this.element.addEventListener('touchstart', this._setDomTarget, true);
        }
        this.element.addEventListener('mousedown', this._setDomTarget, true);
    },
    _detachEvent: function() {
        if (enchant.ENV.TOUCH_ENABLED) {
            this.element.removeEventListener('touchstart', this._setDomTarget, true);
        }
        this.element.removeEventListener('mousedown', this._setDomTarget, true);
    },
    remove: function() {
        this._detachEvent();
    }
});

enchant.DomlessManager = enchant.Class.create({
    initialize: function(node) {
        this._domRef = [];
        this.targetNode = node;
    },
    _register: function(element, nextElement) {
        var i = this._domRef.indexOf(nextElement);
        var childNodes;
        if (element instanceof Array) {
            if (i === -1) {
                Array.prototype.push.apply(this._domRef, element);
            } else {
                Array.prototype.splice.apply(this._domRef, [i, 0].concat(element));
            }
        } else {
            if (i === -1) {
                this._domRef.push(element);
            } else {
                this._domRef.splice(i, 0, element);
            }
        }
    },
    getNextManager: function(manager) {

            return null;

    },
    getDomElement: function() {
        var ret = [];

        return ret;
    },
    getDomElementAsNext: function() {
        if (this._domRef.length) {
            return this._domRef[0];
        } else {
            var nextManager = this.getNextManager(this);
            if (nextManager) {
                return nextManager.element;
            } else {
                return null;
            }
        }
    },
    addManager: function(childManager, nextManager) {
        var parentNode = this.targetNode.parentNode;
        if (parentNode) {
            if (nextManager === null) {
                nextManager = this.getNextManager(this);
            }
            if (parentNode instanceof enchant.Scene) {
                parentNode._layers.Dom._domManager.addManager(childManager, nextManager);
            } else {
                parentNode._domManager.addManager(childManager, nextManager);
            }
        }
        var nextElement = nextManager ? nextManager.getDomElementAsNext() : null;
        this._register(childManager.getDomElement(), nextElement);
        this.setLayer(this.layer);
    },
    removeManager: function(childManager) {
        var dom;
        var i = this._domRef.indexOf(childManager.element);
        if (i !== -1) {
            dom = this._domRef[i];
            dom.parentNode.removeChild(dom);
            this._domRef.splice(i, 1);
        }
        this.setLayer(this.layer);
    },
    setLayer: function(layer) {
        this.layer = layer;
        var node = this.targetNode;
        var manager;

    },
    render: function(inheritMat) {
        var matrix = enchant.Matrix.instance;
        var stack = matrix.stack;
        var node = this.targetNode;
        var dest = [];
        matrix.makeTransformMatrix(node, dest);
        matrix.multiply(stack[stack.length - 1], dest, dest);
        matrix.multiply(inheritMat, dest, inheritMat);
        node._matrix = inheritMat;
        var ox = (typeof node._originX === 'number') ? node._originX : node.width / 2 || 0;
        var oy = (typeof node._originY === 'number') ? node._originY : node.height / 2 || 0;
        var vec = [ ox, oy ];
        matrix.multiplyVec(dest, vec, vec);
        node._offsetX = vec[0] - ox;
        node._offsetY = vec[1] - oy;
        stack.push(dest);
    },
    remove: function() {
        this._domRef = [];
        this.targetNode = null;
    }
});

enchant.DomLayer = enchant.Class.create(enchant.Group, {
    initialize: function() {
        var core = enchant.Core.instance;
        enchant.Group.call(this);

        this.width = this._width = core.width;
        this.height = this._height = core.height;

        this._touchEventTarget = null;

        this._domManager = new enchant.DomManager(this, this._element);
        this._domManager.layer = this;

        var touch = [
            enchant.Event.TOUCH_START,
            enchant.Event.TOUCH_MOVE,
            enchant.Event.TOUCH_END
        ];

        touch.forEach(function(type) {
            this.addEventListener(type, function(e) {
                if (this._scene) {
                    this._scene.dispatchEvent(e);
                }
            });
        }, this);

        var __onchildadded = function(e) {
            var child = e.node;
            var next = e.next;
            var self = e.target;
            var nextManager = next ? next._domManager : null;
            enchant.DomLayer._attachDomManager(child, __onchildadded, __onchildremoved);
            self._domManager.addManager(child._domManager, nextManager);
            var render = new enchant.Event(enchant.Event.RENDER);
            child._dirty = true;
            self._domManager.layer._rendering(child, render);
        };

        var __onchildremoved = function(e) {
            var child = e.node;
            var self = e.target;
            self._domManager.removeManager(child._domManager);
            enchant.DomLayer._detachDomManager(child, __onchildadded, __onchildremoved);
        };

        this.addEventListener('childremoved', __onchildremoved);
        this.addEventListener('childadded', __onchildadded);

    },
    _startRendering: function() {
        this.addEventListener('exitframe', this._onexitframe);
        this._onexitframe();
    },
    _stopRendering: function() {
        this.removeEventListener('exitframe', this._onexitframe);
        this._onexitframe();
    },
    _onexitframe: function() {
        this._rendering(this, new enchant.Event(enchant.Event.RENDER));
    },
    _rendering: function(node, e, inheritMat) {
        var child;
        if (!inheritMat) {
            inheritMat = [ 1, 0, 0, 1, 0, 0 ];
        }
        node.dispatchEvent(e);
        node._domManager.render(inheritMat);

        if (node._domManager instanceof enchant.DomlessManager) {
            enchant.Matrix.instance.stack.pop();
        }
        node._dirty = false;
    },
    _determineEventTarget: function() {
        if (this._touchEventTarget) {
            if (this._touchEventTarget !== this) {
                return this._touchEventTarget;
            }
        }
        return null;
    }
});

enchant.DomLayer._attachDomManager = function(node, onchildadded, onchildremoved) {
    var child;
    if (!node._domManager) {
        node.addEventListener('childadded', onchildadded);
        node.addEventListener('childremoved', onchildremoved);
        if (node instanceof enchant.Group) {
            node._domManager = new enchant.DomlessManager(node);
        } else {
            if (node._element) {
                node._domManager = new enchant.DomManager(node, node._element);
            } else {
                node._domManager = new enchant.DomManager(node, 'div');
            }
        }
    }

};

enchant.DomLayer._detachDomManager = function(node, onchildadded, onchildremoved) {
    var child;
    node.removeEventListener('childadded', onchildadded);
    node.removeEventListener('childremoved', onchildremoved);

    node._domManager.remove();
    delete node._domManager;
};

enchant.CanvasLayer = enchant.Class.create(enchant.Group, {

    initialize: function() {
        var core = enchant.Core.instance;

        enchant.Group.call(this);

        this._cvsCache = {
            matrix: [1, 0, 0, 1, 0, 0]
        };
        this._cvsCache.layer = this;

        this.width = core.width;
        this.height = core.height;

        this._lastDetected = 0;

        var touch = [
            enchant.Event.TOUCH_START,
            enchant.Event.TOUCH_MOVE,
            enchant.Event.TOUCH_END
        ];

        touch.forEach(function(type) {
            this.addEventListener(type, function(e) {
                if (this._scene) {
                    this._scene.dispatchEvent(e);
                }
            });
        }, this);

        var __onchildadded = function(e) {
            var child = e.node;
            var self = e.target;
            var layer;
            if (self instanceof enchant.CanvasLayer) {
                layer = self._scene._layers.Canvas;
            } else {
                layer = self.scene._layers.Canvas;
            }
            enchant.CanvasLayer._attachCache(child, layer, __onchildadded, __onchildremoved);
            var render = new enchant.Event(enchant.Event.RENDER);
            if (self._dirty) {
                self._updateCoordinate();
            }
            child._dirty = true;
            enchant.Matrix.instance.stack.push(self._matrix);
            layer._rendering(child, render);
            enchant.Matrix.instance.stack.pop(self._matrix);
        };

        var __onchildremoved = function(e) {
            var child = e.node;
            var self = e.target;
            var layer;
            if (self instanceof enchant.CanvasLayer) {
                layer = self._scene._layers.Canvas;
            } else {
                layer = self.scene._layers.Canvas;
            }
            enchant.CanvasLayer._detachCache(child, layer, __onchildadded, __onchildremoved);
        };

        this.addEventListener('childremoved', __onchildremoved);
        this.addEventListener('childadded', __onchildadded);

    },

    _startRendering: function() {
        this.addEventListener('exitframe', this._onexitframe);
        this._onexitframe(new enchant.Event(enchant.Event.RENDER));
    },

    _stopRendering: function() {
        this.removeEventListener('render', this._onexitframe);
        this._onexitframe(new enchant.Event(enchant.Event.RENDER));
    },
    _onexitframe: function() {
        var core = enchant.Core.instance;
        var render = new enchant.Event(enchant.Event.RENDER);
        this._rendering(this, render);
    },
    _rendering:  function(node, e) {
        var matrix = enchant.Matrix.instance;
        node.dispatchEvent(e);
        enchant.Matrix.instance.stack.pop();
    },
    _detectrendering: function(node) {

        enchant.Matrix.instance.stack.pop();
    },
    _transform: function(node, ctx) {
        var matrix = enchant.Matrix.instance;
        var stack = matrix.stack;
        var newmat;
        if (node._dirty) {
            matrix.makeTransformMatrix(node, node._cvsCache.matrix);
            newmat = [];
            matrix.multiply(stack[stack.length - 1], node._cvsCache.matrix, newmat);
            node._matrix = newmat;
        } else {
            newmat = node._matrix;
        }
        stack.push(newmat);
        ctx.setTransform.apply(ctx, newmat);
        var ox = (typeof node._originX === 'number') ? node._originX : node._width / 2 || 0;
        var oy = (typeof node._originY === 'number') ? node._originY : node._height / 2 || 0;
        var vec = [ ox, oy ];
        matrix.multiplyVec(newmat, vec, vec);
        node._offsetX = vec[0] - ox;
        node._offsetY = vec[1] - oy;
        node._dirty = false;

    },
    _determineEventTarget: function(e) {
        return this._getEntityByPosition(e.x, e.y);
    },
    _getEntityByPosition: function(x, y) {
        var core = enchant.Core.instance;
        if (this._lastDetected < core.frame) {
            this._detectrendering(this);
            this._lastDetected = core.frame;
        }
        return '';
    }
});

enchant.CanvasLayer._attachCache = function(node, layer, onchildadded, onchildremoved) {
    var child;
    if (!node._cvsCache) {
        node._cvsCache = {};
        node._cvsCache.matrix = [ 1, 0, 0, 1, 0, 0 ];
        node.addEventListener('childadded', onchildadded);
        node.addEventListener('childremoved', onchildremoved);
    }

};

enchant.CanvasLayer._detachCache = function(node, layer, onchildadded, onchildremoved) {
    var child;
    if (node._cvsCache) {
        node.removeEventListener('childadded', onchildadded);
        node.removeEventListener('childremoved', onchildremoved);
        delete node._cvsCache;
    }

};

enchant.Scene = enchant.Class.create(enchant.Group, {

    initialize: function() {
        var core = enchant.Core.instance;

        // Call initialize method of enchant.Group
        enchant.Group.call(this);

        this.width = core.width;
        this.height = core.height;

        // All nodes (entities, groups, scenes) have reference to the scene that it belongs to.
        this.scene = this;

        this._layers = {};
        this._layerPriority = [];

        this.addEventListener(enchant.Event.CHILD_ADDED, this._onchildadded);
        this.addEventListener(enchant.Event.CHILD_REMOVED, this._onchildremoved);
        this.addEventListener(enchant.Event.ENTER, this._onenter);
        this.addEventListener(enchant.Event.EXIT, this._onexit);

        var that = this;
        this._dispatchExitframe = function() {
            var layer;
            for (var prop in that._layers) {
                layer = that._layers[prop];
                layer.dispatchEvent(new enchant.Event(enchant.Event.EXIT_FRAME));
            }
        };
    },
    x: {
        get: function() {
            return this._x;
        },
        set: function(x) {
            this._x = x;
            for (var type in this._layers) {
                this._layers[type].x = x;
            }
        }
    },
    y: {
        get: function() {
            return this._y;
        },
        set: function(y) {
            this._y = y;
            for (var type in this._layers) {
                this._layers[type].y = y;
            }
        }
    },
    rotation: {
        get: function() {
            return this._rotation;
        },
        set: function(rotation) {
            this._rotation = rotation;
            for (var type in this._layers) {
                this._layers[type].rotation = rotation;
            }
        }
    },
    scaleX: {
        get: function() {
            return this._scaleX;
        },
        set: function(scaleX) {
            this._scaleX = scaleX;
            for (var type in this._layers) {
                this._layers[type].scaleX = scaleX;
            }
        }
    },
    scaleY: {
        get: function() {
            return this._scaleY;
        },
        set: function(scaleY) {
            this._scaleY = scaleY;
            for (var type in this._layers) {
                this._layers[type].scaleY = scaleY;
            }
        }
    },
    backgroundColor: {
        get: function() {
            return this._backgroundColor;
        },
        set: function(color) {

        }
    },
    addLayer: function(type, i) {
        var core = enchant.Core.instance;
        if (this._layers[type]) {
            return;
        }
        var layer = new enchant[type + 'Layer']();
        if (core.currentScene === this) {
            layer._startRendering();
        }
        this._layers[type] = layer;
        var element = layer._element;
        if (typeof i === 'number') {

            this._layerPriority.splice(i, 0, type);
        } else {
            this._layerPriority.push(type);
        }
        layer._scene = this;
    },
    _determineEventTarget: function(e) {
        var layer, target;
        for (var i = this._layerPriority.length - 1; i >= 0; i--) {
            layer = this._layers[this._layerPriority[i]];
            target = layer._determineEventTarget(e);
            if (target) {
                break;
            }
        }
        if (!target) {
            target = this;
        }
        return target;
    },
    _onchildadded: function(e) {
        var child = e.node;
        var next = e.next;
        if (child._element) {
            if (!this._layers.Dom) {
                this.addLayer('Dom', 1);
            }
            this._layers.Dom.insertBefore(child, next);
            child._layer = this._layers.Dom;
        } else {
            if (!this._layers.Canvas) {
                this.addLayer('Canvas', 0);
            }
            this._layers.Canvas.insertBefore(child, next);
            child._layer = this._layers.Canvas;
        }
        child.parentNode = this;
    },
    _onchildremoved: function(e) {
        var child = e.node;
        child._layer.removeChild(child);
        child._layer = null;
    },
    _onenter: function() {
        for (var type in this._layers) {
            this._layers[type]._startRendering();
        }
        enchant.Core.instance.addEventListener('exitframe', this._dispatchExitframe);
    },
    _onexit: function() {
        for (var type in this._layers) {
            this._layers[type]._stopRendering();
        }
        enchant.Core.instance.removeEventListener('exitframe', this._dispatchExitframe);
    }
});

enchant.CanvasScene = enchant.Class.create(enchant.Scene, {
    initialize: function() {
        enchant.Scene.call(this);
        this.addLayer('Canvas');
    },
    _determineEventTarget: function(e) {
        var target = this._layers.Canvas._determineEventTarget(e);
        if (!target) {
            target = this;
        }
        return target;
    },
    _onchildadded: function(e) {
        var child = e.node;
        var next = e.next;
        this._layers.Canvas.insertBefore(child, next);
        child._layer = this._layers.Canvas;
    },
    _onenter: function() {
        this._layers.Canvas._startRendering();
        enchant.Game.instance.addEventListener('exitframe', this._dispatchExitframe);
    },
    _onexit: function() {
        this._layers.Canvas._stopRendering();
        enchant.Game.instance.removeEventListener('exitframe', this._dispatchExitframe);
    }
});

/**
 * @scope enchant.CanvasScene.prototype
 * @type {*}
 */
enchant.DOMScene = enchant.Class.create(enchant.Scene, {
    initialize: function() {
        enchant.Scene.call(this);
        this.addLayer('Dom');
    },
    _determineEventTarget: function(e) {
        var target = this._layers.Dom._determineEventTarget(e);
        if (!target) {
            target = this;
        }
        return target;
    },
    _onchildadded: function(e) {
        var child = e.node;
        var next = e.next;
        this._layers.Dom.insertBefore(child, next);
        child._layer = this._layers.Dom;
    },
    _onenter: function() {
        this._layers.Dom._startRendering();
        enchant.Game.instance.addEventListener('exitframe', this._dispatchExitframe);
    },
    _onexit: function() {
        this._layers.Dom._stopRendering();
        enchant.Game.instance.removeEventListener('exitframe', this._dispatchExitframe);
    }
});

enchant.Surface = enchant.Class.create(enchant.EventTarget, {

    initialize: function(width, height) {
        enchant.EventTarget.call(this);
        var core = enchant.Core.instance;
        this.width = width;
        this.height = height;
        var id = 'enchant-surface' + core._surfaceID++;
    },

    clone: function() {
        var clone = new enchant.Surface(this.width, this.height);
        return clone;
    },

    toDataURL: function() {
        var src = this._element.src;
        if (src) {
            if (src.slice(0, 5) === 'data:') {
                return src;
            } else {
                return this.clone().toDataURL();
            }
        } else {
            return this._element.toDataURL();
        }
    }
});

enchant.Surface.load = function(src, callback) {
    var surface = Object.create(enchant.Surface.prototype, {
    });
    enchant.EventTarget.call(surface);
    return surface;
};


/**
 * ============================================================================================
 * Easing Equations v2.0
 * September 1, 2003
 * (c) 2003 Robert Penner, all rights reserved.
 * This work is subject to the terms in http://www.robertpenner.com/easing_terms_of_use.html.
 * ============================================================================================
 */

/**
 * [lang:ja]
 * イージング関数ライブラリ
 * {@link enchant.Easing} 以下にある関数は全て t(現在の時刻), b(初期値), c(変化後の値), d(値の変化にかける時間) の引数を取り、指定した時刻に取る値を返す。
 * ActionScript で広く使われている Robert Penner による Easing Equations を JavaScript に移植した。
 *
 * @see http://www.robertpenner.com/easing/
 * @see http://www.robertpenner.com/easing/penner_chapter7_tweening.pdf
 *
 * [/lang]
 * [lang:en]
 * [/lang]
 * Easing function library, from "Easing Equations" by Robert Penner.
 * @type {Object}
 * @namespace
 * {@link enchant.Tween} クラスで用いるイージング関数のライブラリ名前空間.
 */
enchant.Easing = {
    /**
     * @param t
     * @param b
     * @param c
     * @param d
     * @return {Number}
     */
    LINEAR: function(t, b, c, d) {
        return c * t / d + b;
    },
    /**
     * @param t
     * @param b
     * @param c
     * @param d
     * @return {Number}
     */
    SWING: function(t, b, c, d) {
        return c * (0.5 - Math.cos(((t / d) * Math.PI)) / 2) + b;
    },
    // quad
    /**
     * @param t
     * @param b
     * @param c
     * @param d
     * @return {Number}
     */
    QUAD_EASEIN: function(t, b, c, d) {
        return c * (t /= d) * t + b;
    },
    /**
     * @param t
     * @param b
     * @param c
     * @param d
     * @return {Number}
     */
    QUAD_EASEOUT: function(t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
    },
    /**
     * @param t
     * @param b
     * @param c
     * @param d
     * @return {Number}
     */
    QUAD_EASEINOUT: function(t, b, c, d) {
        if ((t /= d / 2) < 1) {
            return c / 2 * t * t + b;
        }
        return -c / 2 * ((--t) * (t - 2) - 1) + b;
    },
    // cubic
    /**
     * @param t
     * @param b
     * @param c
     * @param d
     * @return {Number}
     */
    CUBIC_EASEIN: function(t, b, c, d) {
        return c * (t /= d) * t * t + b;
    },
    /**
     * @param t
     * @param b
     * @param c
     * @param d
     * @return {Number}
     */
    CUBIC_EASEOUT: function(t, b, c, d) {
        return c * ((t = t / d - 1) * t * t + 1) + b;
    },
    /**
     * @param t
     * @param b
     * @param c
     * @param d
     * @return {Number}
     */
    CUBIC_EASEINOUT: function(t, b, c, d) {
        if ((t /= d / 2) < 1) {
            return c / 2 * t * t * t + b;
        }
        return c / 2 * ((t -= 2) * t * t + 2) + b;
    },
    // quart
    /**
     * @param t
     * @param b
     * @param c
     * @param d
     * @return {Number}
     */
    QUART_EASEIN: function(t, b, c, d) {
        return c * (t /= d) * t * t * t + b;
    },
    /**
     * @param t
     * @param b
     * @param c
     * @param d
     * @return {Number}
     */
    QUART_EASEOUT: function(t, b, c, d) {
        return -c * ((t = t / d - 1) * t * t * t - 1) + b;
    },
    /**
     * @param t
     * @param b
     * @param c
     * @param d
     * @return {Number}
     */
    QUART_EASEINOUT: function(t, b, c, d) {
        if ((t /= d / 2) < 1) {
            return c / 2 * t * t * t * t + b;
        }
        return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
    },
    // quint
    /**
     * @param t
     * @param b
     * @param c
     * @param d
     * @return {Number}
     */
    QUINT_EASEIN: function(t, b, c, d) {
        return c * (t /= d) * t * t * t * t + b;
    },
    /**
     * @param t
     * @param b
     * @param c
     * @param d
     * @return {Number}
     */
    QUINT_EASEOUT: function(t, b, c, d) {
        return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
    },
    /**
     * @param t
     * @param b
     * @param c
     * @param d
     * @return {Number}
     */
    QUINT_EASEINOUT: function(t, b, c, d) {
        if ((t /= d / 2) < 1) {
            return c / 2 * t * t * t * t * t + b;
        }
        return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
    },
    //sin
    /**
     * @param t
     * @param b
     * @param c
     * @param d
     * @return {Number}
     */
    SIN_EASEIN: function(t, b, c, d) {
        return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
    },
    /**
     * @param t
     * @param b
     * @param c
     * @param d
     * @return {Number}
     */
    SIN_EASEOUT: function(t, b, c, d) {
        return c * Math.sin(t / d * (Math.PI / 2)) + b;
    },
    /**
     * @param t
     * @param b
     * @param c
     * @param d
     * @return {Number}
     */
    SIN_EASEINOUT: function(t, b, c, d) {
        return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
    },
    // circ
    /**
     * @param t
     * @param b
     * @param c
     * @param d
     * @return {Number}
     */
    CIRC_EASEIN: function(t, b, c, d) {
        return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
    },
    /**
     * @param t
     * @param b
     * @param c
     * @param d
     * @return {Number}
     */
    CIRC_EASEOUT: function(t, b, c, d) {
        return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
    },
    /**
     * @param t
     * @param b
     * @param c
     * @param d
     * @return {Number}
     */
    CIRC_EASEINOUT: function(t, b, c, d) {
        if ((t /= d / 2) < 1) {
            return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
        }
        return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
    },
    // elastic
    /**
     * @param t
     * @param b
     * @param c
     * @param d
     * @return {Number}
     */
    ELASTIC_EASEIN: function(t, b, c, d, a, p) {
        if (t === 0) {
            return b;
        }
        if ((t /= d) === 1) {
            return b + c;
        }

        if (!p) {
            p = d * 0.3;
        }

        var s;
        if (!a || a < Math.abs(c)) {
            a = c;
            s = p / 4;
        } else {
            s = p / (2 * Math.PI) * Math.asin(c / a);
        }
        return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
    },
    /**
     * @param t
     * @param b
     * @param c
     * @param d
     * @return {Number}
     */
    ELASTIC_EASEOUT: function(t, b, c, d, a, p) {
        if (t === 0) {
            return b;
        }
        if ((t /= d) === 1) {
            return b + c;
        }
        if (!p) {
            p = d * 0.3;
        }
        var s;
        if (!a || a < Math.abs(c)) {
            a = c;
            s = p / 4;
        } else {
            s = p / (2 * Math.PI) * Math.asin(c / a);
        }
        return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
    },
    /**
     * @param t
     * @param b
     * @param c
     * @param d
     * @return {Number}
     */
    ELASTIC_EASEINOUT: function(t, b, c, d, a, p) {
        if (t === 0) {
            return b;
        }
        if ((t /= d / 2) === 2) {
            return b + c;
        }
        if (!p) {
            p = d * (0.3 * 1.5);
        }
        var s;
        if (!a || a < Math.abs(c)) {
            a = c;
            s = p / 4;
        } else {
            s = p / (2 * Math.PI) * Math.asin(c / a);
        }
        if (t < 1) {
            return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        }
        return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + c + b;
    },
    // bounce
    /**
     * @param t
     * @param b
     * @param c
     * @param d
     * @return {Number}
     */
    BOUNCE_EASEOUT: function(t, b, c, d) {
        if ((t /= d) < (1 / 2.75)) {
            return c * (7.5625 * t * t) + b;
        } else if (t < (2 / 2.75)) {
            return c * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75) + b;
        } else if (t < (2.5 / 2.75)) {
            return c * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375) + b;
        } else {
            return c * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375) + b;
        }
    },
    /**
     * @param t
     * @param b
     * @param c
     * @param d
     * @return {Number}
     */
    BOUNCE_EASEIN: function(t, b, c, d) {
        return c - enchant.Easing.BOUNCE_EASEOUT(d - t, 0, c, d) + b;
    },
    /**
     * @param t
     * @param b
     * @param c
     * @param d
     * @return {Number}
     */
    BOUNCE_EASEINOUT: function(t, b, c, d) {
        if (t < d / 2) {
            return enchant.Easing.BOUNCE_EASEIN(t * 2, 0, c, d) * 0.5 + b;
        } else {
            return enchant.Easing.BOUNCE_EASEOUT(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
        }

    },
    // back
    /**
     * @param t
     * @param b
     * @param c
     * @param d
     * @return {Number}
     */
    BACK_EASEIN: function(t, b, c, d, s) {
        if (s === undefined) {
            s = 1.70158;
        }
        return c * (t /= d) * t * ((s + 1) * t - s) + b;
    },
    /**
     * @param t
     * @param b
     * @param c
     * @param d
     * @return {Number}
     */
    BACK_EASEOUT: function(t, b, c, d, s) {
        if (s === undefined) {
            s = 1.70158;
        }
        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
    },
    /**
     * @param t
     * @param b
     * @param c
     * @param d
     * @return {Number}
     */
    BACK_EASEINOUT: function(t, b, c, d, s) {
        if (s === undefined) {
            s = 1.70158;
        }
        if ((t /= d / 2) < 1) {
            return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
        }
        return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
    },
    // expo
    /**
     * @param t
     * @param b
     * @param c
     * @param d
     * @return {Number}
     */
    EXPO_EASEIN: function(t, b, c, d) {
        return (t === 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
    },
    /**
     * @param t
     * @param b
     * @param c
     * @param d
     * @return {Number}
     */
    EXPO_EASEOUT: function(t, b, c, d) {
        return (t === d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
    },
    /**
     * @param t
     * @param b
     * @param c
     * @param d
     * @return {Number}
     */
    EXPO_EASEINOUT: function(t, b, c, d) {
        if (t === 0) {
            return b;
        }
        if (t === d) {
            return b + c;
        }
        if ((t /= d / 2) < 1) {
            return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
        }
        return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
    }
};

/**
 * Easing Equations v2.0
 */

enchant.ActionEventTarget = enchant.Class.create(enchant.EventTarget, {

    initialize: function() {
        enchant.EventTarget.apply(this, arguments);
    },

    dispatchEvent: function(e) {
        var target;
        if (this.node) {
            target = this.node;
            e.target = target;
            e.localX = e.x - target._offsetX;
            e.localY = e.y - target._offsetY;
        } else {
            this.node = null;
        }

        if (this['on' + e.type] != null) {
            this['on' + e.type].call(target, e);
        }
        var listeners = this._listeners[e.type];
        if (listeners != null) {
            listeners = listeners.slice();
            for (var i = 0, len = listeners.length; i < len; i++) {
                listeners[i].call(target, e);
            }
        }
    }
});

enchant.Timeline = enchant.Class.create(enchant.EventTarget, {

    initialize: function(node) {
        enchant.EventTarget.call(this);
        this.node = node;
        this.queue = [];
        this.paused = false;
        this.looped = false;
        this.isFrameBased = true;
        this._parallel = null;
        this._activated = false;
        this.addEventListener(enchant.Event.ENTER_FRAME, this.tick);
    },
    /**
     * @private
     */
    _deactivateTimeline: function() {
        if (this._activated) {
            this._activated = false;
            this.node.removeEventListener('enterframe', this._nodeEventListener);
        }
    },
    /**
     * @private
     */
    _activateTimeline: function() {
        if (!this._activated && !this.paused) {
            this.node.addEventListener("enterframe", this._nodeEventListener);
            this._activated = true;
        }
    },

    setFrameBased: function() {
        this.isFrameBased = true;
    },

    setTimeBased: function() {
        this.isFrameBased = false;
    },

    next: function(remainingTime) {
        var e, action = this.queue.shift();
        e = new enchant.Event("actionend");
        e.timeline = this;
        action.dispatchEvent(e);

        if (this.queue.length === 0) {
            this._activated = false;
            this.node.removeEventListener('enterframe', this._nodeEventListener);
            return;
        }

        if (this.looped) {
            e = new enchant.Event("removedfromtimeline");
            e.timeline = this;
            action.dispatchEvent(e);
            action.frame = 0;

            this.add(action);
        } else {
            // remove after dispatching removedfromtimeline event
            e = new enchant.Event("removedfromtimeline");
            e.timeline = this;
            action.dispatchEvent(e);
        }
        if (remainingTime > 0 || (this.queue[0] && this.queue[0].time === 0)) {
            var event = new enchant.Event("enterframe");
            event.elapsed = remainingTime;
            this.dispatchEvent(event);
        }
    },

    tick: function(enterFrameEvent) {
        if (this.paused) {
            return;
        }
        if (this.queue.length > 0) {
            var action = this.queue[0];
            if (action.frame === 0) {
                var f;
                f = new enchant.Event("actionstart");
                f.timeline = this;
                action.dispatchEvent(f);
            }

            var e = new enchant.Event("actiontick");
            e.timeline = this;
            if (this.isFrameBased) {
                e.elapsed = 1;
            } else {
                e.elapsed = enterFrameEvent.elapsed;
            }
            action.dispatchEvent(e);
        }
    },
    add: function(action) {
        if (!this._activated) {
            var tl = this;
            this._nodeEventListener = function(e) {
                tl.dispatchEvent(e);
            };
            this.node.addEventListener("enterframe", this._nodeEventListener);

            this._activated = true;
        }
        if (this._parallel) {
            this._parallel.actions.push(action);
            this._parallel = null;
        } else {
            this.queue.push(action);
        }
        action.frame = 0;

        var e = new enchant.Event("addedtotimeline");
        e.timeline = this;
        action.dispatchEvent(e);

        e = new enchant.Event("actionadded");
        e.action = action;
        this.dispatchEvent(e);

        return this;
    },
    /**
     * [lang:ja]
     * アクションを簡単に追加するためのメソッド。
     * 実体は add メソッドのラッパ。
     * @param params アクションの設定オブジェクト
     * [/lang]
     */
    action: function(params) {
        return this.add(new enchant.Action(params));
    },
    /**
     * [lang:ja]
     * トゥイーンを簡単に追加するためのメソッド。
     * 実体は add メソッドのラッパ。
     * @param params トゥイーンの設定オブジェクト。
     * [/lang]
     */
    tween: function(params) {
        return this.add(new enchant.Tween(params));
    },
    /**
     * [lang:ja]
     * タイムラインのキューをすべて破棄する。終了イベントは発行されない。
     * [/lang]
     */
    clear: function() {
        var e = new enchant.Event("removedfromtimeline");
        e.timeline = this;

        for (var i = 0, len = this.queue.length; i < len; i++) {
            this.queue[i].dispatchEvent(e);
        }
        this.queue = [];
        this._deactivateTimeline();
        return this;
    },
    /**
     * [lang:ja]
     * タイムラインを早送りする。
     * 指定したフレーム数が経過したのと同様の処理を、瞬時に実行する。
     * 巻き戻しはできない。
     * @param frames
     * [/lang]
     */
    skip: function(frames) {
        var event = new enchant.Event("enterframe");
        if (this.isFrameBased) {
            event.elapsed = 1;
        } else {
            event.elapsed = frames;
            frames = 1;
        }
        while (frames--) {
            this.dispatchEvent(event);
        }
        return this;
    },
    /**
     * [lang:ja]
     * タイムラインの実行を一時停止する
     * [/lang]
     */
    pause: function() {
        if (!this.paused) {
            this.paused = true;
            this._deactivateTimeline();
        }
        return this;
    },
    /**
     * [lang:ja]
     * タイムラインの実行を再開する
     * [/lang]
     */
    resume: function() {
        if (this.paused) {
            this.paused = false;
            this._activateTimeline();
        }
        return this;
    },
    /**
     * [lang:ja]
     * タイムラインをループさせる。
     * ループしているときに終了したアクションは、タイムラインから取り除かれた後
     * 再度タイムラインに追加される。このアクションは、ループが解除されても残る。
     * [/lang]
     */
    loop: function() {
        this.looped = true;
        return this;
    },
    /**
     * [lang:ja]
     * タイムラインのループを解除する。
     * [/lang]
     */
    unloop: function() {
        this.looped = false;
        return this;
    },
    /**
     * [lang:ja]
     * 指定したフレーム数だけ待ち、何もしないアクションを追加する。
     * @param time
     * [/lang]
     */
    delay: function(time) {
        this.add(new enchant.Action({
            time: time
        }));
        return this;
    },
    /**
     * [lang:ja]
     * @ignore
     * @param time
     * [/lang]
     */
    wait: function(time) {
        // reserved
        return this;
    },
    /**
     * [lang:ja]
     * 関数を実行し、即時に次のアクションに移るアクションを追加する。
     * @param func
     * [/lang]
     */
    then: function(func) {
        var timeline = this;
        this.add(new enchant.Action({
            onactiontick: function(evt) {
                func.call(timeline.node);
            },
            // if time is 0, next action will be immediately executed
            time: 0
        }));
        return this;
    },
    /**
     * [lang:ja]
     * then メソッドのシノニム。
     * 関数を実行し、即時に次のアクションに移る。
     * @param func
     * [/lang]
     */
    exec: function(func) {
        this.then(func);
    },
    /**
     * [lang:ja]
     * 実行したい関数を、フレーム数をキーとした連想配列(オブジェクト)で複数指定し追加する。
     * 内部的には delay, then を用いている。
     *
     * @example
     * sprite.tl.cue({
     *    10: function(){ 10フレーム経過した後に実行される関数 },
     *    20: function(){ 20フレーム経過した後に実行される関数 },
     *    30: function(){ 30フレーム経過した後に実行される関数 }
     * });
     * @param cue キューオブジェクト
     * [/lang]
     */
    cue: function(cue) {
        var ptr = 0;
        for (var frame in cue) {
            if (cue.hasOwnProperty(frame)) {
                this.delay(frame - ptr);
                this.then(cue[frame]);
                ptr = frame;
            }
        }
    },
    /**
     * [lang:ja]
     * ある関数を指定したフレーム数繰り返し実行するアクションを追加する。
     * @param func 実行したい関数
     * @param time 持続フレーム数
     * [/lang]
     */
    repeat: function(func, time) {
        this.add(new enchant.Action({
            onactiontick: function(evt) {
                func.call(this);
            },
            time: time
        }));
        return this;
    },
    /**
     * [lang:ja]
     * 複数のアクションを並列で実行したいときに指定する。
     * and で結ばれたすべてのアクションが終了するまで次のアクションには移行しない
     * @example
     * sprite.tl.fadeIn(30).and.rotateBy(360, 30);
     * 30フレームでフェードインしながら 360度回転する
     * [/lang]
     */
    and: function() {
        var last = this.queue.pop();
        if (last instanceof enchant.ParallelAction) {
            this._parallel = last;
            this.queue.push(last);
        } else {
            var parallel = new enchant.ParallelAction();
            parallel.actions.push(last);
            this.queue.push(parallel);
            this._parallel = parallel;
        }
        return this;
    },
    /**
     * @ignore
     */
    or: function() {
        return this;
    },
    /**
     * @ignore
     */
    doAll: function(children) {
        return this;
    },
    /**
     * @ignore
     */
    waitAll: function() {
        return this;
    },
    /**
     * [lang:ja]
     * true値 が返るまで、関数を毎フレーム実行するアクションを追加する。
     * @example
     * sprite.tl.waitUntil(function(){
     *    return this.x-- < 0
     * }).then(function(){ .. });
     * // x 座標が負になるまで毎フレーム x座標を減算し続ける
     *
     * @param func 実行したい関数
     * [/lang]
     */
    waitUntil: function(func) {
        var timeline = this;
        this.add(new enchant.Action({
            onactionstart: func,
            onactiontick: function(evt) {
                if (func.call(this)) {
                    timeline.next();
                }
            }
        }));
        return this;
    },
    /**
     * [lang:ja]
     * Entity の不透明度をなめらかに変えるアクションを追加する。
     * @param opacity 目標の不透明度
     * @param time フレーム数
     * @param [easing] イージング関数
     * [/lang]
     */
    fadeTo: function(opacity, time, easing) {
        this.tween({
            opacity: opacity,
            time: time,
            easing: easing
        });
        return this;
    },
    /**
     * [lang:ja]
     * Entity をフェードインするアクションを追加する。
     * fadeTo(1) のエイリアス。
     * @param time フレーム数
     * @param [easing] イージング関数
     * [/lang]
     */
    fadeIn: function(time, easing) {
        return this.fadeTo(1, time, easing);
    },
    /**
     * [lang:ja]
     * Entity をフェードアウトするアクションを追加する。
     * fadeTo(1) のエイリアス。
     * @param time フレーム数
     * @param [easing] イージング関数
     * [/lang]
     */
    fadeOut: function(time, easing) {
        return this.fadeTo(0, time, easing);
    },
    /**
     * [lang:ja]
     * Entity の位置をなめらかに移動させるアクションを追加する。
     * @param x 目標のx座標
     * @param y 目標のy座標
     * @param time フレーム数
     * @param [easing] イージング関数
     * [/lang]
     */
    moveTo: function(x, y, time, easing) {
        return this.tween({
            x: x,
            y: y,
            time: time,
            easing: easing
        });
    },
    /**
     * [lang:ja]
     * Entity のx座標をなめらかに変化させるアクションを追加する。
     * @param x
     * @param time
     * @param [easing]
     * [/lang]
     */
    moveX: function(x, time, easing) {
        return this.tween({
            x: x,
            time: time,
            easing: easing
        });
    },

    moveY: function(y, time, easing) {
        return this.tween({
            y: y,
            time: time,
            easing: easing
        });
    },

    moveBy: function(x, y, time, easing) {
        return this.tween({
            x: function() {
                return this.x + x;
            },
            y: function() {
                return this.y + y;
            },
            time: time,
            easing: easing
        });
    },

    hide: function() {
        return this.then(function() {
            this.opacity = 0;
        });
    },

    show: function() {
        return this.then(function() {
            this.opacity = 1;
        });
    },

    removeFromScene: function() {
        return this.then(function() {
            this.scene.removeChild(this);
        });
    },

    scaleTo: function(scale, time, easing) {
        if (typeof easing === "number") {
            return this.tween({
                scaleX: arguments[0],
                scaleY: arguments[1],
                time: arguments[2],
                easing: arguments[3]
            });
        }
        return this.tween({
            scaleX: scale,
            scaleY: scale,
            time: time,
            easing: easing
        });
    },

    scaleBy: function(scale, time, easing) {
        if (typeof easing === "number") {
            return this.tween({
                scaleX: function() {
                    return this.scaleX * arguments[0];
                },
                scaleY: function() {
                    return this.scaleY * arguments[1];
                },
                time: arguments[2],
                easing: arguments[3]
            });
        }
        return this.tween({
            scaleX: function() {
                return this.scaleX * scale;
            },
            scaleY: function() {
                return this.scaleY * scale;
            },
            time: time,
            easing: easing
        });
    },

    rotateTo: function(deg, time, easing) {
        return this.tween({
            rotation: deg,
            time: time,
            easing: easing
        });
    },

    rotateBy: function(deg, time, easing) {
        return this.tween({
            rotation: function() {
                return this.rotation + deg;
            },
            time: time,
            easing: easing
        });
    }
});
enchant.Action = enchant.Class.create(enchant.ActionEventTarget, {

    initialize: function(param) {
        enchant.ActionEventTarget.call(this);
        this.time = null;
        this.frame = 0;
        for (var key in param) {
            if (param.hasOwnProperty(key)) {
                if (param[key] != null) {
                    this[key] = param[key];
                }
            }
        }
        var action = this;

        this.timeline = null;
        this.node = null;

        this.addEventListener(enchant.Event.ADDED_TO_TIMELINE, function(evt) {
            action.timeline = evt.timeline;
            action.node = evt.timeline.node;
            action.frame = 0;
        });

        this.addEventListener(enchant.Event.REMOVED_FROM_TIMELINE, function() {
            action.timeline = null;
            action.node = null;
            action.frame = 0;
        });

        this.addEventListener(enchant.Event.ACTION_TICK, function(evt) {
            var remaining = action.time - (action.frame + evt.elapsed);
            if (action.time != null && remaining <= 0) {
                action.frame = action.time;
                evt.timeline.next(-remaining);
            } else {
                action.frame += evt.elapsed;
            }
        });

    }
});
enchant.ParallelAction = enchant.Class.create(enchant.Action, {

    initialize: function(param) {
        enchant.Action.call(this, param);
        var timeline = this.timeline;
        var node = this.node;

        this.actions = [];

        this.endedActions = [];
        var that = this;

        this.addEventListener(enchant.Event.ACTION_START, function(evt) {
            for (var i = 0, len = that.actions.length; i < len; i++) {
                that.actions[i].dispatchEvent(evt);
            }
        });

        this.addEventListener(enchant.Event.ACTION_TICK, function(evt) {
            var i, len, timeline = {
                next: function(remaining) {
                    var action = that.actions[i];
                    that.actions.splice(i--, 1);
                    len = that.actions.length;
                    that.endedActions.push(action);

                    var e = new enchant.Event("actionend");
                    e.timeline = this;
                    action.dispatchEvent(e);

                    e = new enchant.Event("removedfromtimeline");
                    e.timeline = this;
                    action.dispatchEvent(e);
                }
            };

            var e = new enchant.Event("actiontick");
            e.timeline = timeline;
            e.elapsed = evt.elapsed;
            for (i = 0, len = that.actions.length; i < len; i++) {
                that.actions[i].dispatchEvent(e);
            }

            if (that.actions.length === 0) {
                evt.timeline.next();
            }
        });

        this.addEventListener(enchant.Event.ADDED_TO_TIMELINE, function(evt) {
            for (var i = 0, len = that.actions.length; i < len; i++) {
                that.actions[i].dispatchEvent(evt);
            }
        });

        this.addEventListener(enchant.Event.REMOVED_FROM_TIMELINE, function() {
            this.actions = this.endedActions;
            this.endedActions = [];
        });

    }
});

/**
 * @scope enchant.Tween.prototype
 */
enchant.Tween = enchant.Class.create(enchant.Action, {
    /**
     * @name enchant.Tween
     * @class
     * [lang:ja]
     * {@link enchant.Action} を継承した、オブジェクトの特定のプロパティを、なめらかに変更したい時に用いるためのアクションクラス.
     * アクションを扱いやすく拡張したクラス.
     *
     * コンストラクタに渡す設定オブジェクトに、プロパティの目標値を指定すると、
     * アクションが実行された時に、目標値までなめらかに値を変更するようなアクションを生成する。
     *
     * トゥイーンのイージングも、easing プロパティで指定できる。
     * デフォルトでは enchant.Easing.LINEAR が指定されている。
     *
     * @param params
     * @constructs
     * @config {time}
     * @config {easing} [function]
     * [/lang]
     */
    initialize: function(params) {
        var origin = {};
        var target = {};
        enchant.Action.call(this, params);

        if (this.easing == null) {
            // linear
            this.easing = function(t, b, c, d) {
                return c * t / d + b;
            };
        }

        var tween = this;
        this.addEventListener(enchant.Event.ACTION_START, function() {
            // excepted property
            var excepted = ["frame", "time", "callback", "onactiontick", "onactionstart", "onactionend"];
            for (var prop in params) {
                if (params.hasOwnProperty(prop)) {
                    // if function is used instead of numerical value, evaluate it
                    var target_val;
                    if (typeof params[prop] === "function") {
                        target_val = params[prop].call(tween.node);
                    } else {
                        target_val = params[prop];
                    }

                    if (excepted.indexOf(prop) === -1) {
                        origin[prop] = tween.node[prop];
                        target[prop] = target_val;
                    }
                }
            }
        });

        this.addEventListener(enchant.Event.ACTION_TICK, function(evt) {
            // if time is 0, set property to target value immediately
            var ratio = tween.time === 0 ? 1 : tween.easing(Math.min(tween.time,tween.frame + evt.elapsed), 0, 1, tween.time) - tween.easing(tween.frame, 0, 1, tween.time);

            for (var prop in target){
                if (target.hasOwnProperty(prop)) {
                    if (typeof this[prop] === "undefined"){
                        continue;
                    }
                    tween.node[prop] += (target[prop] - origin[prop]) * ratio;
                    if (Math.abs(tween.node[prop]) < 10e-8){
                        tween.node[prop] = 0;
                    }
                }
            }
        });
    }
});
/**
 *
 */
}(global));
