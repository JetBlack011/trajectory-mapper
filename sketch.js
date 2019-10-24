/// <reference path="./p5.global-mode.d.ts" />

var screenHeight = 400, screenWidth = 720;
var btnAdd, btnRemove;
var waypoints = [], radius = 5;
var p0 = [], p1 = [], p2 = [], p3 = [];

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Waypoint extends Point {
    constructor(x, y) {
        super(x, y);
        this.p0 = this;
        this.p1 = null;
        this.p2 = null;
        this.p3 = null;
        this.radius = radius;
        this.active = false;
    }

    draw() {
        noStroke();
        fill('black');
        ellipse(this.x, this.y, this.radius * 2, this.radius * 2);
        if (this.p3) {
            bezier(this.p0.x, this.p0.y, this.p1.x, this.p1.y, this.p2.x, this.p2.y, this.p3.x, this.p3.y);
        }
        if (this.active) {
            noFill();
            stroke('red');
            rect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
        }
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
    var n = waypoints.length - 1; 
    
    if (n > 0) {
        var dx = [waypoints[0].x + 2 * waypoints[1].x];
        var dy = [waypoints[0].y + 2 * waypoints[1].y];

        for (var i = 0; i < n; i++) {
            dx.push(waypoints[i].x + waypoints[i + 1].x);
            dy.push(waypoints[i].y + waypoints[i + 1].y);
        }
        dx.push(8 * waypoints[n - 1].x + waypoints[n].x);
        dy.push(8 * waypoints[n - 1].y + waypoints[n].y);

        var p1x = solveTridiagonal(n, [0, 1, 2], [2, 4, 7], [1, 1, 0], dx);
        var p1y = solveTridiagonal(n, [0, 1, 2], [2, 4, 7], [1, 1, 0], dy);
        for (var i = 0; i < n - 1; i++) {
            waypoints[i].p1 = new Point(p1x[i], p1y[i]);
            waypoints[i].p2 = new Point(2 * waypoints[i + 1].x - p1x[i], 2 * waypoints[i + 1].y, p1y[i]);
        } 
        waypoints[n - 1].p1 = new Point(p1x[n - 1], p1y[n - 1]);
        waypoints[n - 1].p2 = new Point(.5 * (waypoints[n].x + p1x[n - 1]), .5 * (waypoints[n].y + p1y[n - 1]));
    }
}

function pointAdd() {
    var waypoint = new Waypoint(screenWidth / 2, screenHeight / 2);
    waypoints.push(waypoint);
    updateCurves();
}

function pointRemove() {
    waypoints = waypoints.filter(function (waypoint) { return !waypoint.active });
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
    waypoints[0].x = 50;
    waypoints[0].y = 50;
    pointAdd();
    waypoints[1].x = 100;
    waypoints[1].y = 100;
    updateCurves();
}

function draw() {
    background('white');
    if (waypoints.length > 0) {
        for (var i = 0; i < waypoints.length; i++) {
            waypoints[i].draw();
        }
        stroke('blue');
        noFill(); 
        for (var i = 0; i < waypoints.length - 1; i++) {
            p0 = waypoints[i];
            p3 = waypoints[i+1];

            //bezier(p0.x, p0.y, 0, 0, 0, 0, p3.x, p3.y); 
        }
    }
}

function mousePressed() {
    if (waypoints.length > 0) {
        for (var i = 0; i < waypoints.length; i++) {
            var waypoint = waypoints[i],
                distance = dist(mouseX, mouseY, waypoint.x, waypoint.y);
            if (distance < radius) {
                waypoint.active = true;
            } else {
                waypoint.active = false;
            }
        }
    }
    return false;
}

function mouseDragged() {
    if (waypoints.length > 0) {
        for (var i = 0; i < waypoints.length; i++) {
            var waypoint = waypoints[i];
            if (waypoint.active) {
                waypoint.x = mouseX;
                waypoint.y = mouseY;
                break;
            }
        }
    }
    return false;
}
