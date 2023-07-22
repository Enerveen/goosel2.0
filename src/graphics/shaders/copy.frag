#version 300 es
precision highp float;

uniform sampler2D tex;
uniform sampler2D bloomMask;
uniform vec2 u_resolution;
uniform float camScale;

out vec4 fragValue;

void main() {
    const int quatSteps = 0;
    const int bloomSteps = 4;

    fragValue = texture(tex, gl_FragCoord.xy / u_resolution);

//    for (int i = -bloomSteps; i <= bloomSteps; i++) {
//        for (int j = -bloomSteps; j <= bloomSteps; j++) {
//            vec2 uv = (gl_FragCoord.xy + 1.4f * vec2(j, i)) / u_resolution;
//            float bloomValue = texture(bloomMask, uv).r;
//            float bloomFactor = 0.005f + max(0.f, 1.22f - 0.08f * pow(length(vec2(float(abs(i)), float(abs(j)))), 2.f));
//
//            if (bloomValue > 5.7f) {
//                fragValue += 0.0013f * texture(tex, uv) * bloomValue * bloomFactor;
//            }
//
//        }
//    }
//
//    fragValue.a = 1.f;

//    for (int i = -quatSteps; i <= quatSteps; i++) {
//        for (int j = -quatSteps; j <= quatSteps; j++) {
//            fragValue += texture(tex, (gl_FragCoord.xy + vec2(i, j)) / u_resolution);
//        }
//    }

    //fragValue /= float((2 * quatSteps + 1) * (2 * quatSteps + 1));
}