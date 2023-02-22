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


        var compiled = Shader.gl.getShaderParameter(vertexShader, Shader.gl.COMPILE_STATUS);
        console.log('Shader compiled successfully: ' + compiled);
        var compilationLog = Shader.gl.getShaderInfoLog(vertexShader);
        console.log('Shader compiler log: ' + compilationLog);

        console.log('program compiled');

        this.glShaderProgram = Shader.gl.createProgram() as WebGLProgram;
        Shader.gl.attachShader(this.glShaderProgram, vertexShader);
        Shader.gl.attachShader(this.glShaderProgram, fragmentShader);
        Shader.gl.linkProgram(this.glShaderProgram);
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