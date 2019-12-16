/* eslint-disable no-redeclare */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/// <reference path="./p5.global-mode.d.ts" />

var bg, fieldScale = .5,
    screenHeight   = 1298,
    screenWidth    = 638,
    lastActive     = null,
    active         = false,
    radius         = 5,
    trajectory;

const maxVelocity     = 186,
      maxAcceleration = 46.5,
      maxJerk         = 93;

function setup() {
    var divPoint = document.getElementById('points');
    createCanvas(screenHeight, screenWidth);
    dragElement(divPoint);
    divPoint.style.top = 0;
    divPoint.style.right = 0;
    bg = loadImage('public/assets/field1298x638.jpeg');
    trajectory = new Trajectory(fieldScale);
    trajectory.add(200, 200);
    tableUpdate();
    trajectory.add(400, 400);
    tableUpdate();
    trajectory.add(600, 200);
    tableUpdate();
    trajectory.update();
    profile = new MotionProfile(trajectory, maxVelocity, maxAcceleration, maxJerk);
}

function draw() {
    background(bg);
    trajectory.draw();
}

function generateProfile() {
    if (trajectory.points.length > 1) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", '/profile', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({
            trajectory: trajectory
        }));
    }
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
            for (let i = 0; i < trajectory.points.length - tbody.childElementCount; i++) {
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
            for (let i = 0; i < tbody.childElementCount - trajectory.points.length; i++) {
                tbody.deleteRow(i);
            }
        }

        for (let i = 0; i < trajectory.points.length; i++) {
            tr = tbody.rows[i];
            tr.cells[0].innerHTML = i;
            tr.cells[1].firstChild.value = trajectory.points[i].x * fieldScale;
            tr.cells[2].firstChild.value = trajectory.points[i].y * fieldScale;
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

        waypoint.x = parseInt(tr.cells[1].firstChild.value) / fieldScale || 0;
        waypoint.y = parseInt(tr.cells[2].firstChild.value) / fieldScale || 0;
    }
    trajectory.update();
}

function mousePressed() {
    if (trajectory.points.length > 0) {
        for (let i = 0; i < trajectory.points.length; i++) {
            var waypoint = trajectory.points[i],
                distance = dist(mouseX, mouseY, waypoint.x, waypoint.y);
            if (distance < radius) {
                for (let i = 0; i < trajectory.points.length; i++) {
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
    for (let i = 0; i < trajectory.points.length; i++) {
        if (trajectory.points[i].active) {
            tableUpdate();
        }
    }
}

function mouseDragged() {
    if (trajectory.points.length > 0) {
        if (active) {
            for (let i = 0; i < trajectory.points.length; i++) {
                var waypoint = trajectory.points[i];
                if (waypoint.active) {
                    waypoint.x = mouseX;
                    waypoint.y = mouseY;
                    trajectory.update();
                    break;
                }
            }
        }
    }
    return false;
}