import {glDriver} from "./GLDriver";

export class GLTexture {
    // TODO: move it to texture manager
    static loadedTextures: {[key: string] : GLTexture} = {}


    private native: WebGLTexture | null
    readonly width: number
    readonly height: number


    constructor(image: HTMLImageElement) {
        if (!glDriver.gl) {
            throw 'glDriver is not Initialized'
        }

        this.native = glDriver.gl.createTexture();
        glDriver.gl.bindTexture(glDriver.gl.TEXTURE_2D, this.native);
        glDriver.gl.texImage2D(glDriver.gl.TEXTURE_2D, 0, glDriver.gl.RGBA, image.width, image.height, 0,
            glDriver.gl.RGBA, glDriver.gl.UNSIGNED_BYTE, image);

        glDriver.gl.bindTexture(glDriver.gl.TEXTURE_2D, null);

        this.width = image.width;
        this.height = image.height;
    }


    static fromImage(image: HTMLImageElement) {
        if (GLTexture.loadedTextures[image.src]) {
            return GLTexture.loadedTextures[image.src];
        }

        const texture = new GLTexture(image);
        GLTexture.loadedTextures[image.src] = texture;

        return texture;
    }


    bind(index: number) {
        glDriver.gl?.activeTexture(glDriver.gl?.TEXTURE0 + index);
        glDriver.gl?.bindTexture(glDriver.gl?.TEXTURE_2D, this.native);
    }
}


export class GLAnimation extends GLTexture {
    private numFramesX: number = 1
    private numFramesY: number = 1


    constructor(image: HTMLImageElement, numFramesX: number=1, numFramesY: number=1) {
        super(image);

        this.numFramesX = numFramesX;
        this.numFramesY = numFramesY;
    }
}