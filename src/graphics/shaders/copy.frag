#version 300 es
precision highp float;

uniform sampler2D tex;
uniform sampler2D bloomMask;
uniform vec2 u_resolution;
uniform float camScale;
uniform int u_time;

out vec4 fragValue;

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
    vec2 waveDirection = normalize(vec2(-1.f, 0.6f));
    for (int i = 3; i < 32; i++) {
        float a = 1.f / pow(0.9f * float(i + 1), 1.486f);
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


        sum += 1.f * (a * (0.5f * sin(dot(w * uv, d) * 3.1415 + 0.04f * phi * float(u_time)) + 0.5f));
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

    return normalize(vec3(n2 - n1, n4 - n3, 0.0008f));
}


void main() {
    int quatSteps = int(mix(5.f, 0.f, clamp(camScale, 0.f, 1.f)));
    const int bloomSteps = 3;

    fragValue = texture(tex, gl_FragCoord.xy / u_resolution);

    float totalWeight = 1.f;

    for (int i = -bloomSteps; i <= bloomSteps; i++) {
        for (int j = -bloomSteps; j <= bloomSteps; j++) {
            vec2 uv = (gl_FragCoord.xy + 3.f * vec2(j, i)) / u_resolution;
            float bloomValue = texture(bloomMask, uv).r;
            float bloomFactor = 0.005f + max(0.f, 1.22f - 0.08f * pow(length(vec2(float(abs(i)), float(abs(j)))), 2.f));

            if (bloomValue > 0.05f) {
                //float weight = 1.f / (bloomValue + 1.f);
                //totalWeight += weight;
                totalWeight += bloomValue * bloomFactor;
                fragValue += texture(tex, uv) * bloomValue * bloomFactor;
            }

        }
    }

    fragValue /= totalWeight;
    fragValue.a = 1.f;
//
//    if (texture(bloomMask, gl_FragCoord.xy / u_resolution).g == 1.f) {
//        return;
//    }
//
//    vec2 uv = gl_FragCoord.xy / u_resolution.x / camScale;
//    float uvScale = 22.2f;
//    uv *= uvScale;
//
//    vec3 lightDirection = normalize(vec3(8.f, 0.f, 7.f));
//    vec3 lookDirection = normalize(vec3(1.f, 1.f, -1.f));
//    float wave = max(0.f, calcWave(uv));
//    vec3 normal = calcWaveNormal(uv);
//    float caustic = 1.f + 16.f * calcCaustic(2.f * uv / uvScale - 0.02f * normal.xy * (1.f + wave));
//
//    float ambient = 0.2f;
//    float diffuse = max(0.f, dot(normal, lightDirection));
//    float specular = 0.5f * pow(max(0.f, dot(reflect(lookDirection, normal), lightDirection)), 32.f);
//
//    vec3 backgroundColor = 1.f * texture(tex, gl_FragCoord.xy / u_resolution - 0.01f * normal.xy * camScale).rgb * caustic;
//    vec3 waterColor = vec3(0.9f, 1.1f, 1.4f);
//
//    vec3 col = (ambient + diffuse + specular) * mix(vec3(1.f, 1.f, 1.f), backgroundColor, 1.f - clamp(wave / 0.44043f, 0.f, 1.f) * pow(abs(dot(normal, lookDirection)), 1.2f)) * waterColor;
//    fragValue.rgb = col;

    //    for (int i = -quatSteps; i <= quatSteps; i++) {
    //        for (int j = -quatSteps; j <= quatSteps; j++) {
    //            fragValue += texture(tex, (gl_FragCoord.xy + vec2(i, j)) / u_resolution);
    //        }
    //    }
    //
    //    fragValue /= float((2 * quatSteps + 1) * (2 * quatSteps + 1));
}