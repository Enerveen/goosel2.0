class Vector2 {
    x: number = 0
    y: number = 0


    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }


    normalize() {
        const norm = this.norm();
        this.x /= norm;
        this.y /= norm;

        return this;
    }


    normalized() {
        return new Vector2(this.x, this.y).normalize();
    }


    clamp(magnitude: number) {
        const length = this.norm();

        this.normalize();
        this.x *= Math.min(length, magnitude);
        this.y *= Math.min(length, magnitude);

        return this;
    }


    clamped(magnitude: number) {
        return new Vector2(this.x, this.y).clamp(magnitude);
    }


    norm() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }


    static dot(v1: Vector2, v2: Vector2) {
        return v1.x * v2.x + v1.y * v2.y;
    }
}

export default Vector2