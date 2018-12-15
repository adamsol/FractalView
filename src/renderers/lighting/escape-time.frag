
const int MAX_STEPS = 80;
const float EPS = 0.0004;

vec3 Lighting(int i, vec3 p, float eps)
{
    return vec3(1.0 - float(i) / float(MAX_STEPS));
}
