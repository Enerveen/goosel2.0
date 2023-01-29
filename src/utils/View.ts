import bgSrc from '../img/backgroundNew.jpg'
import bggSrc from '../img/backroundGlade.png'
import cloudsSrc from '../img/cloudsBlack.png'
import plantSrc from '../img/plant.png'
import animalTextureAtlasSrc from '../img/animalTextureAtlas.png'
import eggSrc from '../img/egg.png'
import heartSrc from '../img/heart.png'
import {FieldDimensions, gender, Position, Texture, TextureAtlas} from "../types";
import {appConstants} from "../constants/simulation";


const loadImage = (name: string) => {
    const image = new Image();
    image.src = name;

    return image;
}


const loadTexture = (name: string, params: {width?: number, height?: number, offsetX?: number, offsetY?: number}={}) => {
    const image = loadImage(name);

    return {
        image: image,
        width: params.width || image.width,
        height: params.height || image.height,
        offsetX: params.offsetX || 0,
        offsetY: params.offsetY || 0
    }
}


const loadTextureAtlas = (name: string, params: {width?: number, height?: number, frameWidth?: number, frameHeight?: number, offsetX?: number, offsetY?: number}={}) => {
    const image = loadImage(name);

    return {
        image: image,
        width: params.width || image.width,
        height: params.height || image.height,
        frameWidth: params.frameWidth || image.width,
        frameHeight: params.frameHeight || image.height,
        offsetX: params.offsetX || 0,
        offsetY: params.offsetY || 0
    }
}


class View {
    context: CanvasRenderingContext2D | null
    plantTexture: Texture
    eggTexture: Texture
    breedingTexture: Texture
    matureAnimalTextureAtlas: TextureAtlas
    teenAnimalTextureAtlas: TextureAtlas
    childAnimalTextureAtlas: TextureAtlas
    backgroundTexture: HTMLImageElement
    backgroundGladeTexture: HTMLImageElement
    cloudsTexture: Texture

    constructor(ctx: CanvasRenderingContext2D | null) {
        this.context = ctx || null

        const animalTextureAtlas = loadTextureAtlas(animalTextureAtlasSrc, {frameWidth: 200, frameHeight: 250, offsetX: 0.5, offsetY: 0.8});
        this.teenAnimalTextureAtlas = {...animalTextureAtlas, width: 60, height: 75};
        this.childAnimalTextureAtlas = {...animalTextureAtlas, width: 40, height: 50};
        this.matureAnimalTextureAtlas = {...animalTextureAtlas, width: 80, height: 100};


        this.eggTexture = loadTexture(eggSrc, {width: 40, height: 40});
        this.plantTexture = loadTexture(plantSrc, {width: 50, height: 45, offsetX: 0.5, offsetY: 0.6});
        this.cloudsTexture = loadTexture(cloudsSrc);
        this.breedingTexture = loadTexture(heartSrc, {width: 20, height: 20});

        this.backgroundTexture = loadImage(bgSrc);
        this.backgroundGladeTexture = loadImage(bggSrc);
    }

    public drawBackground(size: FieldDimensions) {
        const [image, {width, height}] = [this.backgroundTexture, size]
        if (this.context) {
            this.context.drawImage(image, 0, 0, width, height)
        }
    }


    public drawSeamlessBackground(size: FieldDimensions) {
        const [image, {width, height}] = [this.backgroundTexture, size]
        if (this.context) {
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (i === 1 && j === 1) {
                        this.context.drawImage(this.backgroundGladeTexture, j * width / 3, i * height / 3, width / 3, height / 3)
                    } else {
                        this.context.drawImage(image, j * width / 3, i * height / 3, width / 3, height / 3)
                    }
                }
            }
        }
    }


    public drawClouds(timestamp: number) {
        if (this.context) {
            const width = 10.0 * this.cloudsTexture.width;
            const height = 10.0 * this.cloudsTexture.height;

            this.context.save();

            this.context.fillStyle = 'rgba(244, 233, 155, 0.1)';
            this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height)
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
        entity: { gender: gender, name: string, isAlive: boolean, age: number }) {
        if (this.context) {
            const [{image, width, height, frameWidth, frameHeight, offsetX, offsetY}, {x, y}, {
                gender,
                name,
                isAlive,
                age
            }] = [this.calculateAnimalTexture(entity), position, entity]

            const currentFrame = Math.floor((animationFrameId % appConstants.fps) / appConstants.fps * 15);
            const originOffset = { x: offsetX * width, y: offsetY * height };
            if (frameWidth) {
                this.context.drawImage(image, frameWidth * currentFrame, 0, frameWidth, frameHeight, x - originOffset.x, y - originOffset.y, width, height)
            } else {
                this.context.drawImage(image, x - originOffset.x, y - originOffset.y, width, height)
            }

            const styles = [
                'rgba(0, 0, 0, 1.0)',
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
                    this.context?.fillText(isAlive ? age >= 0 ? `${age} y.o.` : 'Egg' : 'Corpse',
                        textPos.x - originOffset.x + width / 2, textPos.y - originOffset.y - 6)
                }
            })
        }


    }

    public drawBreeding (position: Position) {
        const [{image, width, height}, {x, y}] = [this.breedingTexture, position]
        if (this.context) {
            this.context.drawImage(image, x, y, width, height)
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

export default View