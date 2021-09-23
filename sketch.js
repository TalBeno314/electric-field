let pointCharges = [];
let chargeSum = 0;
let averageCharge = 0;
let maxCharge = 0;
let minCharge = Infinity;
let chargeVisible = true;

let selectedPosition;

let num = 20;

let vectors;

let Kc = 9 * 10 ** 9;

let newCharge, newX, newY;

let touchTime;

function setup() {
    createCanvas(600, 600);
    vectors = new Array(num + 1);
    for (let i = 0; i < vectors.length; i++) {
        vectors[i] = new Array(num + 1);
        for (let j = 0; j < vectors[i].length; j++) {
            vectors[i][j] = createVector(i * (width / (num)), j * (height / (num)));
        }
    }

    newX = createInput().position(160, 610);
    createP('Insert New x Coordinate: ').position(0, 595);
    newY = createInput().position(160, 640);
    createP('Insert New y Coordinate: ').position(0, 625);
    newCharge = createInput().position(160, 670);
    createP('Insert New Charge [nC]: ').position(0, 655);

    createButton('Create New Point Charge').position(350, 610).mouseClicked(createNewCharge);
    createButton('Make Charges Invisible').position(350, 640).mouseClicked(makeInvisible);

    createButton('Next Charge').position(350, 670).mouseClicked(next);
    createButton('Previous Charge').position(450, 670).mouseClicked(previous);
}

function draw() {
    background(0);
    chargeSum = 0;

    vectors.forEach((vectorArray, index) => {
        vectorArray.forEach(vector => {
            let field = createVector(0, 0);

            pointCharges.forEach(pointCharge => {
                let position = pointCharge.position;
                let E = Kc * pointCharge.charge * 10 ** (-9) / (pointCharge.distance(vector.x, vector.y) ** 2)
                let tempVector = createVector(Math.abs(vector.x - position.x), Math.abs(vector.y - position.y));
                let direction = createVector(1, 0).angleBetween(tempVector);

                let E_x = (Math.abs(E) ** 2) * Math.cos(direction) * (tempVector.x) / ((vector.x - position.x) * E);
                let E_y = (Math.abs(E) ** 2) * Math.sin(direction) * (tempVector.y) / ((vector.y - position.y) * E);

                field.x += E_x;
                field.y += E_y;

                /*chargeSum += Math.abs(E);
                if (Math.abs(E) > maxCharge) maxCharge = Math.abs(E);
                if (Math.abs(E) < minCharge) minCharge = Math.abs(E);*/
            });

            let tempVector = createVector(Math.abs(field.x), Math.abs(field.y));
            let magnitude = sqrt(tempVector.magSq());
            let direction = createVector(1, 0).angleBetween(tempVector);

            let F_x = (width / num - 10) * Math.cos(direction) * tempVector.x / field.x;
            let F_y = (width / num - 10) * Math.sin(direction) * tempVector.y / field.y;

            let arrow = createVector(F_x, F_y);

            chargeSum += Math.abs(magnitude);
            if (Math.abs(magnitude) > maxCharge) maxCharge = Math.abs(magnitude);
            if (Math.abs(magnitude) < minCharge) minCharge = Math.abs(magnitude);

            let c;
            if (averageCharge > 0) {
                let temp = interpolateLinearly(magnitude / (averageCharge * 2), jet);
                let r = Math.round(255 * temp[0]);
                let g = Math.round(255 * temp[1]);
                let b = Math.round(255 * temp[2]);

                c = color(r, g, b);

                if (magnitude > averageCharge * 2) {
                    red = 1 - map(magnitude, averageCharge * 2, maxCharge + 1, 0, 1);
                    c = color(red * 255, 0, 0);
                }
                //c = color(100, 100, 255 * magnitude / (averageCharge * 2))
            } else {
                c = 'black'
            }

            drawArrow(vector, arrow, c);
        })
    });

    averageCharge = chargeSum / ((num + 1) ** 2);

    if (chargeVisible) {
        pointCharges.forEach(charge => {
            if (charge.selected) {
                fill(200);
            } else {
                fill(255);
            }
            circle(charge.position.x, charge.position.y, 30);
            fill(0);
            textAlign(CENTER, CENTER);
            textSize(20)
            text(charge.charge.toString(), charge.position.x, charge.position.y);

            if (charge.selected && keyIsPressed) {
                if (keyCode == LEFT_ARROW) charge.position.x -= 5;
                if (keyCode == RIGHT_ARROW) charge.position.x += 5;
                if (keyCode == UP_ARROW) charge.position.y -= 5;
                if (keyCode == DOWN_ARROW) charge.position.y += 5;
            }
        });
    }
}

function keyPressed() {
    let selectedCharge = pointCharges.find(charge => charge.selected);
    let index = pointCharges.indexOf(selectedCharge);

    if (selectedCharge != undefined) {
        if (keyCode === DELETE) {
            pointCharges.splice(index, 1);
        } else if (keyCode === ENTER) {
            selectedCharge.selected = false;
        } else {
            if (!isNaN(key)) {
                let str = selectedCharge.charge.toString();
                if (str != "0") {
                    selectedCharge.charge = parseFloat(str + key);
                } else {
                    selectedCharge.charge = parseFloat(key);
                }
            } else if (keyCode === BACKSPACE) {
                let str = selectedCharge.charge.toString();
                if (str.length > 1) {
                    selectedCharge.charge = parseFloat(str.slice(0, str.length - 1));
                } else {
                    selectedCharge.charge = 0;
                }
            }
        }
    }
    switch (keyCode) {

    }
}

/*function touchStarted() {
    let selectedCharge = pointCharges.find(charge => charge.distance(mouseX, mouseY) < 15);
    if (selectedCharge != undefined) {
        selectedCharge.selected = true;
        selectedPosition = selectedCharge.position;
        touchTime = performance.now();
    } else {
        pointCharges.forEach(charge => {
            charge.selected = false;
        })
    }
}

function touchEnded() {
    let selectedCharge = pointCharges.find(charge => charge.selected);
    let timeEnded = performance.now();
    if (timeEnded - touchTime > 100) {
        if (selectedCharge != undefined) {
            selectedCharge.position = selectedPosition;
        }
        pointCharges.forEach(charge => {
            charge.selected = false;
        });
    }

    touchTime = 0;
}*/

function createNewCharge() {
    let x = newX.value()
    let y = newY.value()
    let charge = newCharge.value()

    console.log(x, y, charge);

    if (x.length > 0 && y.length > 0 && charge.length > 0) {
        if (!isNaN(x) && !isNaN(y) && !isNaN(charge)) {
            x = parseFloat(x);
            y = parseFloat(y);
            charge = parseFloat(charge);

            pointCharges.push(new PointCharge(createVector(x, y), charge));
        }
    }
}

function drawArrow(base, vec, myColor) {
    push();
    stroke(myColor);
    strokeWeight(3);
    fill(myColor);
    translate(base.x, base.y);
    line(0, 0, vec.x, vec.y);
    rotate(vec.heading());
    let arrowSize = 7;
    translate(vec.mag() - arrowSize, 0);
    triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
    pop();
}

function makeInvisible() {
    chargeVisible = !chargeVisible;
}

function next() {
    let selected = pointCharges.find(charge => charge.selected)
    console.log(selected);
    if (selected != undefined) {
        let index = pointCharges.indexOf(selected);
        selected.selected = false;
        if (index < pointCharges.length - 1) {
            pointCharges[index + 1].selected = true;
            console.log(pointCharges[index + 1]);
        }
    } else {
        //selected.selected = false;
        pointCharges[0].selected = true;

    }
}

function previous() {
    let selected = pointCharges.find(charge => charge.selected);
    console.log(selected);
    if (selected != undefined) {
        let index = pointCharges.indexOf(selected);
        selected.selected = false;
        if (index >= 1) {
            pointCharges[index - 1].selected = true;
        }
    } else {
        pointCharges[pointCharges.length - 1].selected = true;
    }
}