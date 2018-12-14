
const int NUM_ITERATIONS = 30;

Distance Scene(vec3 p)
{
    vec3 z = p;
    float scale = 2.0;
    float b = 10000.0;
    float t = 0.0;

    for (int i = 0; i < NUM_ITERATIONS; ++i)
    {
        if (z.x + z.y < 0.0) { float x1 = -z.y; z.y = -z.x; z.x = x1; }
        if (z.x + z.z < 0.0) { float x1 = -z.z; z.z = -z.x; z.x = x1; }
        if (z.x - z.y < 0.0) { float x1 = z.y; z.y = z.x; z.x = x1; }
        if (z.x - z.z < 0.0) { float x1 = z.z; z.z = z.x; z.x = x1; }

        z.x = scale * z.x - (scale-1.0) * 1.0;
        z.y = scale * z.y;
        z.z = scale * z.z;

        float m = dot(z, z);
        b = min(m, b);
        t = float(i+1);
        if (m >= 8.0)
            break;
    }

    return Distance((length(z)-2.0) * pow(scale, -t), hsv2rgb(-b*1.2+0.3, 0.6, 0.7));
}
