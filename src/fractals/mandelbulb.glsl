
Distance Scene(vec3 p)
{
    const int n = 15;
    vec3 z = vec3(0.0);
    vec3 d = vec3(1.0);
    float r = 0.0;
    float k = 6.0;
    float b = 10000.0;

    for (int i = 0; i < n; ++i)
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
        z += p;
        r = length(z);
        b = min(r, b);
        if (r >= 2.0)
            break;
    }
    return Distance(r * log(r) * 0.5 / length(d), hsv2rgb(vec3(b*1.3+0.3, 0.7, 0.9)));
}
