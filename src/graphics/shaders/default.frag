#version 300 es
precision highp float;

#include <smoothNoise.glsl>


uniform sampler2D tex;

uniform int u_time;
uniform vec2 u_numFrames;
uniform vec2 u_resolution;
uniform bool u_isSkew;

uniform float u_maxAlpha;

in vec2 uv;
in vec2 frameIdx;
in float depth;
in vec2 v_worldPosition;
in vec2 v_position;

in float bendAge;

out vec4 fragColor;

void main() {
    vec2 oneOverNumFrames = vec2(1.0 / u_numFrames.x, 1.0 / u_numFrames.y);

    vec2 pos = (gl_FragCoord.xy / min(u_resolution.x, u_resolution.y));

    vec2 _uv = uv;
    float skew = 0.0;

    float bendAmplitude = mix(0.0, 0.5, bendAge);//min(bendAge, 1.0 - bendAge);
    float windBendAmplitude = 0.2 + 0.3 * (0.5 * cos(0.06 * float(u_time) + 5.0 * v_worldPosition.y / u_resolution.y) + 0.5);

    if (u_isSkew) {
        float bend = bendAmplitude * sin(4.0 * 2.0 * 3.1415 * bendAmplitude) + windBendAmplitude * sin(0.01 * float(u_time) + 13.0 * v_worldPosition.x / u_resolution.x);
        skew = bend * (0.23 + 0.2 * (1.0)) * pow(1.0 - uv.y, 2.0);
        //skew = bendAge * 0.23 * pow(1.0 - uv.y, 3.0);
        _uv.x += min(1.0 - uv.x, skew);
    }

    vec4 textureColor = texture(tex, frameIdx * oneOverNumFrames + _uv * oneOverNumFrames);

    fragColor.rgba = textureColor.rgba;

    float dayPhase = 0.0;//0.5 * sin(0.0005 * float(u_time)) + 0.5;

    vec3 daylightColor = vec3(252.0, 253.0, 136.0) / 255.0;
    vec3 nightLightColor = vec3(20.0, 68.0, 86.0) / 255.0;
    vec3 lightColor = mix(mix(daylightColor, vec3(0.0), min(1.0, 2.0 * dayPhase)), nightLightColor, max(0.0, 2.0 * dayPhase - 1.0));
    float ambient = mix(1.0, 0.2, min(1.0, 2.0 * dayPhase));

    float noise = 0.0;
    {
        vec2 np = v_position / 4000.0;
        float time = 0.125 * float(u_time);
        noise = smoothNoise(4.0 * np) +
            smoothNoise(8.0 * np + 0.02 * time) * 0.5 +
            smoothNoise(16.0 * np + 0.04 * time) * 0.25 +
            smoothNoise(32.0 * np + 0.08 * time) * 0.125 +
            smoothNoise(64.0 * np + 0.16 * time) * 0.0625;
        noise /= 2.0;
        noise = smoothstep(0.3, 0.4, noise);
    }

    fragColor.rgb *= mix(vec3(ambient), vec3(ambient) + lightColor, smoothstep(0.0, 1.0, 1.0 - noise));
    //fragColor.rgb /= max(1.0, max(fragColor.b, max(fragColor.r, fragColor.g)));
    //fragColor.rgb *= (1.0 - texture(shadowsTex, 0.2 * v_position / 4000.0).a) * vec3(1.98, 1.7, 1.02);
    //fragColor.rgb = vec3(v_position.xy / 3000.0, 1.0);

    if (u_isSkew) {
        fragColor.rg += abs(0.05 + 0.25 * (1.0 - uv.y) * (bendAmplitude * bendAge + 0.3 * windBendAmplitude)) * mix(vec2(8.0), vec2(8.0, 0.0), 0.5 * skew + 0.5);
    }

    //fragColor.rgb = vec3(noise);

    fragColor.a *= u_maxAlpha;

    gl_FragDepth = fragColor.a <= 0.5 ? 1.0 : depth;
}