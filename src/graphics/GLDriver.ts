import {Shader} from "./Shader";
import {GLTexture} from "./GLTexture";
import {GLRenderTarget} from "./GLRenderTarget"
import {Position} from "../types";
import simulationStore from "../stores/simulationStore";
import {RENDER_PASS} from "../constants/render";


const verticies = [
    -1, 1, 0,
    -1, -1, 0,
    1, 1, 0,
    1, 1, 0,
    -1, -1, 0,
    1, -1, 0
]


const INSTANCES_PER_DRAW = 1024;


class GLDriver {

    gl: WebGL2RenderingContext | null = null;
    ext: EXT_color_buffer_float | null = null;
    defaultShader: Shader | null = null;
    shadowMapShader: Shader | null = null;
    copyShader: Shader | null = null;
    transform: Float32Array = new Float32Array()

    quadVertexBuffer: WebGLBuffer | null = null;
    shadowMapRT: GLRenderTarget | null = null;
    mainRT: GLRenderTarget | null = null;
    depthRT: GLRenderTarget | null = null;


    init(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.ext = this.gl.getExtension("EXT_color_buffer_float");
        this.gl.getExtension('OES_texture_float_linear');

        this.quadVertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quadVertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(verticies), this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        this.shadowMapRT = new GLRenderTarget(this.gl.canvas.width, this.gl.canvas.height);
        this.mainRT = new GLRenderTarget(this.gl.canvas.width, this.gl.canvas.height, true, 2, this.gl.RGBA32F);
        this.depthRT = new GLRenderTarget(this.gl.canvas.width, this.gl.canvas.height, true, 1, this.gl.RGBA32F);


        console.log('compilation');
        Shader.compileFromSourceFiles({vertex: 'default.vert', fragment: 'default.frag'}, (shader) => {
            this.defaultShader = shader;
        });
        Shader.compileFromSourceFiles({vertex: 'shadowMap.vert', fragment: 'shadowMap.frag'}, (shader) => {
            this.shadowMapShader = shader;
        })
        Shader.compileFromSourceFiles({vertex: 'copy.vert', fragment: 'copy.frag'}, (shader) => {
            this.copyShader = shader;
        })
    }


    check() {
        if (!this.gl) {
            throw 'No gl driver'
        }
    }


    setGlobalTransform(transform: Float32Array) {
        this.transform = transform;
    }


    renderPrepare(pass: RENDER_PASS) {
        if (!this.gl || !this.defaultShader) {
            return;
        }

        if (pass === RENDER_PASS.DEPTH) {
            this.depthRT!.bind();
        } else {
            this.mainRT!.bind();
        }

        this.defaultShader.bind();

        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clearDepth(1.0);
        //glContext.enable(glContext.DEPTH_TEST);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.clear(this.gl.DEPTH_BUFFER_BIT);

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LESS);
        this.gl.depthMask(true);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFuncSeparate(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.ZERO, this.gl.ONE);

        this.gl.uniform1f(this.gl.getUniformLocation(this.defaultShader.glShaderProgram, 'u_maxAlpha'), 1.0);
        this.gl.uniform1i(this.gl.getUniformLocation(this.defaultShader.glShaderProgram, 'isDepthPass'), Number(pass === RENDER_PASS.DEPTH));

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    }


    createShadowMap(cameraPosition: Position, cameraScale: number) {
        if (!this.shadowMapShader) {
            return;
        }

        this.shadowMapShader!.bind();
        this.gl!.uniform2f(this.gl!.getUniformLocation(this.shadowMapShader.glShaderProgram, 'u_resolution'),
            this.shadowMapRT!.width, this.shadowMapRT!.height);
        this.gl!.uniform2f(this.gl!.getUniformLocation(this.shadowMapShader.glShaderProgram, 'u_camPos'), cameraPosition.x, cameraPosition.y);
        this.gl!.uniform1f(this.gl!.getUniformLocation(this.shadowMapShader.glShaderProgram, 'u_camScale'), cameraScale);
        this.gl!.uniform1f(this.gl!.getUniformLocation(this.shadowMapShader.glShaderProgram, 'u_time'), simulationStore.getTimestamp);

        this.shadowMapRT!.bind();

        this.gl!.clearColor(0.0, 1.0, 0.0, 1.0);
        this.gl!.clear(this.gl!.COLOR_BUFFER_BIT);

        this.gl!.bindBuffer(this.gl!.ARRAY_BUFFER, this.quadVertexBuffer);

        this.gl!.enableVertexAttribArray(0);
        this.gl!.vertexAttribPointer(0, 3, this.gl!.FLOAT, false, 0, 0);

        this.gl!.viewport(0, 0, this.shadowMapRT!.width, this.shadowMapRT!.height);

        this.gl!.drawArrays(this.gl!.TRIANGLES, 0, 6);

        this.gl!.disableVertexAttribArray(0);

        this.shadowMapRT!.unbind();
    }


    copyImage(texture: GLTexture, target: GLRenderTarget | null = null, corner: number = 0) {
        if (!this.gl || !this.copyShader) {
            return;
        }

        this.copyShader.bind();

        const targetWidth: number = target ? target.width : this.gl.canvas.width;
        let targetHeight: number = target ? target.height : this.gl.canvas.height;

        if (target) {
            target.bind();
        } else {
            glDriver.gl!.bindFramebuffer(glDriver.gl!.FRAMEBUFFER, null);
        }

        if (corner > 0) {
            this.gl!.viewport(0, (corner - 1) * targetHeight / 5.0, targetWidth / 5.0, targetHeight / 5.0);
        } else {
            this.gl!.viewport(0, 0, targetWidth, targetHeight);
        }

        this.gl!.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl!.clear(this.gl!.COLOR_BUFFER_BIT);

        this.gl.disable(this.gl.DEPTH_TEST);

        this.gl.uniform1i(this.gl.getUniformLocation(this.copyShader.glShaderProgram, 'tex'), 0);
        this.gl.uniform1i(this.gl.getUniformLocation(this.copyShader.glShaderProgram, 'bloomMask'), 1);
        this.gl.uniform2f(this.gl.getUniformLocation(this.copyShader.glShaderProgram, 'u_resolution'), targetWidth, targetHeight);
        texture.bind(0);
        this.mainRT?.getTexture(1).bind(1);

        this.gl!.bindBuffer(this.gl!.ARRAY_BUFFER, this.quadVertexBuffer);

        this.gl!.enableVertexAttribArray(0);
        this.gl!.vertexAttribPointer(0, 3, this.gl!.FLOAT, false, 0, 0);

        this.gl!.drawArrays(this.gl!.TRIANGLES, 0, 6);

        this.gl!.disableVertexAttribArray(0);

        if (target) {
            target.unbind();
        }
    }


    drawImage(texture: GLTexture, numFramesX: number=1, numFramesY: number=1, pos: Position[], frame: Position[] = [{x: 0, y: 0}], scale: {x: number, y: number}, buffer?: number[], shader: Shader | null=this.defaultShader) {
        if (!this.gl) {
            throw 'glDriver is not initialized'
        }
        if (!shader) {
            return;
        }

        shader.bind();
        texture.bind(0);


        const posBuffer: number[] = [];
        const frameBuffer: number[] = [];
        const buf: number[] = [];

        pos.forEach(p => {
            posBuffer.push(p.x, p.y, p.z ? p.z : 0.0);
        })
        frame.forEach(f => {
            frameBuffer.push(f.x, f.y);
        })
        if (buffer) {
            buffer.forEach(v => {
                buf.push(v);
            })
        }


        this.gl.uniform2f(this.gl.getUniformLocation(shader.glShaderProgram, 'scale'), scale.x, scale.y);
        this.gl.uniform2f(this.gl.getUniformLocation(shader.glShaderProgram, 'u_numFrames'), numFramesX, numFramesY);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quadVertexBuffer);

        this.gl.enableVertexAttribArray(0);
        this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 0, 0);

        for (let i = 0; i < Math.ceil(pos.length / INSTANCES_PER_DRAW); i++) {
            const sliceIndex = {
                start: i * INSTANCES_PER_DRAW,
                end: (i + 1) * INSTANCES_PER_DRAW
            }

            this.gl.uniform3fv(this.gl.getUniformLocation(shader.glShaderProgram, 'pos'), posBuffer.slice(3 * sliceIndex.start, 3 * sliceIndex.end));
            this.gl.uniform2fv(this.gl.getUniformLocation(shader.glShaderProgram, 'textureFrame'), frameBuffer.slice(2 * sliceIndex.start, 2 * sliceIndex.end));

            if (buffer) {
                this.gl.uniform1fv(this.gl.getUniformLocation(shader.glShaderProgram, 'bendData'), buf.slice(1 * sliceIndex.start, 1 * sliceIndex.end));
            }

            this.gl.drawArraysInstanced(this.gl.TRIANGLES, 0, 6, Math.min(INSTANCES_PER_DRAW, pos.length - i * INSTANCES_PER_DRAW));
        }

        this.gl.disableVertexAttribArray(0);
    }
}


export const glDriver = new GLDriver();