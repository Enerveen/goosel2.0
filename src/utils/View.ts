import bgSrc from '../img/background.jpg'
import plantSrc from '../img/plant.png'
import animalTextureAtlasSrc from '../img/animalTextureAtlas.png'
import eggSrc from '../img/egg.png'
import heartSrc from '../img/heart.png'
import {FieldDimensions, gender, Position, Texture, TextureAtlas} from "../types";
import {appConstants} from "../constants/simulation";


class View {
    context: CanvasRenderingContext2D | null
    plantTexture: Texture
    eggTexture: Texture
    breedingTexture: Texture
    matureAnimalTextureAtlas: TextureAtlas
    teenAnimalTextureAtlas: TextureAtlas
    childAnimalTextureAtlas: TextureAtlas
    backgroundTexture: HTMLImageElement

    constructor(ctx: CanvasRenderingContext2D | null) {
        this.context = ctx || null

        const plantImage = new Image()
        plantImage.src = plantSrc
        this.plantTexture = {
            image: plantImage,
            width: 50,
            height: 45,
            offsetX: 0.5,
            offsetY: 0.6
        }

        const animalTextureOffset = { x: 0.5, y: 0.8 };
        const animalTextureAtlas = new Image()
        animalTextureAtlas.src = animalTextureAtlasSrc
        this.matureAnimalTextureAtlas = {
            image: animalTextureAtlas,
            width: 80,
            height: 100,
            frameWidth: 200,
            frameHeight: 250,
            offsetX: animalTextureOffset.x,
            offsetY: animalTextureOffset.y
        }
        this.teenAnimalTextureAtlas = {
            image: animalTextureAtlas,
            width: 60,
            height: 75,
            frameWidth: 200,
            frameHeight: 250,
            offsetX: animalTextureOffset.x,
            offsetY: animalTextureOffset.y
        }
        this.childAnimalTextureAtlas = {
            image: animalTextureAtlas,
            width: 40,
            height: 50,
            frameWidth: 200,
            frameHeight: 250,
            offsetX: animalTextureOffset.x,
            offsetY: animalTextureOffset.y
        }
        const eggTexture = new Image()
        eggTexture.src = eggSrc
        this.eggTexture = {
            image: eggTexture,
            width: 40,
            height: 40,
            offsetX: 0,
            offsetY: 0
        }

        const breedingTexture = new Image()
        breedingTexture.src = heartSrc
        this.breedingTexture = {
            image: breedingTexture,
            width: 20,
            height: 20,
            offsetX: 0,
            offsetY: 0
        }

        const background = new Image()
        background.src = bgSrc
        this.backgroundTexture = background
    }

    public drawBackground(size: FieldDimensions) {
        const [image, {width, height}] = [this.backgroundTexture, size]
        if (this.context) {
            this.context.drawImage(image, 0, 0, width, height)
        }
    }

    public drawPlant(position: Position) {
        const [{image, width, height}, {x, y}] = [this.plantTexture, position]
        if (this.context) {
            const originOffset = { x: 0.5 * width, y: 0.6 * height };
            this.context.drawImage(image, x - originOffset.x, y - originOffset.y, width, height)
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