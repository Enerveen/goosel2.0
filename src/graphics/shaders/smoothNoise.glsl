float N11(float i) {
    return fract(sin(i + 93741.369) * 31934.123);
}

float N21(vec2 i) {
    return N11(N11(i.x) + i.y);
}


float smoothNoise(vec2 p) {
    vec2 ft = fract(p);
    ft = ft * ft * (3.0 -2.0 * ft);
    vec2 fr = floor(p);

    float n11 = N21(fr + vec2(0.0, 0.0));
    float n12 = N21(fr + vec2(1.0, 0.0));
    float n1 = mix(n11, n12, ft.x);

    float n21 = N21(fr + vec2(0.0, 1.0));
    float n22 = N21(fr + vec2(1.0, 1.0));
    float n2 = mix(n21, n22, ft.x);

    return mix(n1, n2, ft.y);
}