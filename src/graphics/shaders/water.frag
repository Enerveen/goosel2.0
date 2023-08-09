#version 300 es
precision highp float;

in float depth;
in vec2 worldPosition;

uniform sampler2D backgroundTex;
uniform sampler2D emissionTex;
uniform float camScale;

layout (location = 0) out vec4 fragColor;
layout (location = 1) out vec4 emissionMask;
layout (location = 2) out float depthOffset;

#include <commonUniform.glsl>
#include <smoothNoise.glsl>


float calcCaustic(vec2 uv) {
    float caustic = smoothVoronoi(uv + vec2(0.025f) + vec2(3501.613f), 16.f) +
    smoothVoronoi(uv + vec2(0.125f) + vec2(3501.613f), 8.f) +
    smoothVoronoi(uv + vec2(0.25f) + vec2(3501.613f),4.f);
    caustic /= 3.f;
    caustic = smoothstep(0.4f, 1.f, caustic) + 0.5f;
    caustic = smoothstep(0.55f, 1.f, caustic);

    return caustic;
}


vec3 getNorm(vec2 uv) {
    float diff = 0.0001f;
    float n1 = calcCaustic(uv + vec2(diff, 0.f));
    float n2 = calcCaustic(uv - vec2(diff, 0.f));
    float n3 = calcCaustic(uv + vec2(0.f, diff));
    float n4 = calcCaustic(uv - vec2(0.f, diff));

    return abs(normalize(vec3(n2 - n1, n4 - n3, 0.03f)));
}


float calcWave(vec2 uv) {
    float sum = 0.f;
    vec2 waveDirection = normalize(vec2(1.f, -0.6f));
    for (int i = 8; i < 32; i++) {
        float a = 1.f / pow(0.9f * float(i + 1), 2.186f);
        //float a = pow(0.83, float(i));
        vec2 w = vec2(
            pow(float(i + 1), 0.9334f),
            pow(float(i + 1), 0.942f)
        );
        float phi = pow(1.02f, float(i));
        vec2 d = vec2(
            N11(52.367f * float(i) + 217.44453f),
            N11(4.116f * float(i) + 216.872347f)
        );
        d = waveDirection * pow(d, vec2(0.251f, 0.431f));
        //d = 2.f * d - 1.f;


        sum += 1.f * (a * (sin(dot(w * uv, d) * 3.1415 + 0.02f * phi * float(u_time))));
    }

    //sum = sum / 4.f;
    return sum;
}


vec3 calcWaveNormal(vec2 uv) {
    float diff = 0.001f;
    float n1 = calcWave(uv + vec2(diff, 0.f));
    float n2 = calcWave(uv - vec2(diff, 0.f));
    float n3 = calcWave(uv + vec2(0.f, diff));
    float n4 = calcWave(uv - vec2(0.f, diff));

    return normalize(vec3(n2 - n1, n4 - n3, 0.005f));
}


void main() {
    vec2 uv = worldPosition / u_resolution.x;
    float uvScale = 22.2f;
    uv *= uvScale;

    vec3 lightDirection = normalize(vec3(8.f,8.f, 2.f));
    vec3 lookDirection = normalize(vec3(
        (2.f * (gl_FragCoord.x / u_resolution.x) - 1.f),
        (2.f * (gl_FragCoord.y / u_resolution.y) - 1.f),
        -1.f / 2.f
    ));

    const float maxWave = 1.15f;
    float wave =  max(0.f, calcWave(uv)) + 1.1f * (0.5f * smoothNoise(0.5f * uv + vec2(0.5f)) + 0.5f);
    float waveFactor = clamp(wave / maxWave, 0.f, 1.f);
    float waveFactorInv = 1.f - waveFactor;

    vec3 normal = calcWaveNormal(uv);
    float caustic = 1.f + 42.f * waveFactorInv * calcCaustic(uv - 0.001f * normal.xy * camScale);
    vec3 causticColor = vec3(252.f, 253.f, 208.f) / 255.f;

    float ambient = 1.f;
    float diffuse = 1.f * max(0.f, dot(normal, lightDirection));
    float specular = 3.0f * pow(max(0.f, dot(reflect(lookDirection, normal), lightDirection)), 32.f);

    vec3 backgroundColor = 1.f * texture(backgroundTex, gl_FragCoord.xy / u_resolution - 0.001f * normal.xy * camScale).rgb * caustic * causticColor;
    vec3 waterColor =  mix(vec3(1.0f), vec3(0.2f, 0.4f, 0.8f), clamp(wave / maxWave, 0.f, 1.f));

    vec3 col = (ambient + diffuse + specular) * mix(vec3(1.f), backgroundColor, waveFactorInv * pow(abs(dot(normal, lookDirection)), 0.5f)) * waterColor;

    //vec3 col = backgroundColor * waterColor;

    fragColor = vec4(col, 1.f);
    emissionMask.a = depth - 32.f * wave / 5000.f;
    depthOffset = (8.f + 32.f * wave) / 5000.f;

    gl_FragDepth = depth - 32.f * wave / 5000.f;
}