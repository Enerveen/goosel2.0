#version 300 es
precision highp float;

uniform float u_time;

#include <smoothNoise.glsl>

in vec2 worldPosition;

out vec4 fragValue;

void main() {
    vec2 np = 123.0 + (worldPosition) / 4000.0;
    float time = 0.03125 * u_time;
    float noise = smoothNoise(4.0 * np + 615.0 + 0.02 * time) +
                smoothNoise(8.0 * np + 0.04 * time) * 0.5 +
                smoothNoise(16.0 * np + 0.16 * time) * 0.25 +
                smoothNoise(32.0 * np + 0.32 * time) * 0.125 +
                smoothNoise(64.0 * np + 0.64 * time) * 0.0625;
    noise /= 1.9375;

    //float weatherFactor = 0.5f * sin(0.001f * float(u_time)) + 0.5f;
    noise = smoothstep(0.6, 0.7, noise);

    fragValue = vec4(vec3(noise), 1.0);
}