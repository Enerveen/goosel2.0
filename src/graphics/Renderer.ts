import {FieldDimensions, gender, plantKind, Position, Texture, TextureAtlas} from "../types";
import {appConstants, plantsKinds} from "../constants/simulation";
import simulationStore from "../stores/simulationStore";
import Vector2 from "../dataStructures/Vector2";
import {glDriver} from "./GLDriver";
import {GLTexture} from "./GLTexture";
import Plant from "../entities/Plant";
import {GrassSystem} from "../simulationSystems/GrassSystem";

import {BoidEntity} from "../entities/BoidEntity";

const loadTexture = (image: HTMLImageElement, params: { width?: number, height?: number, offsetX?: number, offsetY?: number } = {}) => {

    return {
        image,
        width: params.width || image.width,
        height: params.height || image.height,
        offsetX: params.offsetX || 0,
        offsetY: params.offsetY || 0
    }
}


const loadTextureAtlas = (image: HTMLImageElement, params: { width?: number, height?: number, frameWidth?: number, frameHeight?: number, offsetX?: number, offsetY?: number } = {}) => {

    return {
        image,
        width: params.width || image.width,
        height: params.height || image.height,
        frameWidth: params.frameWidth || image.width,
        frameHeight: params.frameHeight || image.height,
        offsetX: params.offsetX || 0,
        offsetY: params.offsetY || 0
    }
}


class Renderer {
    context: CanvasRenderingContext2D | null
    plantAtlas: TextureAtlas
    eggsAtlas: TextureAtlas
    breedingTexture: Texture
    matureAnimalTextureAtlas: TextureAtlas
    teenAnimalTextureAtlas: TextureAtlas
    childAnimalTextureAtlas: TextureAtlas
    childCorpseTexture: Texture
    teenCorpseTexture: Texture
    matureCorpseTexture: Texture
    butterflyTextureAtlas: TextureAtlas
    butterflyWhiteTextureAtlas: TextureAtlas
    butterflyShadowTextureAtlas : TextureAtlas
    backgroundTexture: HTMLImageElement
    backgroundSeamlessTexture: HTMLImageElement
    backgroundGladeTexture: HTMLImageElement
    cloudsTexture: Texture
    grassTexture: Texture

    constructor(ctx: CanvasRenderingContext2D | null, images: any) {
        this.context = ctx || null
        const animalTextureAtlas = loadTextureAtlas(images.animalTextureAtlas, {
            frameWidth: 282,
            frameHeight: 361,
            offsetX: 0.5,
            offsetY: 0.8
        });
        const animalTextureAtlasFrameRatio = animalTextureAtlas.frameHeight / animalTextureAtlas.frameWidth
        this.teenAnimalTextureAtlas = {...animalTextureAtlas, width: 70.5, height: 70.5 * animalTextureAtlasFrameRatio};
        this.childAnimalTextureAtlas = {...animalTextureAtlas, width: 47, height: 47 * animalTextureAtlasFrameRatio};
        this.matureAnimalTextureAtlas = {...animalTextureAtlas, width: 94, height: 94 * animalTextureAtlasFrameRatio};
        const corpseTextureRatio = 262 / 421
        this.teenCorpseTexture = loadTexture(images.corpse, {
            width: 90.25,
            height: 90.25 * corpseTextureRatio,
            offsetX: 0.5,
            offsetY: 0.5
        })
        this.childCorpseTexture = loadTexture(images.corpse, {
            width: 60.16,
            height: 60.16 * corpseTextureRatio,
            offsetX: 0.5,
            offsetY: 0.5
        })
        this.matureCorpseTexture = loadTexture(images.corpse, {
            width: 120.3,
            height: 120.3 * corpseTextureRatio,
            offsetX: 0.5,
            offsetY: 0.5
        })
        this.eggsAtlas = loadTextureAtlas(images.eggAtlas, {frameWidth: 200, frameHeight: 201, width: 44, height: 44, offsetX: 0.5, offsetY: 0.5});
        this.plantAtlas = loadTextureAtlas(images.plantAtlas, {
            frameWidth: 300,
            frameHeight: 330,
            offsetY: 0.5,
            offsetX: 0.5,
            width: 45,
            height: 49.5
        })
        this.cloudsTexture = loadTexture(images.clouds);
        this.breedingTexture = loadTexture(images.heart, {width: 20, height: 20, offsetX: 0.5, offsetY: 0.5});
        this.grassTexture = loadTexture(images.grass, {offsetX: 0.5, offsetY: 0.97});

        const butterfliesParams = {width: 8, height: 8, frameWidth: 25, frameHeight: 25, offsetX: 0.5, offsetY: 0.5};
        this.butterflyTextureAtlas = loadTextureAtlas(images.butterflyTextureAtlas, butterfliesParams);
        this.butterflyWhiteTextureAtlas = loadTextureAtlas(images.butterflyWhiteTextureAtlas, butterfliesParams);
        this.butterflyShadowTextureAtlas = loadTextureAtlas(images.butterflyShadowTextureAtlas, butterfliesParams);

        this.backgroundTexture = images.background
        this.backgroundSeamlessTexture = images.backgroundSeamless
        this.backgroundGladeTexture = images.backgroundGlade
    }


    public drawBackground(size: FieldDimensions) {
        const [image, {width, height}] = [this.backgroundTexture, size]
        if (this.context) {
            this.context.drawImage(image, 0, 0, width, height)
        }
    }


    public drawSeamlessBackground(size: FieldDimensions) {
        const [image, gladeImage, {width, height}] = [this.backgroundSeamlessTexture, this.backgroundGladeTexture, size]

        if (!this.context || !glDriver.gl) {
            return;
        }

        const tileSize = {
            width: image.width / 3,
            height: image.height / 3
        }

        const countX = Math.floor(width / tileSize.width);
        const countY = Math.floor(height / tileSize.height);

        for (let i = 0; i < countY + 1; i++) {
            for (let j = 0; j < countX + 1; j++) {
                const cutX = Math.min(tileSize.width, size.width - j * tileSize.width) / tileSize.width;
                const cutY = Math.min(tileSize.height, size.height - i * tileSize.height) / tileSize.height;

                // if (i === 1 && j === 1) {
                //     this.context.drawImage(gladeImage, 0, 0, cutX * gladeImage.width, cutY * gladeImage.height, j * tileSize.width, i * tileSize.height, cutX * tileSize.width, cutY * tileSize.height)
                // } else {
                //     this.context.drawImage(image, 0, 0, cutX * image.width, cutY * image.height,j * tileSize.width, i * tileSize.height, cutX * tileSize.width, cutY * tileSize.height)
                // }


                glDriver.drawImage(GLTexture.fromImage(image), 1, 1, [{x: (j + 0.5) * tileSize.width, y: (i + 0.5) * tileSize.height}], [{x: 0, y: 0}], {x: 0.5 * tileSize.width, y: 0.5 * tileSize.height});
            }
        }
    }


    public drawClouds() {
        const timestamp = simulationStore.getTimestamp
        if (this.context) {
            const width = 10.0 * this.cloudsTexture.width;
            const height = 10.0 * this.cloudsTexture.height;

            this.context.save();

            // Uncomment to adjust brightness
            // this.context.fillStyle = 'rgba(100, 100, 150, 1)';
            // this.context.globalCompositeOperation = 'multiply';
            // this.context.fillRect(0, 0, fieldSize.x, fieldSize.y)
            // this.context.fillStyle = 'rgba(100, 100, 255, 0.1)';
            // this.context.globalCompositeOperation = 'overlay';
            // this.context.fillRect(0, 0, fieldSize.x, fieldSize.y)
            //
            const image = this.cloudsTexture.image;
            const position = {
                x: -500 - height / 4 * (0.5 * Math.cos(0.0002 * timestamp) + 0.5),
                y: -500 - height / 4 * (0.5 * Math.sin(0.0002 * timestamp) + 0.5)
            }

            this.context.globalAlpha = 0.45;
            this.context.globalCompositeOperation = 'source-atop';
            // this.context.drawImage(this.cloudsTexture.image,
            //     position.x,
            //     position.y,
            //     width,
            //     height);

            if (glDriver.gl && glDriver.defaultShader) {
                const scale = {
                    x: 0.5 * width,
                    y: 0.5 * height
                }

                glDriver.gl.disable(glDriver.gl.DEPTH_TEST);
                glDriver.gl.uniform1f(glDriver.gl.getUniformLocation(glDriver.defaultShader.glShaderProgram, 'u_maxAlpha'), 0.45);
                glDriver.drawImage(GLTexture.fromImage(image), 1, 1, [{x: position.x, y: position.y, z: 0.1}], [{x: 0, y: 0}], scale);
            }

            this.context.restore();
        }
    }


    public drawPlants(plants: Plant[]) {
        if (!glDriver.defaultShader) {
            return;
        }

        const [{
            image,
            width,
            height,
            frameWidth,
            frameHeight,
            offsetX,
            offsetY}] = [this.plantAtlas]

        const posBuffer: Position[] = []
        const frameBuffer: Position[] = []
        const scale = {
            x: 0.5 * width,
            y: 0.5 * height
        }


        plants.forEach(plant => {
            const position = {
                x: plant.position.x - (offsetX - 0.5) * width,
                y: plant.position.y - (offsetY - 0.5) * height,
                z: plant.position.y
            }
            const frame = {
                x: ['common', ...plantsKinds].indexOf(plant.kind),
                y: 0
            }

            posBuffer.push(position)
            frameBuffer.push(frame);
        })

        //glDriver.gl?.uniform1i(glDriver.gl.getUniformLocation(glDriver.defaultShader.glShaderProgram, 'u_isSkew'), 1);
        glDriver.drawImage(GLTexture.fromImage(image), image.width / frameWidth, image.height / frameHeight, posBuffer, frameBuffer, scale);
    }


    public drawButterflies(boids: BoidEntity[], timestamp: number) {
        if (this.context) {
            const animationSpeed = 0.2 * appConstants.fps;

            boids.forEach((butterfly, index) => {
                if (!this.context) {
                    return
                }

                const currentFrame = Math.floor(((timestamp + 37 * index) % animationSpeed) / animationSpeed * 16);

                const position = {
                    x: butterfly.position.x - this.butterflyTextureAtlas.offsetX * this.butterflyTextureAtlas.width,
                    y: butterfly.position.y - this.butterflyTextureAtlas.offsetY * this.butterflyTextureAtlas.height
                }

                const angle = Math.atan2(butterfly.direction.y, butterfly.direction.x) + Math.PI / 2;

                this.context.save();
                //this.context.globalCompositeOperation = 'destination-out';
                this.context.translate(butterfly.position.x, butterfly.position.y);
                this.context.rotate(angle);
                this.context.translate(-butterfly.position.x, -butterfly.position.y);
                this.context.drawImage(this.butterflyTextureAtlas.image,
                    this.butterflyTextureAtlas.frameWidth * (currentFrame % 4),
                    this.butterflyTextureAtlas.frameHeight * Math.floor(currentFrame / 4),
                    this.butterflyTextureAtlas.frameWidth,
                    this.butterflyTextureAtlas.frameHeight,
                    position.x,
                    position.y,
                    this.butterflyTextureAtlas.width,
                    this.butterflyTextureAtlas.height
                );

                this.context.restore();
            })


            if (!glDriver.gl) {
                return;
            }

            const [{
                image,
                width,
                height,
                frameWidth,
                frameHeight,
                offsetX,
                offsetY}] = [this.butterflyTextureAtlas]

            const posBuffer: Position[] = []
            const frameBuffer: Position[] = []
            const scale = {
                x: 0.5 * width,
                y: 0.5 * height
            }


            boids.forEach((boid, index) => {
                const position = {
                    x: boid.position.x - (offsetX - 0.5) * width,
                    y: boid.position.y - (offsetY - 0.5) * height,
                    z: boid.position.y
                }

                const currentFrame = Math.floor(((timestamp + 37 * index) % animationSpeed) / animationSpeed * 16);
                const frame = {
                    x: currentFrame % 4,
                    y: Math.floor(currentFrame / 4)
                }

                posBuffer.push(position)
                frameBuffer.push(frame);
            })

            glDriver.drawImage(GLTexture.fromImage(image), 4, 4, posBuffer, frameBuffer, scale);
        }
    }




    drawGrass(grassSystem: GrassSystem) {
        if (!glDriver.defaultShader) {
            return;
        }

        const [{
            image,
            width,
            height,
            offsetX,
            offsetY}] = [this.grassTexture]

        const posBuffer: Position[] = []
        const frameBuffer: Position[] = []
        const buffer: number[] = []
        const scale = {
            x: 0.15 * width,
            y: 0.15 * height
        }

        grassSystem.positions.forEach(plant => {
            const position = {
                x: plant.position.x - (offsetX - 0.5) * scale.x,
                y: plant.position.y - (offsetY - 0.5) * scale.y,
                z: plant.position.y
            }
            const frame = {
                x: 0,
                y: 0
            }

            posBuffer.push(position)
            frameBuffer.push(frame);
        })

        grassSystem.states.forEach(state => {
            buffer.push(state.age);
        })

        glDriver.gl?.uniform1i(glDriver.gl.getUniformLocation(glDriver.defaultShader.glShaderProgram, 'u_isSkew'), 1);
        glDriver.drawImage(GLTexture.fromImage(image), 1, 1, posBuffer, frameBuffer, scale, buffer);
    }




    public drawPlant(position: Position, kind: plantKind) {
        const [{
            image,
            width,
            height,
            frameWidth,
            frameHeight,
            offsetX,
            offsetY
        },
            {x, y}] = [this.plantAtlas, position]
        if (this.context) {
            const kindIndex = ['common', ...plantsKinds].indexOf(kind)
            const originOffset = { x: offsetX * width, y: offsetY * height };
            this.context.drawImage(image, frameWidth * kindIndex, 0, frameWidth, frameHeight, x - originOffset.x, y - originOffset.y, width, height );

            if (glDriver.gl) {
                const scale = {
                    x: 0.5 * width,
                    y: 0.5 * height
                }
                //this.context.scale(0.5, 0.5);
                //glDriver.drawImage(GLTexture.fromImage(image), [{x: x - (offsetX - 0.5) * width, y: y - (offsetY - 0.5) * height, z: y}], scale);
            }
        }
    }

    public drawAnimal(
        position: Position,
        entity: { gender: gender, name: string, age: number, currentActivity: string, birthTimestamp: number, direction: Vector2 }) {
        if (this.context) {
            const animationFrameId = simulationStore.getTimestamp - entity.birthTimestamp
            const [{image, width, height, frameWidth, frameHeight, offsetX, offsetY}, {x, y}]
                = [this.calculateAnimalTexture(entity), position]
            const heading = entity.direction?.x < 0 ? 1 : 0

            const currentFrame = Math.floor((animationFrameId % appConstants.fps) / appConstants.fps * 19);
            const originOffset = { x: offsetX * width, y: offsetY * height };
            // if (frameWidth) {
            //     this.context.drawImage(image, frameWidth * currentFrame, frameHeight * heading, frameWidth, frameHeight, x - originOffset.x, y - originOffset.y, width, height)
            // } else {
            //     this.context.drawImage(image, x - originOffset.x, y - originOffset.y, width, height)
            // }

            if (glDriver.gl) {
                const scale = {
                    x: 0.5 * width,
                    y: 0.5 * height
                }
                const numFrame = {
                    x: frameWidth > 0 ? image.width / frameWidth : 1,
                    y: frameHeight > 0 ? image.height / frameHeight : 1
                }

                if (frameWidth) {
                    glDriver.drawImage(GLTexture.fromImage(image), numFrame.x, numFrame.y, [{
                        x: x - (offsetX - 0.5) * width,
                        y: y - (offsetY - 0.5) * height,
                        z: y
                    }], [{x: currentFrame, y: heading}], scale);
                } else {
                    glDriver.drawImage(GLTexture.fromImage(image), 1, 1, [{
                        x: x - (offsetX - 0.5) * width,
                        y: y - (offsetY - 0.5) * height,
                        z: y
                    }], [{x: 0, y: 0}], scale);
                }
            }
        }
    }

    public drawBreeding(position: Position) {
        const [{image, width, height, offsetX, offsetY}, {x, y}] = [this.breedingTexture, position]
        if (this.context) {
            this.context.drawImage(image, x - offsetX * width, y - offsetY * height, width, height)
        }
    }

    public drawLabels(position: Position,
                      entity: { gender: gender, name: string, age: number, currentActivity: string }
    ) {
        if (!this.context) {
            return
        }
        const [{width, height, offsetX, offsetY}, {x, y},
            {gender, name, age, currentActivity}] = [this.calculateAnimalTexture(entity), position, entity]
        const originOffset = {x: offsetX * width, y: offsetY * height};
        this.context.textAlign = 'center';
        this.context.font = "bold 18px AmasticBold"
        const styles = [
            'rgba(0, 0, 0)',
            `rgba(${gender === 'male' ? '0,180,255' : '255,100,255'},1.0)`
        ]

        styles.forEach((style, index) => {
            const textPos = {
                x: x + 2 * (styles.length - index - 1),
                y: y + 2 * (styles.length - index - 1)
            }

            if (this.context) {
                this.context.fillStyle = style;
                this.context.fillText(name, textPos.x - originOffset.x + width / 2, textPos.y - originOffset.y - 26)
                this.context.fillText(age >= 0 ? `${age} y.o.` : 'Egg',
                    textPos.x - originOffset.x + width / 2, textPos.y - originOffset.y - 6)
            }
        })
        if (currentActivity === 'breeding') {
            this.drawBreeding({x: x + 30 - offsetX * width, y: y - 90})
        }
    }

    public drawLogs() {
        const timestamp = simulationStore.getTimestamp
        const logs = simulationStore.getLog
        if (this.context) {
            this.context.save()
            this.context.resetTransform()
            this.context.font = "bold 24px Amastic"
            this.context.textAlign = 'left';
            logs.filter(({timestamp: messageTimestamp}) => timestamp - messageTimestamp < 1300)
                .reverse()
                .forEach(({message, timestamp: messageTimestamp}, index) => {
                    // @ts-ignore
                    this.context.fillStyle = `rgba(250, 250, 250, ${1 - (timestamp - messageTimestamp - 300) / 1000})`
                    this.context?.fillText(message, 10, 50 + index * 24)
                })
            this.context.restore()
        }
    }

    public drawEgg(position: Position) {
        if (this.context) {
            const [{image, frameHeight, frameWidth, width, height, offsetX, offsetY},
                {x, y}] = [this.eggsAtlas, position]
            const originOffset = {x: offsetX * width, y: offsetY * height};
            const eggType = Math.floor(position.x) % 3
            this.context.drawImage(image, frameWidth * eggType, 0, frameWidth, frameHeight, x - originOffset.x, y - originOffset.y, width, height)

            if (glDriver.gl) {
                const scale = {
                    x: 0.5 * width,
                    y: 0.5 * height
                }

                glDriver.drawImage(GLTexture.fromImage(image), image.width / frameWidth, image.height / frameHeight, [{
                    x: x - (offsetX - 0.5) * width,
                    y: y - (offsetY - 0.5) * height,
                    z: y
                }], [{x: eggType, y: 0}], scale);
            }
        }
    }

    public drawCorpse(position: Position, age: number) {
        if (this.context) {
            const [{image, width, height, offsetX, offsetY},
                {x, y}] = [this.calculateCorpseTexture(age), position]
            const originOffset = {x: offsetX * width, y: offsetY * height};
            this.context.drawImage(image, x - originOffset.x, y - originOffset.y, width, height)

            if (glDriver.gl) {
                const scale = {
                    x: 0.5 * width,
                    y: 0.5 * height
                }

                glDriver.drawImage(GLTexture.fromImage(image), 1, 1, [{
                    x: x - (offsetX - 0.5) * width,
                    y: y - (offsetY - 0.5) * height,
                    z: y
                }], [{x: 0, y: 0}], scale);
            }
        }
    }

    public calculateCorpseTexture(age: number) {
        if (age >= 0 && age < 5) {
            return this.childCorpseTexture
        }

        if (age >= 5 && age < 10) {
            return this.teenCorpseTexture
        }

        return this.matureCorpseTexture
    }

    calculateAnimalTexture(entity: { gender: gender, age: number }) {
        const {age} = entity
        if (age >= 0 && age < 5) {
            return this.childAnimalTextureAtlas
        }

        if (age >= 5 && age < 10) {
            return this.teenAnimalTextureAtlas
        }

        return this.matureAnimalTextureAtlas
    }
}

export default Renderer