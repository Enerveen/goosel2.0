#version 300 es

layout (location = 0) in vec3 position;

out vec3 v_frag_position;

void main() {
    v_frag_position = (0.5 * vec3(position.x, -position.y, 0) + 0.5);
    gl_Position = vec4(position, 1.0);
}