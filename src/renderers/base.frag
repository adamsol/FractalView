
precision highp float;

const float PI = 3.1415926536;
const float DEG2RAD = PI/180.0;
const float SQRT3 = 1.7320508;

uniform vec2 screenRes;
uniform vec2 randSeed;

uniform vec3 cameraPos;
uniform vec3 cameraDir;
uniform vec3 cameraRight;
uniform float cameraSpeed;

uniform float CAMERA_BOKEH;         // default: 0.0, min: 0.0, max: 1.0
uniform float CAMERA_FOCUS;         // default: 3.0, min: 0.0, max: 10.0
uniform float CAMERA_TILT;          // default: 0.0, min: -180.0, max: 180.0
uniform float CAMERA_ZOOM;          // default: 1.5, min: 0.0, max: 20.0

uniform float COLOR_HUE_SCALE;      // default: 1.0, min: -5.0, max: 5.0
uniform float COLOR_HUE_OFFSET;     // default: 0.0, min: 0.0, max: 1.0
uniform float COLOR_SATURATION;     // default: 0.6, min: 0.0, max: 3.0
uniform float COLOR_VALUE;          // default: 0.7, min: 0.0, max: 5.0

uniform sampler2D frameBuffer;
uniform float framesCount;

varying vec2 texCoords;

vec2 randCoord;

float rand()
{
	float x = fract(sin(dot(randCoord, vec2(182.8497, -2154.9248))) * 38223.19);
	randCoord += vec2(x);
	return x;
}
vec3 randHemisphere(vec3 normal)
{
	float b = rand()*PI*2.0;
	float c = acos(1.0-rand()*2.0);
	float x = sin(b)*sin(c);
	float y = sin(c);
	float z = sin(b)*cos(c);
	vec3 v = vec3(sin(b)*sin(c), cos(c), cos(b)*sin(c));
	return dot(v, normal) < 0.0 ? -v : v;
}
vec2 randDisk()
{
	float a = rand()*PI*2.0;
	float r = sqrt(rand());
	return vec2(cos(a), sin(a)) * r;
}
vec2 randHexagon()
{
	vec2 v1 = vec2(1.0, 0.0), v2 = vec2(-0.5, SQRT3*0.5);
	vec2 v = v1*rand() + v2*rand();  // random point on a rhombus, 1/3 of a hexagon
	float a = rand()*3.0;
	if (a < 1.0) {
		v = mat2(-0.5, -SQRT3*0.5, SQRT3*0.5, -0.5) * v;  // rotate 120 degrees
	} else if (a < 2.0) {
		v = mat2(-0.5, SQRT3*0.5, -SQRT3*0.5, -0.5) * v;  // rotate 240 degrees
	}
	return v;
}

vec2 rotate2(vec2 p, float a)
{
	a = a * DEG2RAD;
	float c = cos(a), s = sin(a);
	return mat2(c, -s, s, c) * p;
}
vec3 hsv2rgb(float x, float y, float z)
{
	vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
	vec3 p = abs(fract(vec3(x) + K.xyz) * 6.0 - K.www);
	return z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), y);
}
vec3 hsv2rgb(vec3 c)
{
	return hsv2rgb(c.x, c.y, c.z);
}

vec3 repeat(vec3 p, vec3 s)
{
	return mod(p + s/2.0, s) - s/2.0;
}

vec3 translate(vec3 p, vec3 t)
{
	return p - t;
}

vec3 rotateX(vec3 p, float a)
{
	a = -a * DEG2RAD;
	float c = cos(a), s = sin(a);
	return mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c) * p;
}
vec3 rotateY(vec3 p, float a)
{
	a = -a * DEG2RAD;
	float c = cos(a), s = sin(a);
	return mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c) * p;
}
vec3 rotateZ(vec3 p, float a)
{
	a = -a * DEG2RAD;
	float c = cos(a), s = sin(a);
	return mat3(c, -s, 0.0, s, c, 0.0, 0.0, 0.0, 1.0) * p;
}

float sphere(vec3 p, float r)
{
	return length(p) - r;
}

struct Distance
{
	float value;
	vec3 color;
	float emission;
};

Distance Color(float value, vec3 color)
{
	return Distance(value, color, 0.0);
}
Distance Light(float value, vec3 color)
{
	return Distance(value, color, 1.0);
}

Distance Union(Distance a, Distance b)
{
	if (a.value < b.value)
		return a;
	else
		return b;
}
Distance Intersection(Distance a, Distance b)
{
	if (a.value > b.value)
		return a;
	else
		return b;
}
Distance Complement(Distance a)
{
	return Distance(-a.value, a.color, a.emission);
}
Distance Difference(Distance a, Distance b)
{
	return Intersection(a, Complement(b));
}

// {fractal}

vec3 Normal(vec3 p, float eps)
{
	vec3 n;
	n.x = Scene(p + vec3(eps, 0.0, 0.0)).value - Scene(p - vec3(eps, 0.0, 0.0)).value;
	n.y = Scene(p + vec3(0.0, eps, 0.0)).value - Scene(p - vec3(0.0, eps, 0.0)).value;
	n.z = Scene(p + vec3(0.0, 0.0, eps)).value - Scene(p - vec3(0.0, 0.0, eps)).value;
	return normalize(n);
}

// {lighting}

vec3 raymarch(vec3 p, vec3 dir)
{
	Distance dist = Scene(p);
	float eps = EPS * dist.value / CAMERA_ZOOM;

	for (int i = 0; i < MAX_STEPS; ++i)
	{
		Distance dist = Scene(p);
		float d = dist.value;

		if (d <= eps) {
			return dist.color * Lighting(i, p);
		}
		p += dir * d;
	}
	return vec3(0.0);
}

vec3 hit(vec3 p, vec3 dir)
{
	Distance dist = Scene(p);
	float eps = EPS * dist.value / CAMERA_ZOOM;

	for (int i = 0; i < MAX_STEPS; ++i)
	{
		Distance dist = Scene(p);
		float d = dist.value;

		if (d <= eps) {
			return p;
		}
		p += dir * d;
	}
	return p;
}

void main(void)
{
	float res = min(screenRes.x, screenRes.y);
	vec2 pos = (gl_FragCoord.xy*2.0 - screenRes) / res;
	randCoord = randSeed + pos;

	pos += vec2(rand()*2.0-1.0, rand()*2.0-1.0) / res;
	pos = rotate2(pos, CAMERA_TILT);
	vec2 bokeh = randHexagon() * CAMERA_BOKEH * cameraSpeed;

	vec3 cameraUp = normalize(cross(cameraRight, cameraDir));
	vec3 cameraCenter = cameraPos + normalize(cameraRight*pos.x + cameraUp*pos.y + cameraDir*CAMERA_ZOOM) * CAMERA_FOCUS * cameraSpeed;
	vec3 cameraOrigin = cameraPos + cameraRight*bokeh.x + cameraUp*bokeh.y;
	vec3 rayDir = normalize(cameraCenter - cameraOrigin);

	vec3 color = raymarch(cameraOrigin, rayDir);

	gl_FragColor = (vec4(color, 1.0) + texture2D(frameBuffer, texCoords) * framesCount) / (framesCount + 1.0);
}
