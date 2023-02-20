#version 300 es
precision highp float;

uniform sampler2D tex;
uniform int u_time;

in vec3 v_frag_position;
out vec4 fragColor;

void main() {
    vec2 uv = v_frag_position.xy;

    fragColor.rgb = texture(tex, vec2(cos(3.0 * uv.x + 0.001 * float(u_time)) + 0.001 * float(u_time), sin(3.0 * uv.y))).rgb * vec3(1.98, 1.7, 1.02);
    fragColor.a = 1.0;
}