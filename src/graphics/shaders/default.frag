#version 300 es
precision highp float;

uniform sampler2D tex;
uniform int u_time;
uniform vec2 u_numFrames;
uniform vec2 u_resolution;
uniform bool u_isSkew;

uniform float u_maxAlpha;

in vec3 v_frag_position;
in vec2 uv;
in vec2 frameIdx;
in float depth;

in float bendAge;

out vec4 fragColor;

void main() {
    vec2 oneOverNumFrames = vec2(1.0 / u_numFrames.x, 1.0 / u_numFrames.y);

    vec2 pos = (gl_FragCoord.xy / min(u_resolution.x, u_resolution.y));

    vec2 _uv = uv;
    float skew = 0.0;

    if (u_isSkew) {
        skew = min(1.0, 0.5 + 0.5 * (1.0 - bendAge)) * (cos(0.01 * float(u_time) + 12.0 * pos.y + (1.0 - bendAge) + 20.0 * pos.x - v_frag_position.x)) * (0.23 + 0.2 * (1.0)) * pow(1.0 - uv.y, 3.0);
        //skew = bendAge * 0.23 * pow(1.0 - uv.y, 3.0);
        _uv.x += min(1.0 - uv.x, skew);
    }

    vec4 textureColor = texture(tex, frameIdx * oneOverNumFrames + _uv * oneOverNumFrames);

    float x = length(2.0 * uv.xy - 1.0 + vec2(cos(0.01 * float(u_time)), sin(0.01 * float(u_time))));
    float p = pow(0.5 * cos(10.0 * x - 0.1 * float(u_time)) + 0.5, 2.0) + (0.5 * sin(0.2 * x - 1.0) + 0.5);

    fragColor.rgb = textureColor.rgb;//vec2(cos(3.0 * uv.x + 0.001 * float(u_time)) + 0.001 * float(u_time), sin(3.0 * uv.y))).rgb * vec3(1.98, 1.7, 1.02);
    if (u_isSkew) {
        fragColor.rg += abs(0.05 + skew) * mix(vec2(8.0), vec2(8.0, 0.0), 0.5 * skew + 0.5);
    }
    //fragColor.rgb *= 0.75 * vec3(1.98, 1.7, 1.02);
    fragColor.a = u_maxAlpha * textureColor.a;

    //fragColor.rgb = vec3(bendAge);
    //fragColor.rgb += 100.0 * waveAge;

    gl_FragDepth = fragColor.a == 0.0 ? 1.0 : depth;
    //fragColor.rgb = vec3(gl_FragDepth);
}