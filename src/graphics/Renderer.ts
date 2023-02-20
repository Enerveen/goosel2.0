import {FieldDimensions, gender, plantKind, Position, Texture, TextureAtlas} from "../types";
import {appConstants, plantsKinds} from "../constants/simulation";
import simulationStore from "../stores/simulationStore";


const loadTexture = (image: HTMLImageElement, params: {width?: number, height?: number, offsetX?: number, offsetY?: number}={}) => {

    return {
        image,
        width: params.width || image.width,
        height: params.height || image.height,
        offsetX: params.offsetX || 0,
        offsetY: params.offsetY || 0
    }
}


const loadTextureAtlas = (image: HTMLImageElement, params: {width?: number, height?: number, frameWidth?: number, frameHeight?: number, offsetX?: number, offsetY?: number}={}) => {

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
    egg: Texture
    breedingTexture: Texture
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
        const animalTextureAtlas = loadTextureAtlas(images.animalTextureAtlas, {frameWidth: 350, frameHeight: 370, offsetX: 0.5, offsetY: 0.8});
        this.teenAnimalTextureAtlas = {...animalTextureAtlas, width: 87.5, height: 92.5};
        this.childAnimalTextureAtlas = {...animalTextureAtlas, width: 43.75, height: 46.25};
        this.matureAnimalTextureAtlas = {...animalTextureAtlas, width: 131.5, height: 138.75};
        this.childCorpseTexture = loadTexture(images.corpse, {width: 46.25, height: 28.7, offsetX: 0.5, offsetY: 0.5})
        this.teenCorpseTexture = loadTexture(images.corpse, {width: 92.5, height: 57.5, offsetX: 0.5, offsetY: 0.5})
        this.matureCorpseTexture = loadTexture(images.corpse, {width: 138.75, height: 86.35, offsetX: 0.5, offsetY: 0.5})
        this.egg = loadTexture(images.egg_slider, {width: 32, height: 40, offsetX: 0.5, offsetY: 0.5});
        this.plantAtlas = loadTextureAtlas(images.plantAtlas, {frameWidth: 300, frameHeight: 330, offsetY: 0.5, offsetX: 0.5, width: 45, height:49.5})
        this.cloudsTexture = loadTexture(images.clouds);
        this.breedingTexture = loadTexture(images.heart, {width: 20, height: 20, offsetX: 0.5, offsetY: 0.5});

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

                if (i === 1 && j === 1) {
                    this.context.drawImage(gladeImage, 0, 0, cutX * gladeImage.width, cutY * gladeImage.height, j * tileSize.width, i * tileSize.height, cutX * tileSize.width, cutY * tileSize.height)
                } else {
                    this.context.drawImage(image, 0, 0, cutX * image.width, cutY * image.height,j * tileSize.width, i * tileSize.height, cutX * tileSize.width, cutY * tileSize.height)
                }
            }
        }
    }


    public drawClouds() {
        const timestamp = simulationStore.getTimestamp
        const {fieldSize: {width: fieldWidth, height: fieldHeight}} = simulationStore.getSimulationConstants
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
            offsetY},
            {x, y}] = [this.plantAtlas, position]
        if (this.context) {
            const kindIndex = ['common', ...plantsKinds].indexOf(kind)
            const originOffset = { x: offsetX * width, y: offsetY * height };
            this.context.drawImage(image, frameWidth * kindIndex, 0, frameWidth, frameHeight, x - originOffset.x, y - originOffset.y, width, height );
        }
    }

    public drawAnimal(
        position: Position,
        entity: { gender: gender, name: string, isAlive: boolean, age: number, currentActivity: string, birthTimestamp: number }) {
        if (this.context) {
            const animationFrameId = simulationStore.getTimestamp - entity.birthTimestamp
            const [{image, width, height, frameWidth, frameHeight, offsetX, offsetY}, {x, y}]
                = [this.calculateAnimalTexture(entity), position]

            const currentFrame = Math.floor((animationFrameId % appConstants.fps) / appConstants.fps * 15);
            const originOffset = { x: offsetX * width, y: offsetY * height };
            if (frameWidth) {
                this.context.drawImage(image, frameWidth * currentFrame, 0, frameWidth, frameHeight, x - originOffset.x, y - originOffset.y, width, height)
            } else {
                this.context.drawImage(image, x - originOffset.x, y - originOffset.y, width, height)
            }
        }
    }

    public drawBreeding (position: Position) {
        const [{image, width, height, offsetX, offsetY}, {x, y}] = [this.breedingTexture, position]
        if (this.context) {
            this.context.drawImage(image, x - offsetX * width, y - offsetY * height, width, height)
        }
    }

    public drawLabels (position: Position,
                       entity: { gender: gender, name: string, isAlive: boolean, age: number, currentActivity: string }
    ) {
        if (!this.context) {
            return
        }
        const [{width, height, offsetX, offsetY}, {x, y},
            {gender, name, age, isAlive, currentActivity}] = [this.calculateAnimalTexture(entity), position, entity]
        const originOffset = { x: offsetX * width, y: offsetY * height };
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
                this.context.fillText(isAlive ? age >= 0 ? `${age} y.o.` : 'Egg' : 'Corpse',
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
                    this.context?.fillText(message, 10,  50 + index * 24)
                })
            this.context.restore()
        }
    }

    calculateAnimalTexture(entity: { gender: gender, isAlive: boolean, age: number }) {
        const {age, isAlive} = entity
        if (!isAlive) {
            if (age >= 0 && age < 5) {
                return {
                    ...this.childCorpseTexture,
                    frameHeight: 0,
                    frameWidth: 0,
                    offsetX: this.childCorpseTexture.offsetX,
                    offsetY: this.childCorpseTexture.offsetY
                }
            }

            if (age >= 5 && age < 10) {
                return {
                    ...this.teenCorpseTexture,
                    frameHeight: 0,
                    frameWidth: 0,
                    offsetX: this.teenCorpseTexture.offsetX,
                    offsetY: this.teenCorpseTexture.offsetY
                }
            }

            if (age >= 10) {
                return {
                    ...this.matureCorpseTexture,
                    frameHeight: 0,
                    frameWidth: 0,
                    offsetX: this.childCorpseTexture.offsetX,
                    offsetY: this.childCorpseTexture.offsetY
                }
            }
        }
        if (age < 0) {
            return  {
                ...this.egg,
                frameHeight: 0,
                frameWidth: 0,
                offsetX: this.egg.offsetX,
                offsetY: this.egg.offsetY
            }
        }
        if (age >= 0 && age < 5) {
            return this.childAnimalTextureAtlas
        }

        if (age >= 5 && age < 10) {
            return this.teenAnimalTextureAtlas
        }

        if (age >= 10) {
            return this.matureAnimalTextureAtlas
        }
        return this.matureAnimalTextureAtlas
    }
}

export default Renderer