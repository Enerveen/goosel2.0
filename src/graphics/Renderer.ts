import {FieldDimensions, gender, LogItem, Position, Texture, TextureAtlas} from "../types";
import {appConstants, fieldSize} from "../constants/simulation";


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
    plantTexture: Texture
    eggTexture: Texture
    breedingTexture: Texture
    matureAnimalTextureAtlas: TextureAtlas
    teenAnimalTextureAtlas: TextureAtlas
    childAnimalTextureAtlas: TextureAtlas
    backgroundTexture: HTMLImageElement
    backgroundSeamlessTexture: HTMLImageElement
    backgroundGladeTexture: HTMLImageElement
    cloudsTexture: Texture

    constructor(ctx: CanvasRenderingContext2D | null, images: any) {
        this.context = ctx || null
        const animalTextureAtlas = loadTextureAtlas(images.animalTextureAtlas, {frameWidth: 200, frameHeight: 250, offsetX: 0.5, offsetY: 0.8});
        this.teenAnimalTextureAtlas = {...animalTextureAtlas, width: 60, height: 75};
        this.childAnimalTextureAtlas = {...animalTextureAtlas, width: 40, height: 50};
        this.matureAnimalTextureAtlas = {...animalTextureAtlas, width: 80, height: 100};


        this.eggTexture = loadTexture(images.egg, {width: 40, height: 40});
        this.plantTexture = loadTexture(images.plant, {width: 50, height: 45, offsetX: 0.5, offsetY: 0.6});
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


    public drawClouds(timestamp: number) {
        if (this.context) {
            const width = 10.0 * this.cloudsTexture.width;
            const height = 10.0 * this.cloudsTexture.height;

            this.context.save();

            // Uncomment to adjust brightness
            this.context.fillStyle = 'rgba(244, 233, 155, 0.05)';
            this.context.fillRect(0, 0, fieldSize.x, fieldSize.y)
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

    public drawPlant(position: Position) {
        const [{image, width, height}, {x, y}] = [this.plantTexture, position]
        if (this.context) {
            const originOffset = { x: 0.5 * width, y: 0.6 * height };
            this.context.drawImage(image, x - originOffset.x, y - originOffset.y, width, height);
        }
    }

    public drawAnimal(
        position: Position,
        animationFrameId: number,
        entity: { gender: gender, name: string, isAlive: boolean, age: number, currentActivity: string }) {
        if (this.context) {
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

    public drawLogs(timestamp:number, logs: LogItem[]) {
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
        const {age} = entity
        if (age < 0) {
            return {...this.eggTexture, frameWidth: 0, frameHeight: 0, offsetX: this.eggTexture.offsetX, offsetY: this.eggTexture.offsetY}
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