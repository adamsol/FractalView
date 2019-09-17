
const int MAX_STEPS = 100;
const int MAX_PATH_STEPS = 80;

const int PATH_REFLECTIONS = 1;
const float EPS = 0.0008;

Distance SceneGI(vec3 p)
{
	if (length(p) > 20.0) {
		return Light(0.0, vec3(1.2));
	} else {
		return Scene(p);
	}
}

vec3 Lighting(int i, vec3 p)
{
	Distance dist = SceneGI(p);
	vec3 color = vec3(1.0);
	vec3 light = vec3(dist.emission);

	for (int j = 0; j < PATH_REFLECTIONS; ++j) {
		Distance dist = SceneGI(p);
		float eps = EPS * dist.value / CAMERA_ZOOM;
		vec3 n = Normal(p, eps);
		vec3 r = randHemisphere(n);
		p += r * eps*500.0;

		bool hit = false;
		for (int i = 0; i < MAX_PATH_STEPS; ++i) {
			Distance dist = SceneGI(p);
			float d = dist.value;

			if (d <= eps) {
				color *= dist.color;
				light += color * dist.emission;
				hit = true;
				break;
			}
			p += r * d;
		}
		if (!hit) {
			break;
		}
	}

	return light;
}
