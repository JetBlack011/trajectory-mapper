/// <reference path="./p5.global-mode.d.ts" />

var screenHeight = 400, screenWidth = 720;
var btnAdd, btnRemove;
var waypoints = [], radius = 5;
var p0 = [], p1 = [], p2 = [], p3 = [];

/*
function solveTridiagonal(n, a, b, c, x) {
    var i, fac;
  
    // Eliminate
    for (i = 1; i < n; i++) {
        if (b[i - 1] === 0) {
            return false;
        }
        fac = a[i] / b[i - 1];
        b[i] -= fac * c[i - 1];
        x[i] -= fac * x[i - 1];
    }

    // Back-substitute
    if (b[n - 1] === 0) {
        return false;
    }
    x[n - 1] /= b[n - 1]
    for (i = n - 2; i >= 0; i--) {
        if (b[i] === 0) {
            return false;
        }
        x[i] = (x[i] - c[i] * x[i + 1]) / b[i];
    }
    return true;
}
*/

class Waypoint {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.active = false;
    }

    draw() {
        noStroke();
        fill('black');
        ellipse(this.x, this.y, this.radius * 2, this.radius * 2);
        if (this.active) {
            noFill();
            stroke('red');
            rect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
        }
    }
}

function pointAdd() {
    waypoints.push(new Waypoint(screenWidth / 2, screenHeight / 2));
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
    btnRemove.position(screenWidth - (btnAdd.width + btnRemove.width) / 2, screenHeight);
    btnRemove.mousePressed(pointRemove);
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