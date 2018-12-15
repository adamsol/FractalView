
const int MAX_STEPS = 150;
const int MAX_SHADOW_STEPS = 150;

const float SHADOW_SOFTNESS = 0.002;
const float EPS = 0.0008;

const vec3 LIGHT_DIR = normalize(vec3(0.3, 0.7, 0.5));

float shadow(vec3 p, vec3 dir)
{
	Distance dist = Scene(p);
	float eps = EPS * dist.value;
    float m = 10e6;

	for (int i = 0; i < MAX_SHADOW_STEPS; ++i)
	{
		Distance dist = Scene(p);
		float d = dist.value;

		if (d <= eps) {
			return 0.0;
		}
		m = min(m, d);
		p += dir * d;
	}
	return clamp(m/SHADOW_SOFTNESS, 0.0, 1.0);
}

vec3 Lighting(int i, vec3 p, float eps)
{
    vec3 normal;
    normal.x = Scene(p + vec3(eps, 0.0, 0.0)).value - Scene(p - vec3(eps, 0.0, 0.0)).value;
    normal.y = Scene(p + vec3(0.0, eps, 0.0)).value - Scene(p - vec3(0.0, eps, 0.0)).value;
    normal.z = Scene(p + vec3(0.0, 0.0, eps)).value - Scene(p - vec3(0.0, 0.0, eps)).value;
    normal = normalize(normal);

    return vec3(max(dot(LIGHT_DIR, normal), 0.0) * 0.8 * shadow(p + normal*eps + LIGHT_DIR*SHADOW_SOFTNESS, LIGHT_DIR) + 0.2);
}
