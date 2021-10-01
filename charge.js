class PointCharge {
    constructor(position, charge) {
        this.position = position;
        this.charge = charge;

        this.selected = false;
        this.moveable = false;
    }

    distance(inX, inY) {
        return (sqrt((inX - this.position.x) ** 2 + (inY - this.position.y) ** 2));
    }
}

class Vector {
    constructor(origin) {
        this.origin = origin;

        this.arrow = createVector(0, 0);
        this.magnitude = 0;

        this.tempVector = createVector(0, 0);
    }
}