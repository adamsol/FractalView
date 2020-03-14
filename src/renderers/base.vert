
attribute vec3 position;
attribute vec2 uv;

varying vec2 texCoords;

void main(void)
{
	texCoords = uv;
	gl_Position = vec4(position, 1.0);
}
