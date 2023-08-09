import {GLTexture} from "./GLTexture";
import {glDriver} from "./GLDriver";

export class GLRenderTarget {
    texture: (GLTexture)[] = []
    native: WebGLFramebuffer | null = null

    width: number = 0
    height: number = 0

    constructor(width: number, height: number, depth: boolean = false, count: number = 1, format: number = glDriver.gl!.RGBA) {
        glDriver.check()

        this.width = width;
        this.height = height;

        this.native = glDriver.gl!.createFramebuffer()
        glDriver.gl!.bindFramebuffer(glDriver.gl!.FRAMEBUFFER, this.native);

        let buffers: number[] = [];
        for (let i = 0; i < count; i++) {
            this.texture.push(GLTexture.create(width, height, false, format));
            console.log(glDriver.gl!.getError());
            glDriver.gl!.framebufferTexture2D(glDriver.gl!.FRAMEBUFFER, glDriver.gl!.COLOR_ATTACHMENT0 + i, glDriver.gl!.TEXTURE_2D, this.texture[i].native, 0);
            console.log(glDriver.gl!.getError());

            buffers.push(glDriver.gl!.COLOR_ATTACHMENT0 + i);
        }

        if (depth) {
            const depthBuffer = glDriver.gl!.createRenderbuffer();
            glDriver.gl!.bindRenderbuffer(glDriver.gl!.RENDERBUFFER, depthBuffer);

            glDriver.gl!.renderbufferStorage(glDriver.gl!.RENDERBUFFER, glDriver.gl!.DEPTH_COMPONENT16, width, height);
            glDriver.gl!.framebufferRenderbuffer(glDriver.gl!.FRAMEBUFFER, glDriver.gl!.DEPTH_ATTACHMENT, glDriver.gl!.RENDERBUFFER, depthBuffer);
        }

        glDriver.gl!.drawBuffers(buffers);
        console.log(glDriver.gl!.getError());

        glDriver.gl!.bindFramebuffer(glDriver.gl!.FRAMEBUFFER, null);
    }


    getTexture(idx: number = 0) {
        return this.texture[idx];
    }


    bind() {
        glDriver.gl!.bindFramebuffer(glDriver.gl!.FRAMEBUFFER, this.native);
    }


    unbind() {
        glDriver.gl!.bindFramebuffer(glDriver.gl!.FRAMEBUFFER, null);
    }
}