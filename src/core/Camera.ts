import {Position, Vector2} from "../types";
import {BoundingBox} from "../types";


export class Camera {
    position: Position
    private fov: Vector2
    private scale: number
    private readonly aspect: number

    constructor(position: Position, fov: Vector2) {
        this.position = position;
        this.fov = fov;
        this.scale = 1;
        this.aspect = fov.y / fov.x;
    }

    public setPosition(position: Position) {
        this.position = position;
    }


    public zoom(value: number) {
        this.scale *= value;

        this.fov.x /= value;
        this.fov.y /= value;
    }


    public setZoom(value: number) {
        this.fov.x *= this.scale / value;
        this.fov.y *= this.scale / value;

        this.scale = value;
    }


    public getFovScale() {
        return this.scale;
    }


    public checkBounds(bbox: BoundingBox) {
        const halfFovX = this.fov.x / 2;
        const halfFovY = this.fov.y / 2;

        const topLeftOffset = {
            x: bbox.left - (this.position.x - halfFovX),
            y: bbox.top - (this.position.y - halfFovY)
        }

        this.position.x += Math.max(0, topLeftOffset.x);
        this.position.y += Math.max(0, topLeftOffset.y);

        const bottomRightOffset = {
            x: Math.max(0, this.position.x + halfFovX - bbox.right),
            y: Math.max(0, this.position.y + halfFovY - bbox.bottom)
        }

        if (bottomRightOffset.x > 0 && topLeftOffset.x >= 0) {
            this.position.x -= bottomRightOffset.x / 2;
            this.fov.x -= bottomRightOffset.x;
        } else if (topLeftOffset.x < 0) {
            this.position.x -= bottomRightOffset.x;
        }
        if (bottomRightOffset.y > 0 && topLeftOffset.y >= 0) {
            this.position.y -= bottomRightOffset.y / 2;
            this.fov.y -= bottomRightOffset.y;
        } else if (topLeftOffset.y < 0) {
            this.position.y -= bottomRightOffset.y;
        }

        this.scale /= this.fov.x / (2 * halfFovX)
    }
}


enum MouseCameraControllerState {
    Moving,
    NoUpdate
}


class MouseCameraController {
    prevPosition: Position
    state: MouseCameraControllerState
    constructor() {
        this.prevPosition = { x:  0, y: 0}
        this.state = MouseCameraControllerState.NoUpdate
    }

    public moveStart(camera: Camera, mousePosition: Position) {
        this.prevPosition = mousePosition;
        this.state = MouseCameraControllerState.Moving;
    }


    public moveStop() {
        this.state = MouseCameraControllerState.NoUpdate;
    }


    public moveUpdate(camera: Camera, mousePosition: Position) {
        if (this.state === MouseCameraControllerState.Moving) {
            camera.position.x -= (mousePosition.x - this.prevPosition.x) / camera.getFovScale();
            camera.position.y -= (mousePosition.y - this.prevPosition.y) / camera.getFovScale();

            this.prevPosition = mousePosition;
        }
    }
}


export const mouseCameraController = new MouseCameraController();