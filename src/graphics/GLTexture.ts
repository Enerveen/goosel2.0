import {glDriver} from "./GLDriver";


type GLTextureParams = {
    image?: HTMLImageElement,
    size?: {
        width: number,
        height: number
    }
}


export class GLTexture {
    // TODO: move it to texture manager
    private static loadedTextures: {[key: string] : GLTexture} = {}
    private static id: number = 0


    private native: WebGLTexture | null
    readonly width: number = 0
    readonly height: number = 0
    private numFramesX: number = 1
    private numFramesY: number = 1


    private static getUniqueId() {
        GLTexture.id++;

        return `#${GLTexture.id}`
    }


    private constructor(params: GLTextureParams) {
        if (!glDriver.gl) {
            throw 'glDriver is not Initialized'
        }

        this.native = glDriver.gl.createTexture();
        glDriver.gl.bindTexture(glDriver.gl.TEXTURE_2D, this.native);

        if (params.image) {
            glDriver.gl.texImage2D(glDriver.gl.TEXTURE_2D, 0, glDriver.gl.RGBA, params.image.width, params.image.height, 0,
                glDriver.gl.RGBA, glDriver.gl.UNSIGNED_BYTE, params.image);

            this.width = params.image.width;
            this.height = params.image.height;
        } else if (params.size) {
            glDriver.gl.texImage2D(glDriver.gl.TEXTURE_2D, 0, glDriver.gl.RGBA, params.size.width, params.size.height, 0,
                glDriver.gl.RGBA, glDriver.gl.UNSIGNED_BYTE, null);

            this.width = params.size.width;
            this.height = params.size.height;
        }

        glDriver.gl.texParameteri(glDriver.gl.TEXTURE_2D, glDriver.gl.TEXTURE_MIN_FILTER, glDriver.gl.LINEAR_MIPMAP_LINEAR);
        glDriver.gl.texParameteri(glDriver.gl.TEXTURE_2D, glDriver.gl.TEXTURE_MAG_FILTER, glDriver.gl.LINEAR);
        glDriver.gl.texParameteri(glDriver.gl.TEXTURE_2D, glDriver.gl.TEXTURE_WRAP_S, glDriver.gl.MIRRORED_REPEAT);
        glDriver.gl.texParameteri(glDriver.gl.TEXTURE_2D, glDriver.gl.TEXTURE_WRAP_T, glDriver.gl.MIRRORED_REPEAT);

        glDriver.gl.generateMipmap(glDriver.gl.TEXTURE_2D);

        glDriver.gl.bindTexture(glDriver.gl.TEXTURE_2D, null);
    }


    static fromImage(image: HTMLImageElement) {
        if (GLTexture.loadedTextures[image.src]) {
            return GLTexture.loadedTextures[image.src];
        }

        const texture = new GLTexture({ image });
        GLTexture.loadedTextures[image.src] = texture;

        return texture;
    }


    static create(width: number, height: number) {
        const size = { width, height };
        const texture = new GLTexture({ size });

        return texture;
    }


    bind(index: number) {
        glDriver.gl?.activeTexture(glDriver.gl?.TEXTURE0 + index);
        glDriver.gl?.bindTexture(glDriver.gl?.TEXTURE_2D, this.native);
    }
}