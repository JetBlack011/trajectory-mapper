/// <reference path="./p5.global-mode.d.ts" />

var bg, screenHeight = 319, screenWidth = 649;
var btnAdd, btnRemove, radius = 5;
var trajectory;
var lastActive = null;
var active = false;

function setup() {
    createCanvas(windowWidth, windowHeight);
    //bg = loadImage('assets/field.png');
    trajectory = new Trajectory();
}

function draw() {
    background('white');
    trajectory.draw();
}

function pointAdd() {
    trajectory.add();
}

function pointRemove() {
    trajectory.remove(trajectory.points.indexOf(lastActive));
}

function tableUpdate() {
    var tbl, tbody, tr, tdi, tdx, tdy;
    tbl = document.getElementById('tbl-points');
    tbody = tbl.tBodies[0];

    if (trajectory.points.length > 0) {
        if (tbody.rows[0].cells[0].getAttribute('colspan') === '3') {
            tbody.deleteRow(0);
        }
        if (tbody.childElementCount < trajectory.points.length) {
            for (var i = 0; i < trajectory.points.length - tbody.childElementCount; i++) {
                tr = tbody.insertRow();
                tdi = tr.insertCell(0);
                tdx = tr.insertCell(1);
                tdy = tr.insertCell(2);
                tdx.className = "data";
                tdy.className = "data";
            }
        }
        if (tbody.childElementCount > trajectory.points.length) {
            for (var i = 0; i < tbody.childElementCount - trajectory.points.length; i++) {
                tbody.deleteRow(i);
            }
        }

        for (var i = 0; i < trajectory.points.length; i++) {
            tr = tbody.rows[i];
            tr.cells[0].innerHTML = i;
            tr.cells[1].innerHTML = trajectory.points[i].x;
            tr.cells[2].innerHTML = trajectory.points[i].y;
        }
    } else {
        while (tbody.hasChildNodes()) {
            tbody.removeChild(tbody.firstChild);
        }
        tr = tbody.insertRow(0);
        td = tr.insertCell(0);
        td.setAttribute('colspan', '3');
        td.innerHTML = "No set points";
    }
}

function mousePressed() {
    if (trajectory.points.length > 0) {
        for (var i = 0; i < trajectory.points.length; i++) {
            var waypoint = trajectory.points[i],
                distance = dist(mouseX, mouseY, waypoint.x, waypoint.y);
            if (distance < radius) {
                for (var i = 0; i < trajectory.points.length; i++) {
                    if (trajectory.points[i].active) {
                        trajectory.points[i].active = false;
                        active = false;
                    }
                }
                lastActive = waypoint;
                waypoint.active = true;
                active = true;
                break;
            } else {
                waypoint.active = false;
                active = false;
            }
        }
    }
    return false;
}

function mouseDragged() {
    if (trajectory.points.length > 0) {
        if (active) {
            for (var i = 0; i < trajectory.points.length; i++) {
                var waypoint = trajectory.points[i];
                if (waypoint.active) {
                    waypoint.x = mouseX;
                    waypoint.y = mouseY;
                    trajectory.update();
                    break;
                }
            }
        } else {
            for (var i = 0; i < trajectory.curves.length; i++) {
                if (mouseX > trajectory.curves[i].p0.x && mouseX < trajectory.curves[i].p3.x) {
                    trajectory.curves[i].t = 1 - (mouseX - trajectory.curves[i].p0.x) / (trajectory.curves[i].p3.x - trajectory.curves[i].p0.x);
                } else {
                    trajectory.curves[i].t = null;
                }
            }
        }
    }
    return false;
}
