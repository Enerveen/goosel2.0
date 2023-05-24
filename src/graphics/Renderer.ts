import {FieldDimensions, gender, plantKind, Position, Texture, TextureAtlas} from "../types";
import {appConstants, plantsKinds} from "../constants/simulation";
import simulationStore from "../stores/simulationStore";
import Vector2 from "../dataStructures/Vector2";


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
    gaySexTexture: Texture
    matureAnimalTextureAtlas: TextureAtlas
    teenAnimalTextureAtlas: TextureAtlas
    childAnimalTextureAtlas: TextureAtlas
    childCorpseTexture: Texture
    teenCorpseTexture: Texture
    matureCorpseTexture: Texture
    backgroundTexture: HTMLImageElement
    backgroundSeamlessTexture: HTMLImageElement
    backgroundGladeTexture: HTMLImageElement
    cloudsTexture: Texture

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
        this.childAnimalTextureAtlas = loadTextureAtlas(images.childTextureAtlas, {
            frameWidth: 156,
            frameHeight:200,
            width: 39,
            height: 50
        })
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
        this.gaySexTexture = loadTexture(images.heartGay, {width: 20, height: 20, offsetX: 0.5, offsetY: 0.5});

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

        if (!this.context) {
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
                // temporary fix, it can surely be done better
                if (i === 1 && j === 1) {
                    this.context.drawImage(gladeImage, 0, 0, cutX * gladeImage.width, cutY * gladeImage.height, j * tileSize.width, i * tileSize.height, cutX * (tileSize.width + 1), cutY * (tileSize.height + 1))
                } else {
                    this.context.drawImage(image, 0, 0, cutX * image.width, cutY * image.height, j * tileSize.width, i * tileSize.height, cutX * (tileSize.width + 1), cutY * (tileSize.height + 1))
                }
            }
        }
    }


    public drawClouds() {
        const timestamp = simulationStore.getTimestamp
        if (this.context) {
            const width = 10.0 * this.cloudsTexture.width;
            const height = 10.0 * this.cloudsTexture.height;

            this.context.save();
            this.context.globalAlpha = 0.45;
            this.context.globalCompositeOperation = 'source-atop';
            this.context.drawImage(this.cloudsTexture.image,
                -500 - height / 4 * (0.5 * Math.cos(0.0002 * timestamp) + 0.5),
                -500 - height / 4 * (0.5 * Math.sin(0.0002 * timestamp) + 0.5),
                width,
                height);
            this.context.restore();
        }
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
            const originOffset = {x: offsetX * width, y: offsetY * height};
            this.context.drawImage(image, frameWidth * kindIndex, 0, frameWidth, frameHeight, x - originOffset.x, y - originOffset.y, width, height);
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
            const originOffset = {x: offsetX * width, y: offsetY * height};
            if (frameWidth) {
                this.context.drawImage(image, frameWidth * currentFrame, frameHeight * heading, frameWidth, frameHeight, x - originOffset.x, y - originOffset.y, width, height)
            } else {
                this.context.drawImage(image, x - originOffset.x, y - originOffset.y, width, height)
            }
        }
    }

    public drawBreeding(position: Position, isGay = false) {
        const [{image, width, height, offsetX, offsetY}, {x, y}] =
            [isGay ? this.breedingTexture : this.gaySexTexture, position]
        if (this.context) {
            this.context.drawImage(image, x - offsetX * width, y - offsetY * height, width, height)
        }
    }

    public drawLabels(position: Position,
                      entity: { gender: gender, name: string, age: number, currentActivity: string, isGay: boolean }
    ) {
        if (!this.context) {
            return
        }
        const [{width, height, offsetX, offsetY}, {x, y},
            {gender, name, age, currentActivity, isGay}] = [this.calculateAnimalTexture(entity), position, entity]
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
            this.drawBreeding({x: x + 30 - offsetX * width, y: y - 90}, isGay)
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

        }
    }

    public drawCorpse(position: Position, age: number) {
        if (this.context) {
            const [{image, width, height, offsetX, offsetY},
                {x, y}] = [this.calculateCorpseTexture(age), position]
            const originOffset = {x: offsetX * width, y: offsetY * height};
            this.context.drawImage(image, x - originOffset.x, y - originOffset.y, width, height)
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