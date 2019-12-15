class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Vector {
    constructor(magnitude, theta) {
        this.magnitude = magnitude;
        this.theta = theta;
    }

    x() {
        return this.magnitude * Math.cos(this.theta);
    }

    y() {
        return this.magnitude * Math.sin(this.theta);
    }
}

class Waypoint extends Point {
    constructor(i, x, y) {
        super(x, y);
        this.i = i;
        this.radius = radius;
        this.active = false;
    }
    
    setActive() {
        this.active = true;
    }

    draw() {
        stroke('black');
        fill('red');
        circle(this.x, this.y, this.radius * 2);
        noStroke();
        fill('black');
        textSize(15);
        text('K', this.x + 10, this.y + 10);
        textSize(10);
        text(this.i, this.x + 20, this.y + 15);
        if (this.active) {
            stroke('red');
            noFill();
            rect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
        }
    }
}

class ExtensibleFunction extends Function {
    constructor(f) {
        return Object.setPrototypeOf(f, new.target.prototype);
    }
}

class Curve extends ExtensibleFunction {
    constructor(scale) {
        super(t => {
            // B(t) = (1 - t)^3 * p0 + 3t(1 - t)^2 * p1 + 3t^2(1 - t) * p2 + x^3 * p3
            return new Point((Math.pow((1 - t), 3) * this.p0.x +
                   3 * t * Math.pow((1 - t), 2) * this.p1.x +
                   3 * Math.pow(t, 2) * (1 - t) * this.p2.x +
                   Math.pow(t, 3) * this.p3.x) * this.scale,
                   (Math.pow((1 - t), 3) * this.p0.y +
                   3 * t * Math.pow((1 - t), 2) * this.p1.y +
                   3 * Math.pow(t, 2) * (1 - t) * this.p2.y +
                   Math.pow(t, 3) * this.p3.y) * this.scale);
        })
        this.velocity = t => {
            // B'(t) = -3(1 - t)^2 * p0 + (3 - 12t + 9t^2) * p1 + (6t - 9t^2) * p2 + 3t^2 * p3
            let vx = (-3 * Math.pow((1 - t), 2) * this.p0.x +
                     (3 - 12 * t + 9 * Math.pow(t, 2)) * this.p1.x +
                     (6 * t - 9 * Math.pow(t, 2)) * this.p2.x +
                     3 * Math.pow(t, 2) * this.p3.x) * this.scale;
            let vy = (-3 * Math.pow((1 - t), 2) * this.p0.y +
                     (3 - 12 * t + 9 * Math.pow(t, 2)) * this.p1.y +
                     (6 * t - 9 * Math.pow(t, 2)) * this.p2.y +
                     3 * Math.pow(t, 2) * this.p3.y) * this.scale;
            let theta = atan(vy / vx);
            return new Vector(Math.sqrt(Math.pow(vx, 2) + Math.pow(vy, 2), theta));
        }
        this.acceleration = t => {
            // B''(t) = 6(1 - t) * p0 + (18t - 12) * p1 + (6 - 18t) * p2 + 6t * p3
            let ax = (6 * (1 - t) * this.p0.x +
                     (18 * t - 12) * this.p1.x +
                     (6 - 18 * t) * this.p2.x +
                     6 * t * this.p3.x) * this.scale;
            let ay = (6 * (1 - t) * this.p0.y +
                     (18 * t - 12) * this.p1.y +
                     (6 - 18 * t) * this.p2.y +
                     6 * t * this.p3.y) * this.scale
            let theta = atan(vy / vx);
            return new Vector(Math.sqrt(Math.pow(ax, 2), Math.pow(ay, 2)), theta);
        }
        this.p0 = null;
        this.p1 = null;
        this.p2 = null;
        this.p3 = null;
        this.scale = scale
    }

    draw() {
        noFill();
        strokeWeight(1);
        stroke('blue');
        bezier(this.p0.x, this.p0.y, this.p1.x, this.p1.y, this.p2.x, this.p2.y, this.p3.x, this.p3.y);
    }
}

class Trajectory {
    constructor(scale) {
        this.points = [];
        this.curves = [];
        this.scale = scale;
    }

    add(x, y) {
        var waypoint = new Waypoint(this.points.length, x, y);
        this.points.push(waypoint);
        this.update();
    }

    remove(i) {
        if (this.points.length > 0) {
            this.points.splice(i, 1);
            this.curves.splice(i - 1, 1);
        }
        for (var i = 0; i < this.points.length; ++i) {
            this.points[i].i = i;
        }
        this.update();
    }

    update() {
        var mat, dx, dy, p1x, p1y, p2, p2x, p2y;
        var n = this.points.length - 1;
        if (n > 0) {
            this.curves = Array(n);

            for (var i = 0; i < n; ++i) {
                this.curves[i] = new Curve(this.scale);
            }

            if (n == 1) {
                p1x = (2 * this.points[0].x + this.points[1].x) / 3;
                p1y = (2 * this.points[0].y + this.points[1].y) / 3;
                p2x = 2 * p1x - this.points[0].x;
                p2y = 2 * p1y - this.points[0].y;

                this.curves[0].p0 = this.points[0];
                this.curves[0].p1 = new Point(p1x, p1y);
                this.curves[0].p2 = new Point(p2x, p2y);
                this.curves[0].p3 = this.points[1];
            } else if (n > 1) {
                if (n == 2) {
                    mat = [
                        [2, 1],
                        [2, 7]
                    ];

                    dx = [this.points[0].x + 2 * this.points[1].x, 8 * this.points[1].x + this.points[2].x];
                    dy = [this.points[0].y + 2 * this.points[1].y, 8 * this.points[1].y + this.points[2].y];
                } else {
                    dx = [this.points[0].x + 2 * this.points[1].x];
                    dy = [this.points[0].y + 2 * this.points[1].y];

                    for (var i = 1; i < n - 1; ++i) {
                        dx.push(4 * this.points[i].x + 2 * this.points[i + 1].x);
                        dy.push(4 * this.points[i].y + 2 * this.points[i + 1].y);
                    }

                    dx.push(8 * this.points[n - 1].x + this.points[n].x);
                    dy.push(8 * this.points[n - 1].y + this.points[n].y);

                    mat = Array(n);

                    for (var i = 0; i < n; ++i) {
                        mat[i] = Array(n).fill(0);
                    }
                    for (var i = 1; i < n - 1; ++i) {
                        mat[i][i - 1] = 1;
                        mat[i][i] = 4;
                        mat[i][i + 1] = 1;
                    }

                    mat[0][0] = 2;
                    mat[0][1] = 1;
                    mat[n - 1][n - 2] = 2;
                    mat[n - 1][n - 1] = 7;
                }

                p1x = math.multiply(math.inv(mat), dx);
                p1y = math.multiply(math.inv(mat), dy);

                p2 = [];

                for (var i = 0; i < n; ++i) {
                    p2.push(new Point(2 * this.points[i + 1].x - p1x[i + 1], 2 * this.points[i + 1].y - p1y[i + 1]))
                }

                p2[n - 1].x = 0.5 * (this.points[n].x + p1x[n - 1]);
                p2[n - 1].y = 0.5 * (this.points[n].y + p1y[n - 1]);

                for (var i = 0; i < n; ++i) {
                    this.curves[i].p0 = this.points[i];
                    this.curves[i].p1 = new Point(p1x[i], p1y[i]);
                    this.curves[i].p2 = p2[i];
                    this.curves[i].p3 = this.points[i + 1];
                }
            }
        }
    }

    draw() {
        for (var i = 0; i < this.points.length; ++i) {
            this.points[i].draw();
        }

        for (var i = 0; i < this.curves.length; ++i) {
            this.curves[i].draw();
        }
    }
}

class Profile {
    constructor(trajectory) {
        this.trajectory = trajectory;
    }
    
    
}