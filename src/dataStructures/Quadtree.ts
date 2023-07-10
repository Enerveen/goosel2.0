import Entity from "../entities/Entity";
import {Position} from "../types";

const nodeCapacity = 50;

export class Circle {
    x: number
    y: number
    r: number

    constructor(x: number, y: number, r: number) {
        this.x = x;
        this.y = y;
        this.r = r;
    }


    check(position: Position) {
        return (position.x - this.x) ** 2 + (position.y - this.y) ** 2 < this.r ** 2;
    }


    obbIntersectionImpl(obb: BoundingBox) {
        const halfWidth = (obb.right - obb.left) / 2;
        const halfHeight = (obb.bottom - obb.top) / 2;
        const center = {
            x: obb.left + halfWidth,
            y: obb.top + halfHeight
        }

        const circleVector = {
            x: Math.abs(center.x - this.x),
            y: Math.abs(center.y - this.y)
        }

        if (circleVector.x > halfWidth + this.r) {
            return false;
        }
        if (circleVector.y > halfHeight + this.r) {
            return false;
        }

        if (circleVector.x <= halfWidth) {
            return true;
        }
        if (circleVector.y <= halfHeight) {
            return true;
        }

        return (circleVector.x - halfWidth) ** 2 + (circleVector.y - halfHeight) ** 2 <= this.r ** 2;
    }
}


export class BoundingBox {
    left: number = 0
    right: number = 0
    top: number = 0
    bottom: number = 0


    constructor(left: number=0, right: number=0, top: number=0, bottom: number=0) {
        this.left = left;
        this.right = right;
        this.top = top;
        this.bottom = bottom;
    }


    check(position: Position) {
        return position.x >= this.left &&
            position.x <= this.right &&
            position.y >= this.top &&
            position.y <= this.bottom;
    }


    intersects(obb: BoundingBox | Circle) {
        return obb.obbIntersectionImpl(this)
    }


    obbIntersectionImpl(obb: BoundingBox) {
        return Math.max(this.right, obb.right) - Math.min(this.left, obb.left) <= this.right - this.left + obb.right - obb.left &&
            Math.max(this.bottom, obb.bottom) - Math.min(this.top, obb.top) <= this.bottom - this.top + obb.bottom - obb.top;
    }
}

class Node {
    obb: BoundingBox

    entities: Entity[] = []

    topLeft?: Node
    topRight?: Node
    bottomLeft?: Node
    bottomRight?: Node


    constructor(obb: BoundingBox) {
        this.obb = obb;
    }


    push(entity: Entity) {
        if (this.isLeaf() && this.entities.length < nodeCapacity) {
            this.entities.push(entity);

            return;
        }

        if (this.isLeaf()) {
            this.topLeft = new Node(this.makeObbTopLeft());
            this.topRight = new Node(this.makeObbTopRight());
            this.bottomLeft = new Node(this.makeObbBottomLeft());
            this.bottomRight = new Node(this.makeObbBottomRight());

            this.entities.forEach(ent => {
                this.tryPushChild(ent);
            })

            this.entities = [];
        }

        this.tryPushChild(entity);
    }


    get(obb: BoundingBox | Circle) {
        let result: Entity[] = [];

        if (!this.obb.intersects(obb)) {
            return result;
        }

        if (!this.isLeaf()) {
            result = result.concat(this.topLeft?.get(obb) || []).concat(this.topRight?.get(obb) || []).concat(this.bottomLeft?.get(obb) || []).concat(this.bottomRight?.get(obb) || []);
        } else {
            this.entities.forEach(entity => {
                if (obb.check(entity.position)) {
                    result.push(entity);
                }
            })
        }

        return result;
    }


    private isLeaf() {
        return this.topLeft === undefined;
    }


    tryPushChild(entity: Entity) {
        if (this.topLeft?.obb.check(entity.position)) {
            this.topLeft?.push(entity);
        }
        if (this.topRight?.obb.check(entity.position)) {
            this.topRight?.push(entity);
        }
        if (this.bottomLeft?.obb.check(entity.position)) {
            this.bottomLeft?.push(entity);
        }
        if (this.bottomRight?.obb.check(entity.position)) {
            this.bottomRight?.push(entity);
        }
    }


    private makeObbTopLeft() {
        const obb = new BoundingBox();
        obb.left = this.obb.left;
        obb.right = this.obb.left + (this.obb.right - this.obb.left) / 2;
        obb.top = this.obb.top;
        obb.bottom = this.obb.top + (this.obb.bottom - this.obb.top) / 2;

        return obb;
    }


    private makeObbTopRight() {
        const obb = new BoundingBox();
        obb.left = this.obb.left + (this.obb.right - this.obb.left) / 2;
        obb.right = this.obb.right;
        obb.top = this.obb.top;
        obb.bottom = this.obb.top + (this.obb.bottom - this.obb.top) / 2;

        return obb;
    }


    private makeObbBottomLeft() {
        const obb = new BoundingBox();
        obb.left = this.obb.left;
        obb.right = this.obb.left + (this.obb.right - this.obb.left) / 2;
        obb.top = this.obb.top + (this.obb.bottom - this.obb.top) / 2;
        obb.bottom = this.obb.bottom;

        return obb;
    }


    private makeObbBottomRight() {
        const obb = new BoundingBox();
        obb.left = this.obb.left + (this.obb.right - this.obb.left) / 2;
        obb.right = this.obb.right;
        obb.top = this.obb.top + (this.obb.bottom - this.obb.top) / 2;
        obb.bottom = this.obb.bottom;

        return obb;
    }


    dbgDraw(ctx: CanvasRenderingContext2D) {
        ctx.strokeStyle = '#FF0000FF';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.obb.left, this.obb.top, this.obb.right - this.obb.left, this.obb.bottom - this.obb.top);

        // this.entities.forEach(entity => {
        //     ctx.strokeRect(entity.position.x, entity.position.y, 1, 1);
        // })

        if (!this.isLeaf()) {
            this.topLeft?.dbgDraw(ctx);
            this.topRight?.dbgDraw(ctx);
            this.bottomLeft?.dbgDraw(ctx);
            this.bottomRight?.dbgDraw(ctx);
        }
    }
}


class Quadtree {
    node: Node


    constructor(position: Position, size: number) {
        this.node = new Node(new BoundingBox(position.x, position.x + size, position.y, position.y + size));
    }


    push(entity: Entity) {
        if (this.node.obb.check(entity.position)) {
            this.node.push(entity);
        }
    }


    get(obb: BoundingBox | Circle) {
        return this.node.get(obb);
    }


    dbgDraw(ctx: CanvasRenderingContext2D) {
        this.node.dbgDraw(ctx);
    }
}

export default Quadtree