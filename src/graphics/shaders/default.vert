#version 300 es

layout (location = 0) in vec3 position;

uniform mat3x3 transform;
uniform vec2 pos;

out vec2 uv;
out vec3 v_frag_position;

void main() {
    mat3 translate = mat3(1.0);
    //translate[0][2] = pos.x;
    //translate[1][2] = pos.y;

    v_frag_position = (0.5 * vec3(position.x, -position.y, 0) + 0.5);
    uv = (transform * vec3(v_frag_position.xy, 1.0)).xy;
    gl_Position = vec4(position * 0.01, 1.0);
}