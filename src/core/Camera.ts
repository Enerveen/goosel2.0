import {Position, Vector2} from "../types";
import {cameraConstants} from "../constants/view";


export class Camera {
    position: Position
    fov: Vector2
    scale: Vector2

    constructor(position: Position, fov: Vector2) {
        this.position = position;
        this.fov = fov;
        this.scale = {x: 1, y: 1};
    }

    public setPosition(position: Position) {
        this.position = position;
    }
}


enum MouseCamereaControllerState {
    Moving,
    NoUpdate
}


class MouseCameraController {
    prevPosition: Position
    state: MouseCamereaControllerState
    constructor() {
        this.prevPosition = { x:  0, y: 0}
        this.state = MouseCamereaControllerState.NoUpdate
    }

    public moveStart(camera: Camera, mousePosition: Position) {
        this.prevPosition = mousePosition;
        this.state = MouseCamereaControllerState.Moving;
    }


    public moveStop() {
        this.state = MouseCamereaControllerState.NoUpdate;
    }


    public moveUpdate(camera: Camera, mousePosition: Position) {
        if (this.state === MouseCamereaControllerState.Moving) {
            camera.position.x -= camera.scale.x * (mousePosition.x - this.prevPosition.x);
            camera.position.y -= camera.scale.y * (mousePosition.y - this.prevPosition.y);

            this.prevPosition = mousePosition;
        }
    }
}


export const mouseCameraController = new MouseCameraController();