/// <reference path="./p5.global-mode.d.ts" />

var screenHeight = 400, screenWidth = 720;
var btnAdd, btnRemove, radius = 5;
var k = [], B = [];

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Waypoint extends Point {
    constructor(x, y) {
        super(x, y);
        this.radius = radius;
        this.active = false;
    }

    draw() {
        noStroke();
        fill('black');
        ellipse(this.x, this.y, this.radius * 2, this.radius * 2);
        if (this.active) {
            stroke('red');
            rect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
        }
    }
}

class Curve {
    constructor() {
        this.p0 = null;
        this.p1 = null;
        this.p2 = null;
        this.p3 = null;
    }

    draw() {
        noFill();
        stroke('blue');
        bezier(this.p0.x, this.p0.y, this.p1.x, this.p1.y, this.p2.x, this.p2.y, this.p3.x, this.p3.y);
    }
}

function solveTridiagonal (n, a, b, c, x) {
    var i, fac;

    for (i = 1; i < n; i++) {
        if (b[i - 1] === 0) {
            console.log('tridiagonalSolve: failed due to lack of diagonal dominance');
            return false;
        }
        fac = a[i] / b[i - 1];
        b[i] -= fac * c[i - 1];
        x[i] -= fac * x[i - 1];
    }

    if (b[n - 1] === 0) {
        console.log('tridiagonalSolve: failed due to singular matrix');
        return false;
    }
    x[n - 1] /= b[n - 1];
    for (i = n - 2; i >= 0; i--) {
        if (b[i] === 0) {
            console.log('tridiagonalSolve: failed due to singular matrix');
            return false;
        }
        x[i] = (x[i] - c[i] * x[i + 1]) / b[i];
    }
    return true;
}

function updateCurves() {
    var n = k.length - 1;
    B = Array(n);

    for (var i = 0; i < n; i++) {
        B[i] = new Curve();
    }
    
    if (n == 1) {
        B[0].p0 = k[0];
        B[0].p1 = k[0];
        B[0].p2 = k[1];
        B[0].p3 = k[1];
    } else if (n > 1) {
        var mat, dx, dy, p1x, p1y, p2;
        if (n == 2) {
            mat = [[2, 1], [2, 7]];
    
            dx = [k[0].x + 2 * k[1].x, 8 * k[1].x + k[2].x];
            dy = [k[0].y + 2 * k[1].y, 8 * k[1].y + k[2].y];
    
            p1x = math.multiply(math.inv(mat), dx);
            p1y = math.multiply(math.inv(mat), dy);
        } else {
            var a, b, c;

            dx = [k[0].x + 2 * k[1].x];
            dy = [k[0].y + 2 * k[1].y];

            for (var i = 1; i < n - 1; i++) {
                dx.push(4 * k[i].x + 2 * k[i + 1].x);
                dy.push(4 * k[i].y + 2 * k[i + 1].y);
            }

            dx.push(8 * k[1].x + k[2].x);
            dy.push(8 * k[1].y + k[2].y);

            p1x = dx;
            p1y = dy;

            a = Array(n);
            a[0] = 0;
            a.fill(1, 1);
            a[n - 1] = 2;

            b = Array(n);
            b[0] = 2;
            b.fill(4, 1);
            b[n - 1] = 7

            c = Array(n);
            c.fill(1);
            c[n - 1] = 0;

            solveTridiagonal(n, a, b, c, p1x);
            solveTridiagonal(n, a, b, c, p1y);

            /*
            mat = Array(n);
            
            for (var i = 0; i < n; i++) {
                mat[i] = Array(n).fill(0);
            }
            for (var i = 1; i < n - 1; i++) {
                mat[i][i - 1] = 1;
                mat[i][i] = 4;
                mat[i][i + 1] = 1;
            }

            mat[0][0] = 2;
            mat[0][1] = 1;
            mat[n - 1][n - 2] = 2;
            mat[n - 1][n - 1] = 7;

            */
        }
    
        p2 = [];

        for (var i = 0; i < n; i++) {
            p2.push(new Point(2 * k[i + 1].x - p1x[i + 1], 2 * k[i + 1].y - p1y[i + 1]))
        }

        p2[n - 1].x = 0.5 * (k[n].x + p1x[n - 1]);
        p2[n - 1].y = 0.5 * (k[n].y + p1y[n - 1]);

        for (var i = 0; i < n; i++) {
            B[i].p0 = k[i];
            B[i].p1 = new Point(p1x[i], p1y[i]);
            B[i].p2 = p2[i];
            B[i].p3 = k[i + 1];
        }
    }
}

function pointAdd() {
    var waypoint = new Waypoint(screenWidth / 2, screenHeight / 2);
    k.push(waypoint);
    updateCurves();
}

function pointRemove() {
    k = k.filter(function (waypoint) { return !waypoint.active });
    updateCurves();
}

function setup() {
    createCanvas(screenWidth, screenHeight);

    btnAdd = createButton('add');
    btnAdd.position(screenWidth, screenHeight);
    btnAdd.mousePressed(pointAdd);

    btnRemove = createButton('remove');
    btnRemove.position(screenWidth - btnAdd.width - btnRemove.width / 2, screenHeight);
    btnRemove.mousePressed(pointRemove);

    pointAdd();
    pointAdd();
    pointAdd();
    pointAdd();
    pointAdd();
    k[0].x = 100;
    k[0].y = 100;
    k[1].x = 200;
    k[1].y = 100;
    k[2].x = 300;
    k[2].y = 200;
    k[2].x = 400;
    k[2].y = 50;
    k[2].x = 400;
    k[2].y = 50;
}

function draw() {
    background('white');
    for (var i = 0; i < k.length; i++) {
        k[i].draw();
    }

    for (var i = 0; i < B.length; i++) {
        try {
            B[i].draw();
        } catch (e) {
            console.error(e);
        }
    }
}

function mousePressed() {
    if (k.length > 0) {
        for (var i = 0; i < k.length; i++) {
            var waypoint = k[i],
                distance = dist(mouseX, mouseY, waypoint.x, waypoint.y);
            if (distance < radius) {
                for (var i = 0; i < k.length; i++) {
                    if (k[i].active) {
                        k[i].active = false;
                    }
                }
                waypoint.active = true;
                break;
            } else {
                waypoint.active = false;
            }
        }
    }
    return false;
}

function mouseDragged() {
    if (k.length > 0) {
        for (var i = 0; i < k.length; i++) {
            var waypoint = k[i];
            if (waypoint.active) {
                waypoint.x = mouseX;
                waypoint.y = mouseY;
                updateCurves();
                break;
            }
        }
    }
    return false;
}
