#version 300 es
precision highp float;
precision highp int;

layout (location = 0) in vec3 position;
layout (location = 1) in vec3 pos;
layout (location = 2) in  vec2 textureFrame;
layout (location = 3) in  float bendData;

uniform mat4 u_transform;

uniform vec2 scale;
uniform vec2 u_resolution;

uniform int u_time;
uniform bool isGrass;
uniform bool isDepthPass;

out vec2 uv;
out vec2 frameIdx;
out float depth;
out vec2 v_worldPosition;
out vec2 v_position;

out float v_bend;
out float v_bendAmplitude;
out float v_windBendAmplitude;

out float bendAge;
out float dayPhase;

#include <common.glsl>


void main() {
    v_worldPosition = vec2(pos.x + position.x * scale.x, -pos.y + position.y * scale.y); // same as v_position except y
    v_position = vec2(pos.x + position.x * scale.x, -pos.y - position.y * scale.y);

    mat3 matTransform = makeTransformMatrix(u_transform, pos.xy, scale.xy);

    uv = (0.5 * vec2(position.x, -position.y) + 0.5);
    frameIdx = textureFrame;

    dayPhase = 0.f;//0.5 * sin(0.003 * float(u_time)) + 0.5;

    bendAge = bendData;
    v_bendAmplitude = isGrass ? mix(0.0, 0.95, bendAge) : 0.f;
    v_windBendAmplitude = 0.2 + 0.13 * (0.5 * cos(0.02 * float(u_time) + 5.0 * v_worldPosition.y / u_resolution.y) + 0.5);
    v_bend = v_bendAmplitude * sin(4.0 * 2.0 * 3.1415 * bendAge + 0.07f * float(u_time)) + v_windBendAmplitude * sin(0.01 * float(u_time) + 13.0 * v_worldPosition.x / u_resolution.x);

    vec2 positionOffset = vec2(0.f);
    if (isGrass && position.y > 0.f) {
        positionOffset.x += 2.f * scale.x * v_bend;
    }

    if (isDepthPass) {
        vec2 sunLightDirection = mix(vec2(-2.f, -1.f), vec2(-2.f, -1.f), 0.5f * sin(0.5f * 3.1415f) + 0.5f);
        gl_Position = vec4(matTransform * vec3(position.xy + positionOffset + sunLightDirection * clamp(position.yy, vec2(0.f), vec2(1.f)), 1.0), 1.0);
    } else {
        gl_Position = vec4(matTransform * vec3(position.xy + positionOffset, 1.0), 1.0);
    }
    //gl_Position = vec4(position.xy, 1.0, 1.0);
    gl_Position.xy -= vec2(1.0, -1.0);
    depth = 1.0 - pos.z / 5000.0;
}