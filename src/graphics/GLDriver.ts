import {Shader} from "./Shader";
import {GLTexture} from "./GLTexture";
import simulationStore from "../stores/simulationStore";
import {Position} from "../types";


const verticies = [
    -1, 1, 0,
    -1, -1, 0,
    1, 1, 0,
    1, 1, 0,
    -1, -1, 0,
    1, -1, 0
]


class GLDriver {

    gl: WebGL2RenderingContext | null = null;
    defaultShader: Shader | null = null;
    transform: Float32Array = new Float32Array()

    quadVertexBuffer: WebGLBuffer | null = null;

    constructor() {

    }


    init(gl: WebGL2RenderingContext) {
        this.gl = gl;

        this.quadVertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quadVertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(verticies), this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

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


    setGlobalTransform(transform: Float32Array) {
        this.transform = transform;
    }


    renderPrepare() {
        if (!this.gl) {
            return;
        }

        this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
        //glContext.enable(glContext.DEPTH_TEST);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA)

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    }


    drawImage(texture: GLTexture, pos: Position[], scale: {x: number, y: number}, shader: Shader | null=this.defaultShader) {
        if (!this.gl) {
            throw 'glDriver is not initialized'
        }
        if (!shader) {
            return;
        }

        shader.bind();
        texture.bind(0);

        const posBuffer: number[] = [];

        pos.forEach(p => {
            posBuffer.push(p.x, p.y);
        })

        this.gl.uniform2f(this.gl.getUniformLocation(shader.glShaderProgram, 'scale'), scale.x, scale.y);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quadVertexBuffer);

        this.gl.enableVertexAttribArray(0);
        this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 0, 0);

        for (let i = 0; i < Math.ceil(pos.length / 1000); i++) {
            this.gl.uniform2fv(this.gl.getUniformLocation(shader.glShaderProgram, 'pos'), posBuffer.slice(i * 2000, (i + 1) * 2000));
            this.gl.drawArraysInstanced(this.gl.TRIANGLES, 0, 6, Math.min(1000, pos.length - i * 1000));
        }

        this.gl.disableVertexAttribArray(0);
    }
}


export const glDriver = new GLDriver();