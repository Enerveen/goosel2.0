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

in float bendAge;

out vec4 fragColor;



vec3 getLightColor() {
    float dayPhase = 0.0;//0.5 * sin(0.0005 * float(u_time)) + 0.5;

    vec3 daylightColor = vec3(252.0, 253.0, 136.0) / 255.0;
    vec3 nightLightColor = vec3(20.0, 68.0, 86.0) / 255.0;
    vec3 lightColor = mix(mix(daylightColor, vec3(0.0), min(1.0, 2.0 * dayPhase)), nightLightColor, max(0.0, 2.0 * dayPhase - 1.0));
    float ambient = mix(1.0, 0.2, min(1.0, 2.0 * dayPhase));

    float shadow = texture(shadowMap, 0.5 * gl_FragCoord.xy / u_resolution).r;

    return vec3(ambient) + mix(vec3(0.0), lightColor, smoothstep(0.0, 1.0, 1.0 - shadow));
}



void main() {
    vec2 oneOverNumFrames = vec2(1.0 / u_numFrames.x, 1.0 / u_numFrames.y);

    vec2 pos = 0.5 * (gl_FragCoord.xy / u_resolution);//min(u_resolution.x, u_resolution.y));

    vec2 _uv = uv;
    float skew = 0.0;

    float bendAmplitude = mix(0.0, 0.5, bendAge);
    float windBendAmplitude = 0.2 + 0.3 * (0.5 * cos(0.06 * float(u_time) + 5.0 * v_worldPosition.y / u_resolution.y) + 0.5);

    if (!isGrass) {
        bendAmplitude = 0.0;
    }

    if (u_isSkew) {
        float bend = bendAmplitude * sin(4.0 * 2.0 * 3.1415 * bendAmplitude) + windBendAmplitude * sin(0.01 * float(u_time) + 13.0 * v_worldPosition.x / u_resolution.x);
        skew = bend * (0.23 + 0.2 * (1.0)) * pow(1.0 - uv.y, 2.0);
        //skew = bendAge * 0.23 * pow(1.0 - uv.y, 3.0);
        _uv.x += min(1.0 - uv.x, skew);
        _uv = clamp(_uv, vec2(0.0), vec2(1.0));
    }

    vec4 textureColor = texture(tex, frameIdx * oneOverNumFrames + _uv * oneOverNumFrames);

    fragColor.rgba = textureColor.rgba;
    fragColor.rgb *= getLightColor();
    //fragColor.rgb /= max(1.0, max(fragColor.b, max(fragColor.r, fragColor.g)));

    if (u_isSkew) {
        fragColor.rg += fragColor.a * abs(0.75 * pow(1.0 - uv.y, 4.0) * (0.3 + bendAmplitude * bendAge + 0.05 * windBendAmplitude)) * mix(vec2(8.0), vec2(8.0, 0.0), 0.5 * skew + 0.5);
    }

    vec2 uvOffset = _uv - vec2(-pow(1.0 - _uv.y, 1.0) * 0.15, mix(0.05, 0.2, 1.0 - _uv.y));
    float cutU = 1.0 - abs(floor(uvOffset.x));
    float cutV = 1.0 - abs(floor(uvOffset.y));
    fragColor.rgba += cutU * cutV * vec4(vec3(0.12), 0.8) * (1.0 - fragColor.a) * vec4(texture(tex, frameIdx * oneOverNumFrames + oneOverNumFrames * uvOffset).a);

    gl_FragDepth = fragColor.a <= 0.55 ? 1.0 : depth;
}