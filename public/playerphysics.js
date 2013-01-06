$(function() {

    App.Physics = function(player) {

        var self = this;
        self.player = player;

        // Physics Config
        var MAX_SPEED_HORIZONTAL = 10;
        var MAX_SPEED_VERTICAL = 10;
        var OFFSET_X = 5;
        var OFFSET_Y = 2;
        var CHARACTER_WIDTH = 16;
        var CHARACTER_HEIGHT = 16;
        var COLISSION_CORRECTION = 0.01;
        var GRAVITY = 2;
        var JUMP_FORCE = 5;
        var FRICTION_LIMIT = 0.3;
        var GOAL_INC_HORIZONTAL = 0.5;

        // Calculation variables
        self.currentX = 0;
        self.currentY = 0;
        self.spriteWidth = 0;
        self.spriteHeight = 0;
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
            return dest.x - OFFSET_X;
        };

        /// Get the Y-result of our calculation. To be called after update.
        self.getY = function() {
            return dest.y - OFFSET_Y;
        };

        self.hitTest = function(x,y) {
            return App.GameEngine.Map.hitTest(x, y);
        };

        self.update = function(currentX, currentY) {
            self.currentX = currentX;
            self.currentY = currentY;

            self.calculateHorizontalFriction();

            if (self.jumping) {
                if (!App.GameEngine.Game.input.up || --self.jumpBoost < 0) {
                    self.goaly = 0;
                }
            } else {
                if (App.GameEngine.Game.input.up) {
                    self.jump();
                }
            }

            self.goalx = 0;
            self.jumping = true;

            if (App.GameEngine.Game.input.left) self.goalx -= GOAL_INC_HORIZONTAL;
            if (App.GameEngine.Game.input.right) self.goalx += GOAL_INC_HORIZONTAL;

            // Not walking? Keep current. Otherwise, switch direction.
            self.goalDir = self.goalx == 0 ? 0 : (self.goalx > 0 ? 1 : -1);

            self.player.onWantsToMove(self.goalx);

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

                self.centerx = dest.x - self.currentX - OFFSET_X;
                self.centery = dest.y - self.currentY - OFFSET_Y;

                if (self.wantsToMoveRight()) {

                    self.boundary = Math.floor(dest.right / CHARACTER_WIDTH) * CHARACTER_WIDTH;
                    self.crossing = (dest.right - self.boundary) / self.centerx * self.centery + dest.y;

                    if (self.hitTestRight()) {
                        self.incx = 0;
                        dest.x = self.boundary - dest.width - COLISSION_CORRECTION;
                        self.player.onCollideRight();
                        continue;
                    }

                } else if (self.wantsToMoveLeft()) {

                    self.boundary = Math.floor(dest.x / CHARACTER_WIDTH) * CHARACTER_WIDTH + CHARACTER_WIDTH;
                    self.crossing = (self.boundary - dest.x) / self.centerx * self.centery + dest.y;

                    if (self.hitTestLeft()) {
                        self.incx = 0;
                        dest.x = self.boundary + COLISSION_CORRECTION;
                        self.player.onCollideLeft();
                        continue;
                    }
                }
                if (self.wantsToMoveDown()) {

                    self.boundary = Math.floor(dest.bottom / CHARACTER_HEIGHT) * CHARACTER_HEIGHT;
                    self.crossing = (dest.bottom - self.boundary) / self.centery * self.centerx + dest.x;
                    if (self.hitTestBottom()) {
                        self.jumping = false;
                        self.incy = 0;
                        dest.y = self.boundary - dest.height - COLISSION_CORRECTION;
                        self.player.onCollideFloor(self.crossing, self.boundary);
                        continue;
                    }
                } else if (self.wantsToMoveUp()) {

                    self.boundary = Math.floor(dest.y / CHARACTER_HEIGHT) * CHARACTER_HEIGHT + CHARACTER_HEIGHT;
                    self.crossing = (self.boundary - dest.y) / self.centery * self.centerx + dest.x;
                    if (self.hitTestTop()) {
                        self.incy = 0;
                        dest.y = self.boundary + COLISSION_CORRECTION;
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
                (self.hitTest(self.boundary, self.crossing) && !self.hitTest(self.boundary - CHARACTER_WIDTH, self.crossing))
                ||
                (self.hitTest(self.boundary, self.crossing + dest.height) && !self.hitTest(self.boundary - CHARACTER_WIDTH, self.crossing + dest.height))
                )
        };

        self.hitTestLeft = function() {
            return (
                (self.hitTest(self.boundary - CHARACTER_WIDTH, self.crossing)
                && !self.hitTest(self.boundary, self.crossing))

                || (self.hitTest(self.boundary - CHARACTER_WIDTH, self.crossing + dest.height)
                && !self.hitTest(self.boundary, self.crossing + dest.height)))
        };

        self.hitTestBottom = function() {
            return (
                (self.hitTest(self.crossing, self.boundary) && !self.hitTest(self.crossing, self.boundary - CHARACTER_HEIGHT))
                ||
                (self.hitTest(self.crossing + dest.width, self.boundary) && !self.hitTest(self.crossing + dest.width, self.boundary - CHARACTER_HEIGHT))
                )
        };

        self.hitTestTop = function() {
            return (
                (self.hitTest(self.crossing, self.boundary - CHARACTER_HEIGHT) && !self.hitTest(self.crossing, self.boundary))
                ||
                (self.hitTest(self.crossing + dest.width, self.boundary - CHARACTER_HEIGHT) && !self.hitTest(self.crossing + dest.width, self.boundary))
                )
        };

        self.wantsToMoveRight = function() {
            return self.centerx > 0 && Math.floor(dest.right / CHARACTER_WIDTH) != Math.floor((dest.right - self.centerx) / CHARACTER_WIDTH);
        };

        self.wantsToMoveLeft = function() {
            return self.centerx < 0 && Math.floor(dest.x / CHARACTER_WIDTH) != Math.floor((dest.x - self.centerx) / CHARACTER_WIDTH);
        };

        self.wantsToMoveUp = function() {
            return self.centery < 0 && Math.floor(dest.y / CHARACTER_HEIGHT) != Math.floor((dest.y - self.centery) / CHARACTER_HEIGHT);
        };

        self.wantsToMoveDown = function()  {
            return self.centery > 0 && Math.floor(dest.bottom / CHARACTER_HEIGHT) != Math.floor((dest.bottom - self.centery) / CHARACTER_HEIGHT)
        };

        self.updateBoundingBox = function() {
            var x = self.currentX + self.incx + OFFSET_X;
            var y = self.currentY + self.incy + OFFSET_Y;
            var w = self.spriteWidth - (OFFSET_X * 2);
            var h = self.spriteHeight - OFFSET_Y;
            dest = new App.GameEngine.Rectangle(x, y, w, h);
        };
    };

});




