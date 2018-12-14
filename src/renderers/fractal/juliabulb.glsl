
const int NUM_ITERATIONS = 15;

Distance Scene(vec3 p)
{
    vec3 z = p;
    vec3 c = vec3(0.3, -0.9, -0.2);
    vec3 d = vec3(1.0);
    float r = 0.0;
    float k = 3.0;
    float b = 10000.0;

    for (int i = 0; i < NUM_ITERATIONS; ++i)
    {
        d = k * pow(r, k-1.0) * d + 1.0;
        if (r > 0.0) {
            float phi = atan(z.z, z.x);
            phi *= k;
            float theta = acos(z.y/r);
            theta *= k;
            r = pow(r, k);
            z = vec3(cos(phi) * cos(theta), sin(theta), sin(phi) * cos(theta)) * r;
        }
        z += c;
        r = length(z);
        b = min(r, b);
        if (r >= 2.0)
            break;
    }
    return Distance(r * log(r) * 0.5 / length(d), hsv2rgb(vec3(-b*1.3-0.5, 0.7, 0.9)));
}
