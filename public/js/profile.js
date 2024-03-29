/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.magnitude = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        this.theta = math.toDegrees(atan2(y, x));
    }
}

class Waypoint extends Point {
    constructor(i, x, y) {
        super(x, y);
        this.i = i;
        this.radius = 5;
        this.active = false;
    }
    
    setActive() {
        this.active = true;
    }

    draw() {
        strokeWeight(1);
        stroke('black');
        fill('red');
        circle(this.x, this.y, this.radius * 2);
        stroke('white');
        strokeWeight(.5);
        fill('black');
        textSize(15);
        text('K', this.x + 10, this.y + 10);
        textSize(10);
        text(this.i, this.x + 20, this.y + 15);
        if (this.active) {
            strokeWeight(1);
            stroke('red');
            noFill();
            rect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
        }
    }
}

class Curve {
    constructor(scale) {
        this.s = t => new Point(bezierPoint(this.p0.x, this.p1.x, this.p2.x, this.p3.x, t) / this.scale,
                                bezierPoint(this.p0.y, this.p1.y, this.p2.y, this.p3.y, t) / this.scale);
        this.sDot = t => {
            // B'(t) = -3(1 - t)^2 * p0 + (3 - 12t + 9t^2) * p1 + (6t - 9t^2) * p2 + 3t^2 * p3
            let vx = bezierTangent(this.p0.x, this.p1.x, this.p2.x, this.p3.x, t) / this.scale;
            let vy = bezierTangent(this.p0.y, this.p1.y, this.p2.y, this.p3.y, t) / this.scale;
            return Math.sqrt(Math.pow(vx, 2) + Math.pow(vy, 2));
        }
        this.d = t => {
            // B'(t) = -3(1 - t)^2 * p0 + (3 - 12t + 9t^2) * p1 + (6t - 9t^2) * p2 + 3t^2 * p3
            let vx = bezierTangent(this.p0.x, this.p1.x, this.p2.x, this.p3.x, t) / this.scale;
            let vy = bezierTangent(this.p0.y, this.p1.y, this.p2.y, this.p3.y, t) / this.scale;
            return new Vector(vx, vy);
        }
        this.dd = t => {
            let ax = (6 * (1 - t) * this.p0.x +
                     (18 * t - 12) * this.p1.x +
                     (6 - 18 * t) * this.p2.x +
                     6 * t * this.p3.x) / this.scale;
            let ay = (6 * (1 - t) * this.p0.y +
                     (18 * t - 12) * this.p1.y +
                     (6 - 18 * t) * this.p2.y +
                     6 * t * this.p3.y) / this.scale
            return new Vector(ax, ay);
        }
        this.p0 = null;
        this.p1 = null;
        this.p2 = null;
        this.p3 = null;
        this.scale = scale;
        this.fLength = t => math.integrate(this.sDot, 0, t);
    }

    update() {
        this.curveLength = this.fLength(1);
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
        this.length = null;
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
        for (let i = 0; i < this.points.length; ++i) {
            this.points[i].i = i;
        }
        this.update();
    }

    cumLength(i) {
        let sum = 0;
        for (let j = 0; j < i; ++j) {
            sum += this.curves[j].curveLength;
        }
        return sum;
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
                this.curves[0].update();
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

                    for (let i = 1; i < n - 1; ++i) {
                        dx.push(4 * this.points[i].x + 2 * this.points[i + 1].x);
                        dy.push(4 * this.points[i].y + 2 * this.points[i + 1].y);
                    }

                    dx.push(8 * this.points[n - 1].x + this.points[n].x);
                    dy.push(8 * this.points[n - 1].y + this.points[n].y);

                    mat = Array(n);

                    for (let i = 0; i < n; ++i) {
                        mat[i] = Array(n).fill(0);
                    }
                    for (let i = 1; i < n - 1; ++i) {
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

                for (let i = 0; i < n; ++i) {
                    p2.push(new Point(2 * this.points[i + 1].x - p1x[i + 1], 2 * this.points[i + 1].y - p1y[i + 1]))
                }

                p2[n - 1].x = 0.5 * (this.points[n].x + p1x[n - 1]);
                p2[n - 1].y = 0.5 * (this.points[n].y + p1y[n - 1]);

                for (let i = 0; i < n; ++i) {
                    this.curves[i].p0 = this.points[i];
                    this.curves[i].p1 = new Point(p1x[i], p1y[i]);
                    this.curves[i].p2 = p2[i];
                    this.curves[i].p3 = this.points[i + 1];
                    this.curves[i].update();
                }
            }
            this.length = this.curves.reduce((a, b) => a + b.curveLength, 0);
        }
    }

    draw() {
        for (let i = 0; i < this.points.length; ++i) {
            this.points[i].draw();
        }

        for (let i = 0; i < this.curves.length; ++i) {
            this.curves[i].draw();
        }
    }
}

class MotionProfile {
    constructor(trajectory, wheelRadius, vMax, aMax, jMax) {
        this.scale = trajectory.scale;
        this.trajectory = trajectory;
        this.wheelRadius = wheelRadius;
        this.jMax = jMax * 12;
        this.aMax = aMax * 12;
        this.vMax = vMax * 12;
        this._vMax = this.vMax;
        this.uiPrev = 0;
        this._i = 0;
        this.interval = 100;
        this.show = false;
        this.drawAngular = true;
        this.update();
    }

    timeTo(i) {
        let sum = 0;
        for (let j = 0; j < i; ++j) {
            sum += this.t[j];
        }
        return sum;
    }

    distanceTo(i) {
        let sum = 0;
        for (let j = 0; j < i; ++j) {
            sum += this.s[j];
        }
        return sum;
    }

    getInterpolationParameter(i, s, ui, tol) {
        tol = tol || 0.1;
        let f = u => this.trajectory.curves[i].fLength(u) - s;
        let _f = u => this.trajectory.curves[i].sDot(u);

        while ((ui >= 0 && ui <= 1) && Math.abs(f(ui)) > tol) {
            ui -= f(ui) / _f(ui);
        }
        ui = max(0, min(ui, 1));
        return ui;
    }

    calcTrajPoint(t) {
        let segId;
        let i = 0;
        let s = 0;
        let v = 0;
        let a = 0;
        if (t <= this.t[0]) {
            segId = 0;
            v = this.jMax * Math.pow(t, 2) / 2;
            s = this.jMax * Math.pow(t, 3) / 6;
            a = this.jMax * t;
        } else if (t <= this.timeTo(2)) {
            segId = 1;
            let dt = t - this.t[0];
            v = this.v[0] + this.aMax * dt;
            s = this.s[0] + this.v[0] * dt + this.aMax * Math.pow(dt, 2) / 2;
            a = this.aMax;
        } else if (t <= this.timeTo(3)) {
            segId = 2;
            let dt = t - this.timeTo(2);
            v = this.v[1] + this.aMax * dt - this.jMax * Math.pow(dt, 2) / 2;
            s = this.distanceTo(2) + this.v[1] * dt + this.aMax * Math.pow(dt, 2) /
                2 - this.jMax * Math.pow(dt, 3) / 6;
        } else if (t <= this.timeTo(4)) {
            segId = 3;
            let dt = t - this.timeTo(3);
            v = this.v[3];
            s = this.distanceTo(3) + this.v[3] * dt;
            a = 0;
        } else if (t <= this.timeTo(5)) {
            segId = 4;
            let dt = t - this.timeTo(4);
            v = this._vMax - this.jMax * Math.pow(dt, 2) / 2
            s = this.distanceTo(4) + this._vMax * dt - this.jMax * Math.pow(dt, 3) / 6;
            a = -this.jMax * dt;
        } else if (t <= this.timeTo(6)) {
            segId = 5;
            let dt = t - this.timeTo(5);
            v = this.v[4] - this.aMax * dt;
            s = this.distanceTo(5) + this.v[4] * dt - this.aMax * Math.pow(dt, 2) / 2
        } else if (t < this.timeTo(7)) {
            segId = 6;
            let dt = t - this.timeTo(6);
            v = this.v[5] - this.aMax * dt + this.jMax * Math.pow(dt, 2) / 2;
            s = this.distanceTo(6) + this.v[5] * dt - this.aMax * Math.pow(dt, 2) /
                2 + this.jMax * Math.pow(dt, 3) / 6;
            a = -this.aMax + this.jMax * dt;
        } else {
            segId = 7;
            v = 0;
            s = this.trajectory.length;
            a = 0;
        }

        while (++i < this.trajectory.curves.length && s > this.trajectory.cumLength(i));
        --i;
        
        let ui;
        if (i == this.trajectory.curves.length) {
            --i;
            ui = 1;
        } else {
            ui = this.getInterpolationParameter(i, s - this.trajectory.cumLength(i), this.uiPrev);
        }

        this.uiPrev = i == this._i ? ui : 0;

        this._i = i;
        let pos = this.trajectory.curves[i].s(ui);
        let d   = this.trajectory.curves[i].d(ui);
        let dd  = this.trajectory.curves[i].dd(ui);
        let su  = this.trajectory.curves[i].sDot(ui);
        let omega;
        if (!math.isClose(su, 0) && !math.isClose(v, 0)) {
            let ut = v / su;
            let utt = a / su - (d.x * dd.x + d.y * dd.y) / Math.pow(su, 2) * ut;
            let xt = d.x * ut;
            let yt = d.y * ut;
            let xtt = dd.x * Math.pow(ut, 2) + d.x * utt;
            let ytt = dd.y * Math.pow(ut, 2) + d.y * utt;
            omega = (ytt * xt - xtt * yt) / Math.pow(v, 2);
        } else {
            omega = 0;
        }
        return {
            segId: segId,
            x: pos.x,
            y: pos.y,
            theta: math.toDegrees(atan2(d.y, d.x)),
            v: v,
            omega: omega
        };
    }

    showLinear() {
        this.show = true;
        this.drawAngular = false;
    }

    showAngular() {
        this.show = true;
        this.drawAngular = true;
    }

    update(vMax, aMax, jMax) {
        if (this.trajectory.points.length > 1) {
            this.vMax = vMax * 12 || this.vMax;
            this.aMax = aMax * 12 || this.aMax;
            this.jMax = jMax * 12 || this.jMax;

            let totalLength = this.trajectory.length;

            this._vMax = this.vMax;

            let ts = this.aMax / this.jMax;
            let vs = this.jMax * Math.pow(ts, 2) / 2;
            let ss = this.jMax * Math.pow(ts, 3) / 6;
            /*
            let a = 1 / this.aMax;
            let b = 3 * this.aMax / (2 * this.jMax) + vs / this.aMax -
                    (Math.pow(this.aMax, 2) / this.jMax + vs) / this.aMax;
            let c = 2 * ss - totalLength - 7 * Math.pow(this.aMax, 3) /
                    (3 * Math.pow(this.jMax, 2)) - vs * (this.aMax / this.jMax +
                    vs / this.aMax) + Math.pow((Math.pow(this.aMax, 2) /
                    this.jMax + vs / this.aMax), 2) / (2 * this.aMax);
            this._vMax = (-b + Math.sqrt(Math.pow(b, 2) - 4 * a * c)) / (2 * a);
            */

            this._vMax = Math.max((Math.sqrt(this.aMax * Math.pow(this.jMax, 2) *
                        (4 * Math.pow(this.jMax, 2) * totalLength - 11 *
                        Math.pow(this.aMax, 3))) + Math.pow(this.aMax, 2) *
                        this.jMax) / (2 * Math.pow(this.jMax, 2)), (Math.pow(this.aMax, 2) *
                        this.jMax - Math.sqrt(this.aMax * Math.pow(this.jMax, 2) *
                        (4 * Math.pow(this.jMax, 2) * totalLength - 11 *
                        Math.pow(this.aMax, 3)))) / (2 * Math.pow(this.jMax, 2))) - 10;
            if (this.vMax <= this._vMax) {
                this._vMax = this.vMax;
            }

            this.t = Array(7);
            this.v = Array(7);
            this.s = Array(7);

            // Section 0: Maximal jerk, part 1
            let i = 0;
            this.t[0] = ts;
            this.v[0] = vs;
            this.s[0] = ss;

            // Section 1: Maximal acceleration
            i = 1;
            let dv = this._vMax - Math.pow(this.aMax, 2) / (this.jMax * 2) - this.v[i - 1];
            this.t[i] = dv / this.aMax;
            this.v[i] = this.v[i - 1] + this.aMax * this.t[i];
            this.s[i] = this.v[i - 1] * this.t[i] + this.aMax * Math.pow(this.t[i], 2) / 2;

            // Section 2: Minimal jerk, part 1
            i = 2;
            this.t[i] = this.aMax / this.jMax;
            this.v[i] = this.v[i - 1] + this.aMax * this.t[i] - this.jMax *
                        Math.pow(this.t[i], 2) / 2;

            if (!math.isClose(this.v[i], this._vMax)) {
                return console.error("Max velocity not reached!");
            }

            this.s[i] = this.v[i - 1] * this.t[i] + this.aMax * Math.pow(this.t[i], 2) /
                        2 - this.jMax * Math.pow(this.t[i], 3) / 6;
            
            // Section 3: Coast
            i = 3;
            this.s[i] = 0;
            this.t[i] = 0;
            this.v[i] = 0;

            // Section 4: Minimal jerk, part 2
            i = 4;
            this.t[i] = this.aMax / this.jMax;
            this.v[i] = this._vMax - this.jMax * Math.pow(this.t[i], 2) / 2;
            this.s[i] = this._vMax * this.t[i] - this.jMax * Math.pow(this.t[i], 3) / 6;

            // Section 5: Minimal acceleration
            i = 5;
            dv = this.v[i - 1] - vs;
            this.t[i] = dv / this.aMax;
            this.v[i] = this.v[i - 1] - this.aMax * this.t[i];
            this.s[i] = this.v[i - 1] * this.t[i] - this.aMax * Math.pow(this.t[i], 2) / 2;

            // Section 6: Maximal jerk, part 2
            i = 6;
            this.t[i] = ts;
            this.v[i] = this.v[i - 1] - this.jMax * Math.pow(ts, 2) / 2;

            if (!math.isClose(this.v[i], 0)) {
                return console.error(`Final velocity ${this.v[i]} is not zero!`);
            }

            this.s[i] = ss;

            for (let i = 0; i < this.t.length; ++i) {
                if (this.t[i] < 0) {
                    return console.error("Kinematically impossible path!");
                }
            }

            let sSum = math.sum(this.s);
            if (sSum < totalLength) {
                i = 3;
                this.s[i] = totalLength - sSum;
                this.v[i] = this._vMax;
                this.t[i] = this.s[i] / this._vMax;
            }
            
            this.totalTime = math.sum(this.t);
        }
    }

    export() {
        let sl = 0;
        let sr = 0;
        let dt = .01;
        let profile = [];
        for (let t = 0; t <= this.totalTime; t += dt) {
            let state = this.calcTrajPoint(t);
            let vDiff = this.wheelRadius * state.omega;
            let vl = state.v - vDiff;
            let vr = state.v + vDiff;
            sl += vl * dt;
            sr += vr * dt;
            profile.push(`${sl.toFixed(4)},${vl.toFixed(4)},${sr.toFixed(4)},${vr.toFixed(4)},${state.theta.toFixed(4)}`);
        }
        return profile;
    }

    draw() {
        if (this.show) {
            noStroke();
            for (let t = 0; t <= this.totalTime; t += this.totalTime / this.interval) {
                if (t == this.totalTime) {
                    t -= .001;
                }
                let state = this.calcTrajPoint(t);
                if (this.drawAngular) {
                    fill(0, Math.abs(state.omega) / .3 * 255, 0);
                } else {
                    fill(state.v / this._vMax * 255, 0, 0);
                }
                circle(state.x * this.scale, state.y * this.scale, 10);
            }
        }
    }
}