#version 300 es
precision highp float;

#include <smoothNoise.glsl>

uniform sampler2D tex;
uniform sampler2D shadowMap;
uniform sampler2D gBuffer;

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
layout (location = 1) out vec4 bloomMask;


const float A = 0.1f;
const float B = 0.5f;
const float C = 0.1f;
const float D = 0.2f;
const float E = 0.02f;
const float F = 0.3f;
const float W = 7.2f;


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

    shadow += texture(shadowMap, 0.5 * gl_FragCoord.xy / u_resolution).r;

    return vec3(ambient) + 2.f * mix(vec3(0.0), lightColor, smoothstep(0.0, 1.0, 1.0 - shadow));
}



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
        vec2 shadowDepth = texture(gBuffer, 2.f * pos).rg;

//        if (shadowDepth.g > 0.f && depth + 0.0001f < shadowDepth.g) {
//            discard;
//            return;
//        }

        vec4 textureColor = texture(tex, frameIdx * oneOverNumFrames + _uv * oneOverNumFrames);

        fragColor.rgba = textureColor.rgba;

        float heightFactor = 0.f;

        if (u_isSkew) {
            heightFactor = pow(1.0 - uv.y, 4.0);
            fragColor.rgb += 6.325f * fragColor.a * abs(3.75 * pow(1.0 - uv.y, 4.0) * (0.3 + v_bendAmplitude * bendAge + 0.15 * v_windBendAmplitude)) * mix(vec3(0.f, 0.f, 0.f), vec3(1.0, 0.7, 0.f), 0.5 * skew + 0.5);
        }

        float fragDepth = fragColor.a <= 0.55f ? 1.f : depth;
        fragColor.rgb *= intensityMultiplier * getLightColor(shadowDepth.g < fragDepth ? shadowDepth.r : 0.f);

        if (u_isSkew) {
            vec3 bloomColor = mix(vec3(0.f), vec3(1.f, 0.4f, 0.f), bendAge * (1.f - (0.5f * skew + 0.5f)));
            fragColor.rgb += 132.f * heightFactor * bloomColor;
        }

        bloomMask = vec4(vec3(0.008f * luminance(fragColor.rgb)), fragColor.a);
        fragColor.rgb = tonemapFilmic(fragColor.rgb);
        gl_FragDepth = fragDepth;
    }
}