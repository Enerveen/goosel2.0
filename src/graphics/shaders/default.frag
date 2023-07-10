#version 300 es
precision highp float;

#include <smoothNoise.glsl>

uniform sampler2D tex;
uniform sampler2D shadowMap;

uniform int u_time;
uniform vec2 u_numFrames;
uniform vec2 u_resolution;
uniform bool u_isSkew;

uniform bool isGrass;

uniform float u_maxAlpha;

in vec2 uv;
in vec2 frameIdx;
in float depth;
in vec2 v_worldPosition;
in vec2 v_position;

in float v_bend;
in float v_bendAmplitude;
in float v_windBendAmplitude;

in float bendAge;

layout (location = 0) out vec4 fragColor;
layout (location = 1) out vec4 bloomMask;


const float A = 0.1f;
const float B = 0.5f;
const float C = 0.1f;
const float D = 0.2f;
const float E = 0.02f;
const float F = 0.3f;
const float W = 7.2f;


float dayPhase = 0.f;


vec3 tonemap(vec3 x) {
    return ((x * (A * x + C * B) + D * E) / (x * (A * x + B) + D * F)) - E / F;
}


vec3 tonemapFilmic(vec3 color) {
    float E = 1.82f + dayPhase * 2.f;
    vec3 curr = tonemap(E * color);
    vec3 whiteScale = vec3(1.f) / tonemap(vec3(W));

    return curr * whiteScale;
}


float luminance(vec3 color) {
    return 0.2126f * color.r + 0.7152f * color.g + 0.0722f * color.b;
}



vec3 getLightColor() {
    //dayPhase = 0.5 * sin(0.005 * float(u_time)) + 0.5;

    vec3 daylightColor = vec3(252.0, 253.0, 136.0) / 255.0;
    vec3 nightLightColor = 0.2f * vec3(20.0, 68.0, 86.0) / 255.0;
    vec3 lightColor = mix(mix(daylightColor, vec3(0.0), min(1.0, 2.0 * dayPhase)), nightLightColor, max(0.0, 2.0 * dayPhase - 1.0));
    float ambient = mix(1.0, 0.2, min(1.0, 2.0 * dayPhase));

    float shadow = texture(shadowMap, 0.5 * gl_FragCoord.xy / u_resolution).r;

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

    vec4 textureColor = texture(tex, frameIdx * oneOverNumFrames + _uv * oneOverNumFrames);

    fragColor.rgba = textureColor.rgba;
    fragColor.rgb *= getLightColor();
    //fragColor.rgb /= max(1.0, max(fragColor.b, max(fragColor.r, fragColor.g)));

    if (u_isSkew) {
        fragColor.rgb += 0.5f * fragColor.a * abs(3.75 * pow(1.0 - uv.y, 4.0) * (0.3 + v_bendAmplitude * bendAge + 0.05 * v_windBendAmplitude)) * mix(vec3(8.f, 0.f, 8.f), vec3(0.0, 4.0, 8.f), 0.5 * skew + 0.5);
        bloomMask = vec4(vec3(luminance(fragColor.rgb) / (luminance(fragColor.rgb) + 1.f)), fragColor.a);
    }

    vec2 uvOffset = _uv - vec2(-pow(1.0 - _uv.y, 1.0) * 0.15, mix(0.05, 0.2, 1.0 - _uv.y));
    float cutU = 1.0 - abs(floor(uvOffset.x));
    float cutV = 1.0 - abs(floor(uvOffset.y));
    fragColor.rgba += cutU * cutV * vec4(vec3(0.12), 0.8) * (1.0 - fragColor.a) * vec4(texture(tex, frameIdx * oneOverNumFrames + oneOverNumFrames * uvOffset).a);
    fragColor.rgb = pow(tonemapFilmic(fragColor.rgb), vec3(1.f / 1.f));//fragColor.rgb / (fragColor.rgb + vec3(1.f));
    gl_FragDepth = fragColor.a <= 0.55 ? 1.0 : depth;
}