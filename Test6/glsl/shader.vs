attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

uniform vec3 uLightDirection;
uniform vec3 uLightColor;

varying vec2 vTextureCoord;
varying vec3 vLightWeighting;

void main(void) {
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
    vTextureCoord = aTextureCoord;
	
	vec3 transformedNormal = aVertexNormal;
	float directionalLightWeighting = max(dot(transformedNormal, uLightDirection), 0.0);
	vLightWeighting = uLightColor * directionalLightWeighting;
}