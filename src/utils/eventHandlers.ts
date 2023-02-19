import React from "react";
import Renderer from "../graphics/Renderer"
import {Camera, mouseCameraController} from "../graphics/Camera";
import {cameraConstants} from "../constants/view";
import {findDistance} from "./helpers";
import simulationStore from "../stores/simulationStore";

export const handleCanvasClick = (
    event: React.MouseEvent<HTMLCanvasElement>,
    renderer: Renderer,
) => {
    const entities = simulationStore.getAnimals
    const {setActiveEntity, removeActiveEntity} = simulationStore
    const activeEntity = entities.find(animal => {
        const {width, height, offsetX, offsetY} = renderer.calculateAnimalTexture({
            gender: animal.gender,
            age: animal.age.current,
            isAlive: animal.isAlive
        })

        if (renderer.context) {
            const transform = renderer.context.getTransform();
            const position = {
                x: animal.position.x * transform.a + transform.e,
                y: animal.position.y * transform.d + transform.f
            }

            const bounds = {
                left: position.x - width * offsetX * transform.a,
                right: position.x + width * (1 - offsetX) * transform.a,
                top: position.y - height * offsetY * transform.d,
                bottom: position.y + height * (1 - offsetY) * transform.d
            }

            return event.nativeEvent.offsetX > bounds.left &&
                event.nativeEvent.offsetX < bounds.right &&
                event.nativeEvent.offsetY > bounds.top &&
                event.nativeEvent.offsetY < bounds.bottom
        }

        return undefined;
    })

    if (activeEntity) {
        setActiveEntity(activeEntity)
    } else {
        removeActiveEntity()
    }
}


export const handleCanvasMousePress = (
    event: React.MouseEvent<HTMLCanvasElement>,
    camera: Camera) => {
    mouseCameraController.moveStart(camera, {x: event.clientX, y: event.clientY});
}


export const handleCanvasMouseRelease = () => {
    mouseCameraController.moveStop();
}


export const handleCanvasMouseMove = (
    event: React.MouseEvent<HTMLCanvasElement>,
    camera: Camera) => {
    mouseCameraController.moveUpdate(camera, {x: event.clientX, y: event.clientY}, 1);
}

export const handleCanvasMouseWheel = (
    event: React.WheelEvent<HTMLCanvasElement>,
    clientWidth: number,
    clientHeight: number,
    camera: Camera) => {
    const fovScalePrev = camera.getFovScale();
    const zoom = 1 - 0.001 * event.deltaY;

    camera.setZoom(Math.max(cameraConstants.minZoom, Math.min(cameraConstants.maxZoom, camera.getFovScale() * zoom)));

    const p = camera.getFovScale() / fovScalePrev - 1.0;
    const ddx = camera.fov.x / clientWidth;
    const ddy = camera.fov.y / clientHeight;
    const dd = Math.max(ddx, ddy);

    camera.position.x += p * dd * (event.clientX - clientWidth / 2.0);
    camera.position.y += p * dd * (event.clientY - clientHeight / 2.0);
}

export const handleCanvasTouchStart = (
    event: React.TouchEvent<HTMLCanvasElement>,
    camera: Camera,
    touchRef: { start: number, end: number }
) => {
    if (event.touches.length === 1) {
        mouseCameraController.moveStart(camera, {x: event.touches[0].clientX, y: event.touches[0].clientY});
    }
    if (event.touches.length === 2){
        touchRef.start = findDistance(
            {x: event.touches[0].clientX, y: event.touches[0].clientY},
            {x: event.touches[1].clientX, y: event.touches[1].clientY}
        )
    }
}

export const handleCanvasTouchMove = (
    event: React.TouchEvent<HTMLCanvasElement>,
    camera: Camera,
    touchRef: { start: number, end: number },
) => {
    if (event.touches.length === 1) {
        mouseCameraController.moveUpdate(camera, {x: event.touches[0].clientX, y: event.touches[0].clientY}, 4);
    }
    if (event.touches.length === 2) {
        const end = findDistance(
            {x: event.touches[0].clientX, y: event.touches[0].clientY},
            {x: event.touches[1].clientX, y: event.touches[1].clientY}
        )
        camera.setZoom(
            Math.max(cameraConstants.minZoom,
                Math.min(cameraConstants.maxZoom, camera.getFovScale() * (1 - 0.01 * (touchRef.start - end)))))
    }
}

export const handleCanvasTouchEnd = (
    event: React.TouchEvent<HTMLCanvasElement>
) => {
    if (event.touches.length === 1) {
        mouseCameraController.moveStop();
    }
}