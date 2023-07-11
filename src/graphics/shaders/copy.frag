#version 300 es
precision highp float;

uniform sampler2D tex;
uniform sampler2D bloomMask;
uniform vec2 u_resolution;

out vec4 fragValue;

void main() {
    const int quatSteps = 0;

    fragValue = texture(tex, gl_FragCoord.xy / u_resolution);

    for (int i = -4; i <= 4; i++) {
        for (int j = -4; j <= 4; j++) {
            vec2 uv = (gl_FragCoord.xy + 2.f * vec2(i, j)) / u_resolution;
            float bloomValue = texture(bloomMask, uv).r;

            if (bloomValue > 0.f) {
                fragValue += 0.13f * texture(tex, uv) * bloomValue * (0.005f + 0.003f * length(vec2(float(abs(i)), float(abs(j)))));
            }

        }
    }

    fragValue.a = 1.f;

//    for (int i = -quatSteps; i <= quatSteps; i++) {
//        for (int j = -quatSteps; j <= quatSteps; j++) {
//            fragValue += texture(tex, (gl_FragCoord.xy + vec2(i, j)) / u_resolution);
//        }
//    }

    //fragValue /= float((2 * quatSteps + 1) * (2 * quatSteps + 1));
}