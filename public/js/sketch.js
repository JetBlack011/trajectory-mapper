/* eslint-disable no-redeclare */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
var bg, fieldScale = .5,
    screenHeight   = 1298,
    screenWidth    = 638,
    lastActive     = null,
    active         = false,
    pointRadius    = 5

var wheelRadius     = 12.75;
    maxVelocity     = 78.7402 / 12,
    maxAcceleration = 30 / 12,
    maxJerk         = 39.3701 / 12;

var trajectory,
    profile;

var inputWheelRadius,
    inputMaxVelocity,
    inputMaxAcceleration,
    inputMaxJerk;

/* p5 Functions */
function setup() {
    // Canvas setup
    createCanvas(screenHeight, screenWidth);
    bg = loadImage('public/assets/field1298x638.jpeg');

    // DOM setup
    let divPoint = document.getElementById('points');
    //dragElement(divPoint);
    divPoint.style.top = 0;
    divPoint.style.right = 0;
    inputWheelRadius = document.getElementById('input-radius');
    inputWheelRadius.value = wheelRadius.toFixed(4);
    inputMaxVelocity = document.getElementById('input-velocity');
    inputMaxVelocity.value = maxVelocity.toFixed(4);
    inputMaxAcceleration = document.getElementById('input-acceleration');
    inputMaxAcceleration.value = maxAcceleration.toFixed(4);
    inputMaxJerk = document.getElementById('input-jerk');
    inputMaxJerk.value = maxJerk.toFixed(4);

    // Trajectory and motion profile instantiation
    trajectory = new Trajectory(fieldScale);
    profile = new MotionProfile(trajectory, wheelRadius, maxVelocity, maxAcceleration, maxJerk);
    profile.show = false;
}

function draw() {
    background(bg);
    trajectory.draw();
    profile.draw();
}

function mousePressed() {
    if (trajectory.points.length > 0) {
        for (let i = 0; i < trajectory.points.length; ++i) {
            let waypoint = trajectory.points[i],
                distance = dist(mouseX, mouseY, waypoint.x, waypoint.y);
            if (distance < pointRadius) {
                for (let i = 0; i < trajectory.points.length; ++i) {
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
    for (let i = 0; i < trajectory.points.length; ++i) {
        if (trajectory.points[i].active) {
            update();
        }
    }
}

function mouseDragged() {
    if (trajectory.points.length > 0) {
        if (active) {
            for (let i = 0; i < trajectory.points.length; ++i) {
                let waypoint = trajectory.points[i];
                if (waypoint.active) {
                    profile.show = false;
                    waypoint.x = mouseX;
                    waypoint.y = mouseY;
                    update();
                    break;
                }
            }
        }
    }
    return false;
}

/* Update and Syncing Functions */
function tableUpdate() {
    let tbl, tbody, tr, tdi, tdx, tdy, inputx, inputy;
    tbl = document.getElementById('tbl-points');
    tbody = tbl.tBodies[0];

    if (trajectory.points.length > 0) {
        if (tbody.rows[0].cells[0].getAttribute('colspan') === '3') {
            tbody.deleteRow(0);
        }
        if (tbody.childElementCount < trajectory.points.length) {
            for (let i = 0; i < trajectory.points.length - tbody.childElementCount; ++i) {
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
                inputx.className = "point";
                inputy.className = "point";
                tdx.appendChild(inputx);
                tdy.appendChild(inputy);
                tdx.className = "data";
                tdy.className = "data";
            }
        }
        if (tbody.childElementCount > trajectory.points.length) {
            for (let i = 0; i < tbody.childElementCount - trajectory.points.length; ++i) {
                tbody.deleteRow(i);
            }
        }

        for (let i = 0; i < trajectory.points.length; ++i) {
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

function updateConstants() {
    maxVelocity = parseInt(inputMaxVelocity.value);    
    maxAcceleration = parseInt(inputMaxAcceleration.value);
    maxJerk = parseInt(inputMaxJerk.value);
    profile.update(maxVelocity, maxAcceleration, maxJerk);
}

function update() {
    tableUpdate();
    trajectory.update();
    profile.update();
}

function tableSync() {
    let tbl, tbody, tr, waypoint;
    tbl = document.getElementById('tbl-points');
    tbody = tbl.tBodies[0];

    for (let r = 0; r < tbody.rows.length; ++r) {
        tr = tbody.rows[r];
        waypoint = trajectory.points[r];

        waypoint.x = parseInt(tr.cells[1].firstChild.value) / fieldScale;
        waypoint.y = parseInt(tr.cells[2].firstChild.value) / fieldScale;
    }
    update();
}

/* Trajectory Manipulation Functions */
function pointAdd() {
    trajectory.add(screenHeight / 2, screenWidth / 2);
    update();
}

function pointRemove() {
    let i = trajectory.points.indexOf(lastActive);
    trajectory.remove(i !== -1 ? i : trajectory.points.length - 1);
    update();
}

/* Profile exportation functions */
function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

function exportProfile() {
    let csv = profile.export().join('\n');
    download('profile.txt', csv);
}