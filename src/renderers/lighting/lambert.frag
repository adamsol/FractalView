
const int MAX_STEPS = 150;
const float EPS = 0.0008;

const vec3 LIGHT_DIR = normalize(vec3(0.3, 0.7, 0.5));

vec3 Lighting(int i, vec3 p, float eps)
{
    vec3 normal;
    normal.x = Scene(p + vec3(eps, 0.0, 0.0)).value - Scene(p - vec3(eps, 0.0, 0.0)).value;
    normal.y = Scene(p + vec3(0.0, eps, 0.0)).value - Scene(p - vec3(0.0, eps, 0.0)).value;
    normal.z = Scene(p + vec3(0.0, 0.0, eps)).value - Scene(p - vec3(0.0, 0.0, eps)).value;
    normal = normalize(normal);

    return vec3(max(dot(LIGHT_DIR, normal), 0.0) * 0.8 + 0.2);
}
