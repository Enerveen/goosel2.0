export const defaultShader = {
    vertex: `#version 300 es
    
        layout (location = 0) in vec3 position;
            
        out vec3 v_frag_position;
        
        void main() {
            v_frag_position = (0.5 * vec3(position.x, -position.y, 0) + 0.5);
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragment: `#version 300 es
        precision highp float;
        
        uniform sampler2D tex;
        
        in vec3 v_frag_position;
        out vec4 fragColor;
        
        void main() {
            fragColor.rgb = texture(tex, v_frag_position.xy).rgb * vec3(1.98, 1.7, 1.02);
            fragColor.a = 1.0;
        }
    `
}