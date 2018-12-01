
Distance Scene(vec3 p)
{
    const int n = NUM_ITERATIONS * 2;
    vec3 z = p;
    float scale = 1.7;
    float b = 10000.0;
    float t = 0.0;

    for (int i = 0; i < n; ++i)
    {
        z = rotateZ(z, -15.0);

        if (z.x + z.y < 0.0) { float x1 = -z.y; z.y = -z.x; z.x = x1; }
        if (z.x + z.z < 0.0) { float x1 = -z.z; z.z = -z.x; z.x = x1; }
        if (z.y + z.z < 0.0) { float y1 = -z.z; z.z = -z.y; z.y = y1; }

        z = rotateZ(z, 20.0);
        z = rotateX(z, 10.0);

        z.x = scale * z.x - (scale-1.0) * 1.0;
        z.y = scale * z.y - (scale-1.0) * 1.0;
        z.z = scale * z.z - (scale-1.0) * 1.0;

        float m = dot(z, z);
        b = min(m, b);
        t = float(i+1);
        if (m >= 8.0)
            break;
    }

    return Distance((length(z)-2.0) * pow(scale, -t), hsv2rgb(b*1.2 + 0.1, 0.6, 0.7));
}
