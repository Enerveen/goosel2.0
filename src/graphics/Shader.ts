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

    static gl: WebGL2RenderingContext | null

    glShaderProgram: WebGLProgram
    constructor(vertexShaderCode: string, fragmentShaderCode: string) {
        if (!Shader.gl) {
            throw 'No web gl context';
        }

        const vertexShader = Shader.gl.createShader(Shader.gl.VERTEX_SHADER) as WebGLShader;
        const fragmentShader = Shader.gl.createShader(Shader.gl.FRAGMENT_SHADER) as WebGLShader;

        Shader.gl.shaderSource(vertexShader, vertexShaderCode);
        Shader.gl.shaderSource(fragmentShader, fragmentShaderCode);

        Shader.gl.compileShader(vertexShader);
        Shader.gl.compileShader(fragmentShader);


        var compiled = Shader.gl.getShaderParameter(fragmentShader, Shader.gl.COMPILE_STATUS);
        console.log('Shader compiled successfully: ' + compiled);
        var compilationLog = Shader.gl.getShaderInfoLog(fragmentShader);
        console.log('Shader compiler log: ' + compilationLog);

        console.log('program compiled');

        this.glShaderProgram = Shader.gl.createProgram() as WebGLProgram;
        Shader.gl.attachShader(this.glShaderProgram, vertexShader);
        Shader.gl.attachShader(this.glShaderProgram, fragmentShader);
        Shader.gl.linkProgram(this.glShaderProgram);
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
                console.log(source.vertex);
                callback(new Shader(sources[0], sources[1]));
            })
    }


    public bind() {
        Shader.gl?.useProgram(this.glShaderProgram);
    }


    public unbind() {
        Shader.gl?.useProgram(null);
    }


    static initContext(context: WebGL2RenderingContext) {
        Shader.gl = context;
    }


}