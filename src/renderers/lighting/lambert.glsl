
const int MAX_STEPS = 150;
const float EPS = 0.0008;

const vec3 LIGHT_DIR = normalize(vec3(0.3, 0.7, 0.5));

vec3 Lighting(int i, vec3 p)
{
	Distance dist = Scene(p);
    float eps = EPS * dist.value;

    vec3 normal = Normal(p, eps);

    return vec3(max(dot(LIGHT_DIR, normal), 0.0) * 0.8 + 0.2);
}
