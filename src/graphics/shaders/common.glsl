mat3 makeTransformMatrix(in mat4 transform, in vec2 worldPosition, in vec2 sizeScale) {
    mat3 matTranslate = mat3(1.f);
    matTranslate[2][0] =  worldPosition.x;
    matTranslate[2][1] = -worldPosition.y;
    mat3 matScale = mat3(1.f);
    matScale[0][0] = sizeScale.x;
    matScale[1][1] = sizeScale.y;
    mat3 resolutionScale = mat3(1.f);
    resolutionScale[0][0] = 2.f / u_resolution.x;
    resolutionScale[1][1] = 2.f / u_resolution.y;
    mat3 matTransform = mat3(transform);
    matTransform[2][0] =  transform[3][0];
    matTransform[2][1] = -transform[3][1];

    return resolutionScale * matTransform * matTranslate * matScale;
}