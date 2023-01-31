import {Position, Vector2} from "../types";
import {BoundingBox} from "../types";
import {cameraConstants} from "../constants/view";


export class Camera {
    position: Position
    fov: Vector2
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
        const boxWidth = bbox.right - bbox.left;
        const boxHeight = bbox.bottom - bbox.top;

        const newFov = {
            x: Math.min(this.fov.x, boxWidth),
            y: Math.min(this.fov.y, boxHeight)
        }

        const newAspect = newFov.y / newFov.x;
        if (newAspect < this.aspect) {
            newFov.x = newFov.y / this.aspect;
        } else if (newAspect > this.aspect) {
            newFov.y = newFov.x * this.aspect;
        }

        const topLeftOffset = {
            x: bbox.left - (this.position.x - newFov.x / 2),
            y: bbox.top - (this.position.y - newFov.y / 2)
        }
        const bottomRightOffset = {
            x: Math.max(0, this.position.x + newFov.x / 2 - bbox.right),
            y: Math.max(0, this.position.y + newFov.y / 2 - bbox.bottom)
        }

        this.position.x += Math.max(0, topLeftOffset.x) - Math.max(0, bottomRightOffset.x);
        this.position.y += Math.max(0, topLeftOffset.y) - Math.max(0, bottomRightOffset.y);

        this.scale *= Number((this.fov.x / newFov.x).toFixed(9));
        this.fov = newFov;
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