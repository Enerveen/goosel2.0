#version 300 es
precision highp float;
precision highp int;


uniform sampler2D tex;
uniform sampler2D emissionTex;
uniform sampler2D cloudsTex;
uniform sampler2D gBuffer;
uniform sampler2D depthOffsetTex;

uniform float camScale;

#include <commonUniform.glsl>

layout (location = 0) out vec4 fragValue;
layout (location = 1) out float bloomMask;


const float A = 0.1f;
const float B = 0.5f;
const float C = 0.1f;
const float D = 0.2f;
const float E = 0.02f;
const float F = 0.3f;
const float W = 7.2f;

const float dayPhase = 0.f;


vec3 tonemap(vec3 x) {
    return ((x * (A * x + C * B) + D * E) / (x * (A * x + B) + D * F)) - E / F;
}


vec3 tonemapFilmic(vec3 color) {
    float E = 0.62f + dayPhase * 1.f;
    vec3 curr = tonemap(E * color);
    vec3 whiteScale = vec3(1.f) / tonemap(vec3(W));

    return curr * whiteScale;
}


float luminance(vec3 color) {
    return 0.2126f * color.r + 0.7152f * color.g + 0.0722f * color.b;
}


float rangeMap(float x, float start, float end) {
    return (clamp(x, start, end) - start) / (end - start);
}


vec3 getLightColor(float shadow) {
    vec3 daylightColor = 1.4f * vec3(252.0, 253.0, 208.0) / 255.0;
    vec3 sunsetRedColor = vec3(227.0, 168.0, 87.0) / 255.0;
    vec3 nightLightColor = vec3(20.0, 68.0, 86.0) / 255.0;

    const int mixSteps = 3;
    vec3 lightColor = daylightColor;
    lightColor = mix(lightColor, sunsetRedColor, rangeMap(dayPhase, 0.f, 0.3f));
    lightColor = mix(lightColor, vec3(0.f), rangeMap(dayPhase, 0.3f, 0.5f));
    lightColor = mix(lightColor, nightLightColor, rangeMap(dayPhase, 0.5f, 1.f));

    //vec3 lightColor = mix(mix(daylightColor, vec3(0.0), min(1.0, 2.0 * dayPhase)), nightLightColor, max(0.0, 2.0 * dayPhase - 1.0));
    float ambient = mix(1.0, 0.2, min(1.0, 2.0 * dayPhase));

    shadow += 0.5f * texture(cloudsTex, gl_FragCoord.xy / u_resolution).r;

    return vec3(ambient) + 2.f * mix(vec3(0.0), lightColor, smoothstep(0.0, 1.0, 1.0 - shadow));
}


void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;

    vec2 depthOffset = 1.f * (1.f / camScale) * vec2(0.f, texture(depthOffsetTex, uv).r) * vec2(2.f, 1.f);
    vec4 emissionDepth = texture(emissionTex, uv);
    vec2 shadowDepth = vec2(texture(gBuffer, uv).g, texture(gBuffer, uv).g);
    float shadow = texture(gBuffer, uv).r;

    fragValue.rgb = texture(tex, uv).rgb * getLightColor(emissionDepth.a > shadowDepth.y ? clamp(shadow, 0.f, 1.f) : 0.f) + emissionDepth.rgb;
    fragValue.a = 1.f;

    bloomMask = 0.008f * luminance(fragValue.rgb);
    fragValue.rgb = tonemapFilmic(fragValue.rgb);
}