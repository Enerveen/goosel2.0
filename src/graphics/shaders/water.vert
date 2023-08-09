#version 300 es

layout (location = 0) in vec3 position;

uniform mat4 u_transform;
uniform vec2 scale;
uniform vec2 pos;

out float depth;
out vec2 worldPosition;


#include <commonUniform.glsl>
#include <common.glsl>


#define WATER_HEIGHT 8.f


void main() {
    vec2 waterPosition = pos;

    mat3 matTransform = makeTransformMatrix(u_transform, waterPosition - vec2(0.f, WATER_HEIGHT), scale);
    gl_Position = vec4(matTransform * vec3(position.xy, 1.f), 1.f);
    gl_Position.xy -= vec2(1.0, -1.0);

    worldPosition = vec2(waterPosition.x + position.x * scale.x, waterPosition.y - position.y * scale.y);
    depth = 1.0 - (worldPosition.y) / 5000.0;
}