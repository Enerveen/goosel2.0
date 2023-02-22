#version 300 es

layout (location = 0) in vec3 position;

uniform mat4 u_transform;
uniform vec2 pos[1000];
uniform vec2 scale;
uniform vec2 u_resolution;

out vec2 uv;
out vec3 v_frag_position;

void main() {
    mat3 translate = mat3(1.0);
    translate[2][0] = pos[gl_InstanceID].x;
    translate[2][1] = -pos[gl_InstanceID].y;
    mat3 matScale = mat3(1.0);
    matScale[0][0] = scale.x;
    matScale[1][1] = scale.y;
    mat3 resolutionScale = mat3(1.0);
    resolutionScale[0][0] = 2.0 / u_resolution.x;
    resolutionScale[1][1] = 2.0 / u_resolution.y;
    mat3 transform = mat3(u_transform);
    transform[2][0] = u_transform[3][0];
    transform[2][1] = -u_transform[3][1];



    mat3 matTransform = resolutionScale * transform * translate * matScale;

    v_frag_position = (0.5 * vec3(position.x, -position.y, 0) + 0.5);
    uv = v_frag_position.xy;
//
    gl_Position = vec4(matTransform * vec3(position.xy, 1.0), 1.0);
    gl_Position.xy -= vec2(1.0, -1.0);
//    gl_Position.xy = 0.1 * position.xy;
//    gl_Position.z = 1.0;
//    gl_Position.w = 1.0;
}