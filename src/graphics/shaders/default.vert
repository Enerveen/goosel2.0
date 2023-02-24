#version 300 es

layout (location = 0) in vec3 position;

uniform mat4 u_transform;
uniform vec3 pos[1024];
uniform vec2 textureFrame[1024];
uniform float bendData[1024];
uniform vec2 scale;
uniform vec2 u_resolution;

out vec2 uv;
out vec2 frameIdx;
out float depth;
out vec2 v_position;

out float bendAge;


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

    v_position = vec2(pos[gl_InstanceID].x, -pos[gl_InstanceID].y);

    mat3 matTransform = resolutionScale * transform * translate * matScale;

    uv = (0.5 * vec2(position.x, -position.y) + 0.5);
    frameIdx = textureFrame[gl_InstanceID];

    gl_Position = vec4(matTransform * vec3(position.xy, 1.0), 1.0);
    //gl_Position = vec4(position.xy, 1.0, 1.0);
    gl_Position.xy -= vec2(1.0, -1.0);
    depth = 1.0 - pos[gl_InstanceID].z / 5000.0;

    bendAge = bendData[gl_InstanceID];
}