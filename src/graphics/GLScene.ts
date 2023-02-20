import {Shader} from "./Shader";
import {defaultShader} from "./shaders";
import simulationStore from "../stores/simulationStore";

class GLScene {

    private gl: WebGL2RenderingContext | null = null
    private shader: Shader | null = null

    nativeCanvasContext: CanvasRenderingContext2D | null = null

    constructor() {

    }


    init(gl: WebGL2RenderingContext) {
        this.gl = gl;

        const files = ['default.vert', 'default.frag'];
        Promise.all(files.map((file) =>
            fetch(`/src/graphics/shaders/${file}`)
        ))
            .then(result =>
                Promise.all(result.map(file => file.text()))
            )
            .then(sh => {
                this.shader = new Shader(sh[0], sh[1]);
            });
    }


    resetTexture() {

    }


    update() {
        if (!this.gl || !this.shader) {
            return;
        }

        this.shader?.bind();

        const pixels = new Uint8Array(this.nativeCanvasContext?.getImageData(0, 0, this.gl.canvas.width, this.gl.canvas.height).data.buffer as ArrayBufferLike);

        const texture = this.gl.createTexture();
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.canvas.width, this.gl.canvas.height, 0,
            this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.MIRRORED_REPEAT);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.MIRRORED_REPEAT);

        this.gl.uniform1i(this.gl.getUniformLocation(this.shader.glShaderProgram, 'u_time'), simulationStore.getTimestamp);

        const verticies = [
            -1, 1, 0,
            -1, -1, 0,
            1, 1, 0,
            1, 1, 0,
            -1, -1, 0,
            1, -1, 0
        ]

        const vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(verticies), this.gl.STATIC_DRAW);

        this.gl.enableVertexAttribArray(0);
        this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 0, 0);

        this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
        //glContext.enable(glContext.DEPTH_TEST);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

        this.gl.disableVertexAttribArray(0);
        this.gl.deleteBuffer(vertexBuffer);
    }
}


export const glScene = new GLScene();