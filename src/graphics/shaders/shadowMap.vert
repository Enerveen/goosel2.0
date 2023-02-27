#version 300 es

layout (location = 0) in vec3 position;

uniform vec2 u_resolution;
uniform vec2 u_camPos;
uniform vec2 u_camFov;
uniform vec2 u_camScale;

out vec2 worldPosition;

void main() {
    //worldPosition = u_camPos + vec2(position.x, -position.y) * u_resolution / u_camScale;
    worldPosition = u_camPos + vec2(position.x, -position.y) * u_camFov;
    gl_Position = vec4(position.xy, 1.0, 1.0);
}