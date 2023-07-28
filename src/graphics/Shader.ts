import {glDriver} from "./GLDriver";

type ShaderSource = {
    vertex: string,
    fragment: string,
    compute?: string
}


const SHADERS_PATH = '/src/graphics/shaders';


const fetchAll = (files: string[]) => {
    return Promise.all(files.map((file) =>
        fetch(`${SHADERS_PATH}/${file}`)
    )).then(result =>
        Promise.all(result.map(file => file.text()))
    )
}


export class Shader {
    glShaderProgram: WebGLProgram
    constructor(vertexShaderCode: string, fragmentShaderCode: string) {
        if (!glDriver.gl) {
            throw 'No web gl context';
        }

        const vertexShader = glDriver.gl.createShader(glDriver.gl.VERTEX_SHADER) as WebGLShader;
        const fragmentShader = glDriver.gl.createShader(glDriver.gl.FRAGMENT_SHADER) as WebGLShader;

        glDriver.gl.shaderSource(vertexShader, vertexShaderCode);
        glDriver.gl.shaderSource(fragmentShader, fragmentShaderCode);

        glDriver.gl.compileShader(vertexShader);
        glDriver.gl.compileShader(fragmentShader);


        var compiled = glDriver.gl.getShaderParameter(fragmentShader, glDriver.gl.COMPILE_STATUS);
        console.log('Shader compiled successfully: ' + compiled);
        var compilationLog = glDriver.gl.getShaderInfoLog(fragmentShader);
        console.log('Shader compiler log: ' + compilationLog);

        console.log('program compiled');

        this.glShaderProgram = glDriver.gl.createProgram() as WebGLProgram;
        glDriver.gl.attachShader(this.glShaderProgram, vertexShader);
        glDriver.gl.attachShader(this.glShaderProgram, fragmentShader);
        glDriver.gl.linkProgram(this.glShaderProgram);
        const linkStatus = glDriver.gl.getProgramParameter(this.glShaderProgram, glDriver.gl.LINK_STATUS);
        console.log("Shader linked: " + linkStatus);
        console.log("Shader linking log: ", glDriver.gl.getProgramInfoLog(this.glShaderProgram));
    }


    static compileFromSourceFiles(source: ShaderSource, callback: (compiledShader: Shader | null) => void) {
        const files = [source.vertex, source.fragment];
        fetchAll(files)
            .then(shaderSourceCodeList => Promise.all(shaderSourceCodeList.map(shaderCode => {
                    const glslSources: string[] = [...shaderCode.matchAll(/<(.*?)>/g)].map(result => {
                        return result[1]
                    })

                    return fetchAll(glslSources)
                        .then(glslSourceCodeList => {
                            glslSources.forEach((glslSourceName, index) => {
                                shaderCode = shaderCode.replace(`#include \<${glslSourceName}\>`, glslSourceCodeList[index]);
                            })

                            return shaderCode;
                        })
                })
            ))
            .then(sources => {
                console.log(`%c${source.vertex}`, 'color: yellow');
                callback(new Shader(sources[0], sources[1]));
            })
    }


    public bind() {
        glDriver.gl?.useProgram(this.glShaderProgram);
    }


    public unbind() {
        glDriver.gl?.useProgram(null);
    }
}