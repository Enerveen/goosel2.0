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


float voronoi(vec2 uv, float scale) {
    uv *= scale;
    vec2 tr = trunc(uv);
    uv = fract(uv);

    float minDistance = 100.f;
    for (int i = -1; i <= 1; i++) {
        for (int j = -1; j <= 1; j++) {
            vec2 noise = vec2(smoothNoise(tr + vec2(i, j)), smoothNoise(tr + vec2(i, j) + vec2(130.6787f, 479.452f)));
            vec2 adjustedUV = vec2(i, j) + vec2(0.5f) + 0.5f * sin(3438.f * noise + 0.02f * vec2(float(u_time)));

            minDistance = min(minDistance, distance(uv, adjustedUV));
        }
    }

    return minDistance / sqrt(2.f);
}


float smoothVoronoi(vec2 uv, float scale) {
    return mix(0.5f, 1.f, pow(voronoi(uv, scale), 4.f));
}


vec3 calcNormal(vec2 uv) {
    float noise = 0.5f + 0.5f * pow(mix(smoothVoronoi(uv, 8.f), smoothVoronoi(uv + vec2(1.f), 10.f), 0.5f), 0.56f);
    float noiseX = 0.5f + 0.5f * pow(mix(smoothVoronoi(uv + vec2(0.03f, 0.f), 8.f), smoothVoronoi(uv + vec2(0.03f, 0.f) + vec2(1.f), 10.f), 0.5f), 0.75f);
    float noiseY = 0.5f + 0.5f * pow(mix(smoothVoronoi(uv + vec2(0.f, 0.03f), 8.f), smoothVoronoi(uv + vec2(0.f, 0.03f) + vec2(1.f), 10.f), 0.5f), 0.75f);
    float turbulense = clamp(1.f - distance(uv, vec2(0.5f)) / 2.f, 0.f, 1.f) * (
        0.18f * (0.5f * cos(-0.07f * float(u_time) + 20.1f * distance(uv, vec2(0.5f))) + 0.5f) +
        0.18f * (0.5f * cos(-0.07f * float(u_time) + 20.1f * distance(uv, vec2(2.75f))) + 0.5f)
    );


    vec3 norm = normalize(vec3(noiseX - noise, noiseY - noise, 0.001f));



    return norm;
}