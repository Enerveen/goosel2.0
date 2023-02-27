import {GLTexture} from "./GLTexture";
import {glDriver} from "./GLDriver";

export class GLRenderTarget {
    texture: GLTexture
    native: WebGLFramebuffer | null = null

    constructor(width: number, height: number) {
        glDriver.check()

        console.log(width, height);

        this.texture = GLTexture.create(width, height);

        this.native = glDriver.gl!.createFramebuffer()
        glDriver.gl!.bindFramebuffer(glDriver.gl!.FRAMEBUFFER, this.native);
        glDriver.gl!.framebufferTexture2D(glDriver.gl!.FRAMEBUFFER, glDriver.gl!.COLOR_ATTACHMENT0, glDriver.gl!.TEXTURE_2D, this.texture.native, 0);
        glDriver.gl!.drawBuffers([glDriver.gl!.COLOR_ATTACHMENT0]);

        glDriver.gl!.bindFramebuffer(glDriver.gl!.FRAMEBUFFER, null);
    }


    bind() {
        glDriver.gl!.bindFramebuffer(glDriver.gl!.FRAMEBUFFER, this.native);
    }


    unbind() {
        glDriver.gl!.bindFramebuffer(glDriver.gl!.FRAMEBUFFER, null);
    }
}