import React from "react";
import Renderer from "../graphics/Renderer";
import Animal from "../entities/Animal";
import {Camera, mouseCameraController} from "../graphics/Camera";
import {cameraConstants} from "../constants/view";

export const handleCanvasClick = (
    event: React.MouseEvent<HTMLCanvasElement>,
    renderer: Renderer,
    entities: Animal[],
    setActiveEntity: (entity: Animal) => void,
    removeActiveEntity: () => void) => {
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
    mouseCameraController.moveUpdate(camera, {x: event.clientX, y: event.clientY});
}

export const handleCanvasMouseWheel = (
    event: React.WheelEvent<HTMLCanvasElement>,
    camera: Camera) => {
    camera.setZoom(Math.max(cameraConstants.minZoom, Math.min(cameraConstants.maxZoom, camera.getFovScale() * (1 - 0.001 * event.deltaY))));
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
        touchRef.start = event.touches[0].clientY
    }
}

export const handleCanvasTouchMove = (
    event: React.TouchEvent<HTMLCanvasElement>,
    camera: Camera,
    touchRef: { start: number, end: number },
) => {
    if (event.touches.length === 1) {
        mouseCameraController.moveUpdate(camera, {x: event.touches[0].clientX, y: event.touches[0].clientY});
    }
    if (event.touches.length === 2) {
        //event.preventDefault()
        touchRef.end = event.touches[0].clientY
    }
}

export const handleCanvasTouchEnd = (
    event: React.TouchEvent<HTMLCanvasElement>,
    camera: Camera,
    touchRef: { start: number, end: number }
) => {
    if (event.touches.length === 1) {
        mouseCameraController.moveStop();
    }
    if (event.touches.length === 2){
        camera.setZoom(
            Math.max(cameraConstants.minZoom,
                Math.min(cameraConstants.maxZoom, camera.getFovScale() * (1 - 0.001 * (touchRef.start - touchRef.end)))));
    }

}