#version 300 es
precision highp float;
precision highp int;

uniform sampler2D tex;

uniform int u_time;
uniform vec2 u_numFrames;
uniform vec2 u_resolution;
uniform bool u_isSkew;

uniform bool isGrass;
uniform bool isTerrain;
uniform bool isDepthPass;

uniform float u_maxAlpha;

uniform float intensityMultiplier;

in vec2 uv;
in vec2 frameIdx;
in float depth;
in vec2 v_worldPosition;
in vec2 v_position;

in float dayPhase;

in float v_bend;
in float v_bendAmplitude;
in float v_windBendAmplitude;

in float bendAge;

// TODO write IF preprocessor
layout (location = 0) out vec4 fragColor; // r - shadow mask, gba - g buffer
layout (location = 1) out vec4 emissionMask;


#include <smoothNoise.glsl>


void main() {
    vec2 oneOverNumFrames = vec2(1.0 / u_numFrames.x, 1.0 / u_numFrames.y);

    vec2 pos = 0.5 * (gl_FragCoord.xy / u_resolution);//min(u_resolution.x, u_resolution.y));

    vec2 _uv = uv;
    float skew = 0.0;

    if (u_isSkew) {
        skew = v_bend * 0.43f * pow(1.0 - uv.y, 2.0);
        //skew = bendAge * 0.23 * pow(1.0 - uv.y, 3.0);
        _uv.x += min(1.0 - uv.x, skew);
        _uv = clamp(_uv, vec2(0.0), vec2(1.0));
    }

    if (isDepthPass) {
        fragColor.ra = vec2(texture(tex, frameIdx * oneOverNumFrames + _uv * oneOverNumFrames).a, 1.f);
        fragColor.g = fragColor.r <= 0.55f ? 1.f : depth;

        gl_FragDepth = fragColor.g;
    } else {
        vec4 textureColor = texture(tex, frameIdx * oneOverNumFrames + _uv * oneOverNumFrames);
        fragColor.rgba = textureColor.rgba;

        float heightFactor = 0.f;

        if (u_isSkew) {
            heightFactor = pow(1.0 - uv.y, 4.0);
            fragColor.rgb += heightFactor * (3.f * vec3(smoothNoise(v_worldPosition / 50.f)) * vec3(1.f, 0.f, 1.f) + 6.325f * fragColor.a * abs(3.75 * (0.3 + v_bendAmplitude * bendAge + 0.15 * v_windBendAmplitude)) * mix(vec3(0.f, 0.f, 0.f), vec3(0.5, 0.1, 0.5f), 0.5 * skew + 0.5));
        }

        emissionMask.rgb = intensityMultiplier * fragColor.rgb;

        if (u_isSkew) {
            vec3 bloomColor = mix(vec3(0.f), vec3(1.f, 0.4f, 1.f), bendAge * (1.f - (0.5f * skew + 0.5f)));
            emissionMask.rgb += 52.f * heightFactor * bloomColor;
        }

        gl_FragDepth = fragColor.a <= 0.55f ? 1.f : depth;
        emissionMask.a = gl_FragDepth;
    }
}