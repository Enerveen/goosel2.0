import {GLTexture} from "./GLTexture";
import {glDriver} from "./GLDriver";

export class GLRenderTarget {
    texture: (GLTexture)[] = []
    native: WebGLFramebuffer | null = null

    width: number = 0
    height: number = 0

    constructor(params: {width: number, height: number, format: number}[], depth: boolean = false) {
        glDriver.check()

        this.width = params[0].width;
        this.height = params[0].height;

        this.native = glDriver.gl!.createFramebuffer()
        glDriver.gl!.bindFramebuffer(glDriver.gl!.FRAMEBUFFER, this.native);

        let buffers: number[] = [];
        for (let i = 0; i < params.length; i++) {
            this.texture.push(GLTexture.create(params[i].width, params[i].height, false, params[i].format));
            glDriver.gl!.framebufferTexture2D(glDriver.gl!.FRAMEBUFFER, glDriver.gl!.COLOR_ATTACHMENT0 + i, glDriver.gl!.TEXTURE_2D, this.texture[i].native, 0);

            buffers.push(glDriver.gl!.COLOR_ATTACHMENT0 + i);
        }

        if (depth) {
            const depthBuffer = glDriver.gl!.createRenderbuffer();
            glDriver.gl!.bindRenderbuffer(glDriver.gl!.RENDERBUFFER, depthBuffer);

            glDriver.gl!.renderbufferStorage(glDriver.gl!.RENDERBUFFER, glDriver.gl!.DEPTH_COMPONENT16, this.width, this.height);
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