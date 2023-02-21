import {Shader} from "./Shader";
import {GLTexture} from "./GLTexture";
import simulationStore from "../stores/simulationStore";

class GLDriver {

    gl: WebGL2RenderingContext | null = null;
    defaultShader: Shader | null = null;

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
                this.defaultShader = new Shader(sh[0], sh[1]);
            });
    }


    drawImage(texture: GLTexture, x: number, y: number, transform: DOMMatrix, shader: Shader | null=this.defaultShader) {
        if (!this.gl) {
            throw 'glDriver is not initialized'
        }
        if (!shader) {
            return;
        }

        shader.bind();
        texture.bind(0);

        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.MIRRORED_REPEAT);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.MIRRORED_REPEAT);

        this.gl.uniform1i(this.gl.getUniformLocation(shader.glShaderProgram, 'u_time'), simulationStore.getTimestamp);
        this.gl.uniformMatrix3fv(this.gl.getUniformLocation(shader.glShaderProgram, 'transform'), false, transform.toFloat32Array());
        this.gl.uniform2f(this.gl.getUniformLocation(shader.glShaderProgram, 'pos'), x, y);

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


export const glDriver = new GLDriver();