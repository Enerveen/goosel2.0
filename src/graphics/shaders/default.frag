#version 300 es
precision highp float;

uniform sampler2D tex;
uniform int u_time;
uniform vec2 u_numFrames;
uniform vec2 u_resolution;
uniform bool u_isSkew;

uniform float u_maxAlpha;

in vec2 uv;
in vec2 frameIdx;
in float depth;
in vec2 v_position;

in float bendAge;

out vec4 fragColor;

void main() {
    vec2 oneOverNumFrames = vec2(1.0 / u_numFrames.x, 1.0 / u_numFrames.y);

    vec2 pos = (gl_FragCoord.xy / min(u_resolution.x, u_resolution.y));

    vec2 _uv = uv;
    float skew = 0.0;

    float bendAmplitude = mix(0.0, 0.5, bendAge);//min(bendAge, 1.0 - bendAge);
    float windBendAmplitude = 0.2 + 0.3 * (0.5 * cos(0.06 * float(u_time) + 5.0 * v_position.y / u_resolution.y) + 0.5);

    if (u_isSkew) {
        float bend = bendAmplitude * sin(4.0 * 2.0 * 3.1415 * bendAmplitude) + windBendAmplitude * sin(0.01 * float(u_time) + 13.0 * v_position.x / u_resolution.x);
        skew = bend * (0.23 + 0.2 * (1.0)) * pow(1.0 - uv.y, 3.0);
        //skew = bendAge * 0.23 * pow(1.0 - uv.y, 3.0);
        _uv.x += min(1.0 - uv.x, skew);
    }

    vec4 textureColor = texture(tex, frameIdx * oneOverNumFrames + _uv * oneOverNumFrames);

    fragColor.rgba = textureColor.rgba;
    if (u_isSkew) {
        fragColor.rg += abs(0.05 + 0.15 * (1.0 - uv.y) * (bendAmplitude * bendAge + 0.3 * windBendAmplitude)) * mix(vec2(8.0), vec2(8.0, 0.0), 0.5 * skew + 0.5);
    }
    //fragColor.rgb *= vec3(1.98, 1.7, 1.02);
    fragColor.a *= u_maxAlpha;

    gl_FragDepth = fragColor.a <= 0.5 ? 1.0 : depth;
}