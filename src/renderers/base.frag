
precision highp float;

uniform vec2 screenRes;
uniform vec3 cameraPos;
uniform vec3 cameraDir;
uniform vec2 randSeed;

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
    float b = rand()*6.2831853;
	float c = acos(1.0-rand()*2.0);
	float x = sin(b)*sin(c);
	float y = sin(c);
	float z = sin(b)*cos(c);
	vec3 v = vec3(sin(b)*sin(c), cos(c), cos(b)*sin(c));
	return dot(v, normal) < 0.0 ? -v : v;
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
	a = -a / 57.2957795130824;
	float c = cos(a), s = sin(a);
	return mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c) * p;
}
vec3 rotateY(vec3 p, float a)
{
	a = -a / 57.2957795130824;
	float c = cos(a), s = sin(a);
	return mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c) * p;
}
vec3 rotateZ(vec3 p, float a)
{
	a = -a / 57.2957795130824;
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
	float eps = EPS * dist.value;

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

void main(void)
{
	vec2 p = (gl_FragCoord.xy*2.0 - screenRes) / min(screenRes.x, screenRes.y);
	randCoord = randSeed + p;

	vec3 cDir = cameraDir;
	vec3 cSide = normalize(cross(cDir, vec3(0.0, 1.0, 0.0)));
	vec3 cUp = normalize(cross(cSide, cDir));
	vec3 rayDir = normalize(cSide * p.x + cUp * p.y + cDir * 1.5);

	vec3 color = raymarch(cameraPos, rayDir);

	gl_FragColor = (vec4(color, 1.0) + texture2D(frameBuffer, texCoords) * framesCount) / (framesCount + 1.0);
}
