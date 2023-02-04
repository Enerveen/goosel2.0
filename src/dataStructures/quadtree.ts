import Entity from "../entities/Entity";
import {BoundingBox, Circle, Position} from "../types";

const nodeCapacity = 50;


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


export class Quadtree {
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