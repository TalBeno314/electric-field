let pointCharges = [];
let maxStrength = 0;
let minStrength = Infinity;
let chargeVisible = true;

let num = 20;
let distance = 30;

let vectors;

let newCharge, newX, newY;

let touchTime;

function setup() {
    createCanvas(810, 600);
    frameRate(30);

    vectors = new Array(floor(width / distance) + 1);
    for (let i = 0; i < vectors.length; i++) {
        vectors[i] = new Array(num + 1);
        for (let j = 0; j < vectors[i].length; j++) {
            vectors[i][j] = new Vector(createVector(i * (distance), j * (height / (num))));
        }
    }

    newX = createInput().position(200, 610);
    createP('Insert New x Coordinate: ').position(0, 595);
    newY = createInput().position(200, 640);
    createP('Insert New y Coordinate: ').position(0, 625);
    newCharge = createInput().position(200, 670);
    createP('Insert New Charge Quantity: ').position(0, 655);

    createButton('Create New Charge').position(380, 610).mouseClicked(createNewCharge);
    createButton('Make Charges Invisible').position(380, 640).mouseClicked(makeInvisible);

    createButton('Next Charge').position(380, 670).mouseClicked(next);
    createButton('Previous Charge').position(480, 670).mouseClicked(previous);

    createButton('Delete Charge').position(520, 610).mouseClicked(deleteCharge);
}

function draw() {
    background(0);
    minStrength = Infinity;
    maxStrength = 0;

    //calculating field strength and direction for each vector.
    vectors.forEach((vectorArray, index) => {
        vectorArray.forEach(eVector => {
            let vector = eVector.origin;
            let field = createVector(0, 0);

            pointCharges.forEach(pointCharge => {
                //calculating field strength for a specific charge
                let position = pointCharge.position;
                let r = pointCharge.distance(vector.x, vector.y);
                let direction = createVector((position.x - vector.x) / r, (position.y - vector.y) / r);
                let Emag = -pointCharge.charge / r ** 2;
                let E = createVector(direction.x * Emag, direction.y * Emag);

                field.x += E.x;
                field.y += E.y;
            });

            let closeCharge = pointCharges.find(charge => charge.distance(vector.x, vector.y) < 15);
            if (closeCharge == undefined) {
                let Fmag = sqrt(field.magSq());
                let arrow = createVector((distance - 10) * field.x / Fmag, (distance - 10) * field.y / Fmag);

                //updating the values of the maximum field strength and the minimum field strength
                if (Math.abs(Fmag) > maxStrength) maxStrength = Math.abs(Fmag);
                if (Math.abs(Fmag) < minStrength) minStrength = Math.abs(Fmag);

                //storing the arrow vector and magnitude in the Vector object
                //to be later used to draw the vector
                eVector.arrow = arrow;
                eVector.magnitude = Fmag;
            }
        })
    });

    for (let i = 0; i < vectors.length; i++) {
        for (let j = 0; j < vectors[i].length; j++) {
            //drawing the vectors:
            //the reason the vectors weren't drawn in the previous loop (forEach) is beacuse
            //the maxCharge needs to be calculated in order to colour the arrows correctly

            let arrow = vectors[i][j].arrow;
            let magnitude = vectors[i][j].magnitude;
            let origin = vectors[i][j].origin;

            let c;
            if (maxStrength > 0) {
                let temp = interpolateLinearly(((magnitude) / maxStrength) ** (1 / 4), jet);
                let r = Math.round(255 * temp[0]);
                let g = Math.round(255 * temp[1]);
                let b = Math.round(255 * temp[2]);

                c = color(r, g, b);

                if (magnitude == 0) {
                    c = color(0);
                }
            } else {
                c = 'black'
            }

            drawArrow(origin, arrow, c);
        }
    }

    //drawing the charges if the user didn't set them to be invisible
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

            /*if (charge.selected && keyIsPressed) {
                if (keyCode == LEFT_ARROW) charge.position.x -= 5;
                if (keyCode == RIGHT_ARROW) charge.position.x += 5;
                if (keyCode == UP_ARROW) charge.position.y -= 5;
                if (keyCode == DOWN_ARROW) charge.position.y += 5;
            }*/

            if (charge.moveable) {
                charge.position.x = mouseX;
                charge.position.y = mouseY;
            }
        });
    }
}

function touchStarted() {
    //make all charges stationary
    pointCharges.forEach(charge => {
        charge.moveable = false;
    });

    //detected a charge such that the mouse is on the circle representing it
    let selectedCharge = pointCharges.find(charge => charge.distance(mouseX, mouseY) < 15);
    if (selectedCharge != undefined) {
        //making the charge moveable
        selectedCharge.moveable = true;
    }
}

function touchEnded() {
    //making all charges stationary
    pointCharges.forEach(charge => {
        charge.moveable = false;
    })
}

function createNewCharge() {
    //retrieving value from input boxes
    let x = newX.value();
    let y = newY.value();
    let charge = newCharge.value();

    if (x.length > 0 && y.length > 0 && charge.length > 0) { //checking that all of the inputs are not empty
        if (!isNaN(x) && !isNaN(y) && !isNaN(charge)) { //checking that all inputs are numbers
            x = parseFloat(x);
            y = parseFloat(y);
            charge = parseFloat(charge);

            pointCharges.push(new PointCharge(createVector(x, y), charge)); //creating a new charge

            newX.value("")
            newY.value("")
                //newCharge.value("")
        }
    }

    if (x.length == 0 && y.length == 0 && charge.length > 0) {
        if (!isNaN(charge)) {
            charge = parseFloat(charge);
            let selectedCharge = pointCharges.find(charge => charge.selected);
            if (selectedCharge != undefined) {
                selectedCharge.charge = charge;
            } else {
                pointCharges.push(new PointCharge(createVector(width / 2, height / 2), charge));
            }
        }
    }

    if (x.length == 0 && y.length == 0 && charge.length == 0) {
        pointCharges.push(new PointCharge(createVector(width / 2, height / 2), 1));
    }

    newX.value("")
    newY.value("")
}

function drawArrow(base, vec, myColor) {
    //need to learn how the fuck that works
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
    if (selected != undefined) {
        let index = pointCharges.indexOf(selected);
        selected.selected = false;
        if (index < pointCharges.length - 1) {
            pointCharges[index + 1].selected = true;
        }
    } else {
        pointCharges[0].selected = true;

    }
}

function previous() {
    let selected = pointCharges.find(charge => charge.selected);
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

function deleteCharge() {
    let selected = pointCharges.find(charge => charge.selected);

    if (selected != undefined) {
        let index = pointCharges.indexOf(selected);
        pointCharges.splice(index, 1);
    }
}