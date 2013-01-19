Rectangle = enchant.Class.create({
    initialize: function (x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    },
    right: { get: function () { return this.x + this.width; } },
    bottom: { get: function () { return this.y + this.height; } }
});


Physics = function(player, map) {

    var self = this;
    self.player = player;
    self.map = map;

    // Physics Config
    var MAX_SPEED_HORIZONTAL = 10;
    var MAX_SPEED_VERTICAL = 10;
    var OFFSET_X = 5;
    var OFFSET_Y = 2;
    var CHARACTER_WIDTH_HALF = 16;
    var CHARACTER_HEIGHT_HALF = 16;
    var COLISSION_CORRECTION = 0.01;
    var GRAVITY = 2;
    var JUMP_FORCE = 5;
    var FRICTION_LIMIT = 0.5;
    var GOAL_INC_HORIZONTAL = 0.9;

    // Calculation variables
    self.currentX = 0;
    self.currentY = 0;
    self.goalx = 0;
    self.goaly = 0;
    self.incx = 0;
    self.incy = 0;
    self.jumpBoost = 0;
    self.jumping = true;
    self.horizontalFriction = 0;
    self.boundary = 0;
    self.crossing = 0;
    self.centerx = 0;
    self.centery = 0;
    self.dest = undefined;
    self.goalDir = 1;           // Direction the object wants to move in (-1 = left, 1 = right)

    /// Get the X-result of our calculation. To be called after update.
    self.getX = function() {
        if(!self.dest) return 0;
        return self.dest.x - OFFSET_X;
    };

    /// Get the Y-result of our calculation. To be called after update.
    self.getY = function() {
        if(!self.dest) return 0;
        return self.dest.y - OFFSET_Y;
    };

    self.hitTest = function(x,y) {
        return map.hitTest(x, y);
    };

    self.update = function(currentX, currentY, upPressed, leftPressed, rightPressed) {
        self.currentX = currentX;
        self.currentY = currentY;

        self.calculateHorizontalFriction();

        if (self.jumping) {
            if (!upPressed || --self.jumpBoost < 0) {
                self.goaly = 0;
            }
        } else {
            if (upPressed) {
                self.jump();
            }
        }

        self.goalx = 0;
        self.jumping = true;

        if (leftPressed) self.goalx -= GOAL_INC_HORIZONTAL;
        if (rightPressed) self.goalx += GOAL_INC_HORIZONTAL;

        // Not walking? Keep current. Otherwise, switch direction.
        self.goalDir = self.goalx == 0 ? 0 : (self.goalx > 0 ? 1 : -1);

        self.player.onWantsToMove();

        self.incx += self.goalx + self.horizontalFriction;

        // Apply vertical goal (= jump force) + gravity
        self.incy += self.goaly + GRAVITY;

        // Limit speed
        self.incx = Math.min(Math.max(self.incx, -MAX_SPEED_HORIZONTAL), MAX_SPEED_HORIZONTAL);
        self.incy = Math.min(Math.max(self.incy, -MAX_SPEED_VERTICAL), MAX_SPEED_VERTICAL);

        self.updateBoundingBox();

        self.handleCollisions();
    };

    self.handleCollisions = function() {

        while (true) {

            self.boundary = 0;
            self.crossing = 0;
            self.centerx = self.dest.x - self.currentX - OFFSET_X;
            self.centery = self.dest.y - self.currentY - OFFSET_Y;

            if (self.wantsToMoveRight()) {

                self.boundary = Math.floor(self.dest.right / CHARACTER_WIDTH_HALF) * CHARACTER_WIDTH_HALF;
                self.crossing = (self.dest.right - self.boundary) / self.centerx * self.centery + self.dest.y;

                if (self.hitTestRight()) {
                    self.incx = 0;
                    self.dest.x = self.boundary - self.dest.width - COLISSION_CORRECTION;
                    self.player.onCollideRight();
                    continue;
                }

            } else if (self.wantsToMoveLeft()) {

                self.boundary = Math.floor(self.dest.x / CHARACTER_WIDTH_HALF) * CHARACTER_WIDTH_HALF + CHARACTER_WIDTH_HALF;
                self.crossing = (self.boundary - self.dest.x) / self.centerx * self.centery + self.dest.y;

                if (self.hitTestLeft()) {
                    self.incx = 0;
                    self.dest.x = self.boundary + COLISSION_CORRECTION;
                    self.player.onCollideLeft();
                    continue;
                }
            }
            if (self.wantsToMoveDown()) {

                self.boundary = Math.floor(self.dest.bottom / CHARACTER_HEIGHT_HALF) * CHARACTER_HEIGHT_HALF;
                self.crossing = (self.dest.bottom - self.boundary) / self.centery * self.centerx + self.dest.x;
                if (self.hitTestBottom()) {
                    self.jumping = false;
                    self.incy = 0;
                    self.dest.y = self.boundary - self.dest.height - COLISSION_CORRECTION;
                    self.player.onCollideFloor(self.crossing, self.boundary);
                    continue;
                }
            } else if (self.wantsToMoveUp()) {

                self.boundary = Math.floor(self.dest.y / CHARACTER_HEIGHT_HALF) * CHARACTER_HEIGHT_HALF + CHARACTER_HEIGHT_HALF;
                self.crossing = (self.boundary - self.dest.y) / self.centery * self.centerx + self.dest.x;
                if (self.hitTestTop()) {
                    self.incy = 0;
                    self.dest.y = self.boundary + COLISSION_CORRECTION;
                    self.player.onCollideTop();
                    continue;
                }
            }

            break;
        }
    };

    self.jump = function() {
        self.jumpBoost = JUMP_FORCE;
        self.goaly = -JUMP_FORCE;
        player.onJump();
    };

    self.calculateHorizontalFriction = function() {
        if (self.incx > FRICTION_LIMIT) {
            self.horizontalFriction = -FRICTION_LIMIT;
        } else if (self.incx > 0) {
            self.horizontalFriction = -self.incx;
        }
        if (self.incx < -FRICTION_LIMIT) {
            self.horizontalFriction = FRICTION_LIMIT;
        } else if (self.incx < 0) {
            self.horizontalFriction = -self.incx;
        }
    };

    self.hitTestRight = function () {
        return (
            (self.hitTest(self.boundary, self.crossing) && !self.hitTest(self.boundary - CHARACTER_WIDTH_HALF, self.crossing))
                ||
                (self.hitTest(self.boundary, self.crossing + self.dest.height) && !self.hitTest(self.boundary - CHARACTER_WIDTH_HALF, self.crossing + self.dest.height))
            )
    };

    self.hitTestLeft = function() {
        return (
            (self.hitTest(self.boundary - CHARACTER_WIDTH_HALF, self.crossing)
                && !self.hitTest(self.boundary, self.crossing))

                || (self.hitTest(self.boundary - CHARACTER_WIDTH_HALF, self.crossing + self.dest.height)
                && !self.hitTest(self.boundary, self.crossing + self.dest.height)))
    };

    self.hitTestBottom = function() {
        return (
            (self.hitTest(self.crossing, self.boundary) && !self.hitTest(self.crossing, self.boundary - CHARACTER_HEIGHT_HALF))
                ||
                (self.hitTest(self.crossing + self.dest.width, self.boundary) && !self.hitTest(self.crossing + self.dest.width, self.boundary - CHARACTER_HEIGHT_HALF))
            )
    };

    self.hitTestTop = function() {
        return (
            (self.hitTest(self.crossing, self.boundary - CHARACTER_HEIGHT_HALF) && !self.hitTest(self.crossing, self.boundary))
                ||
                (self.hitTest(self.crossing + self.dest.width, self.boundary - CHARACTER_HEIGHT_HALF) && !self.hitTest(self.crossing + self.dest.width, self.boundary))
            )
    };

    self.wantsToMoveRight = function() {
        return self.centerx > 0 && Math.floor(self.dest.right / CHARACTER_WIDTH_HALF) != Math.floor((self.dest.right - self.centerx) / CHARACTER_WIDTH_HALF);
    };

    self.wantsToMoveLeft = function() {
        return self.centerx < 0 && Math.floor(self.dest.x / CHARACTER_WIDTH_HALF) != Math.floor((self.dest.x - self.centerx) / CHARACTER_WIDTH_HALF);
    };

    self.wantsToMoveUp = function() {
        return self.centery < 0 && Math.floor(self.dest.y / CHARACTER_HEIGHT_HALF) != Math.floor((self.dest.y - self.centery) / CHARACTER_HEIGHT_HALF);
    };

    self.wantsToMoveDown = function()  {
        return self.centery > 0 && Math.floor(self.dest.bottom / CHARACTER_HEIGHT_HALF) != Math.floor((self.dest.bottom - self.centery) / CHARACTER_HEIGHT_HALF)
    };

    self.updateBoundingBox = function() {
        var x = self.currentX + self.incx + OFFSET_X;
        var y = self.currentY + self.incy + OFFSET_Y;
        var w = (CHARACTER_WIDTH_HALF * 2) - (OFFSET_X * 2);
        var h = (CHARACTER_HEIGHT_HALF * 2) - OFFSET_Y;
        self.dest = new Rectangle(x, y, w, h);
    };
};



