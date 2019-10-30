/// <reference path="./p5.global-mode.d.ts" />

var bg, multiplier = 2,
    screenHeight = 1298,
    screenWidth = 638;
var btnAdd, btnRemove, radius = 5;
var trajectory;
var lastActive = null;
var active = false;

function setup() {
    var divPoint = document.getElementById('points');
    createCanvas(screenHeight, screenWidth);
    dragElement(divPoint);
    divPoint.style.top = 0;
    divPoint.style.right = 0;
    bg = loadImage('public/assets/field1298x638.jpeg');
    trajectory = new Trajectory();
}

function draw() {
    background(bg);
    trajectory.draw();
}

function pointAdd() {
    trajectory.add(screenHeight / 2, screenWidth / 2);
    tableUpdate();
}

function pointRemove() {
    var i = trajectory.points.indexOf(lastActive);
    trajectory.remove(i !== -1 ? i : trajectory.points.length - 1);
    tableUpdate();
}

function tableUpdate() {
    var tbl, tbody, tr, tdi, tdx, tdy, inputx, inputy;
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
                inputx = document.createElement('input');
                inputy = document.createElement('input');
                inputx.oninput = tableSync;
                inputy.oninput = tableSync;
                inputx.onclick = inputx.focus;
                inputy.onclick = inputy.focus;
                tdx.appendChild(inputx);
                tdy.appendChild(inputy);
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
            tr.cells[1].firstChild.value = Math.ceil(trajectory.points[i].x / multiplier);
            tr.cells[2].firstChild.value = Math.ceil(trajectory.points[i].y / multiplier);
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

function tableSync() {
    var tbl, tbody, tr, waypoint;
    tbl = document.getElementById('tbl-points');
    tbody = tbl.tBodies[0];

    for (var r = 0; r < tbody.rows.length; r++) {
        tr = tbody.rows[r];
        waypoint = trajectory.points[r];

        waypoint.x = parseInt(tr.cells[1].firstChild.value) * multiplier || 0;
        waypoint.y = parseInt(tr.cells[2].firstChild.value) * multiplier || 0;
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

function mouseReleased() {
    for (var i = 0; i < trajectory.points.length; i++) {
        if (trajectory.points[i].active) {
            tableUpdate();
        }
    }
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