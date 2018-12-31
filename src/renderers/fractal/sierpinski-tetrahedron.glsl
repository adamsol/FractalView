
const int NUM_ITERATIONS = 30;

uniform float SCALE;                // default: 1.7, min: 1.0, max: 5.0
uniform float ROT1_X;               // default: 0.0, min: -90.0, max: 90.0
uniform float ROT1_Y;               // default: 0.0, min: -90.0, max: 90.0
uniform float ROT1_Z;               // default: -15.0, min: -90.0, max: 90.0
uniform float ROT2_X;               // default: 10.0, min: -90.0, max: 90.0
uniform float ROT2_Y;               // default: 0.0, min: -90.0, max: 90.0
uniform float ROT2_Z;               // default: 20.0, min: -90.0, max: 90.0

uniform float COLOR_HUE_SCALE;      // default: 1.2, min: -3.0, max: 3.0
uniform float COLOR_HUE_OFFSET;     // default: 0.1, min: 0.0, max: 1.0
uniform float COLOR_SATURATION;     // default: 0.6, min: 0.0, max: 2.0
uniform float COLOR_VALUE;          // default: 0.7, min: 0.0, max: 2.0

Distance Scene(vec3 p)
{
    vec3 z = p;
    float scale = SCALE;
    float b = 10000.0;
    float t = 0.0;

    for (int i = 0; i < NUM_ITERATIONS; ++i)
    {
        z = rotateZ(z, ROT1_Z);
        z = rotateY(z, ROT1_Y);
        z = rotateX(z, ROT1_X);

        if (z.x + z.y < 0.0) { float x1 = -z.y; z.y = -z.x; z.x = x1; }
        if (z.x + z.z < 0.0) { float x1 = -z.z; z.z = -z.x; z.x = x1; }
        if (z.y + z.z < 0.0) { float y1 = -z.z; z.z = -z.y; z.y = y1; }

        z = rotateZ(z, ROT2_Z);
        z = rotateY(z, ROT2_Y);
        z = rotateX(z, ROT2_X);

        z.x = scale * z.x - (scale-1.0) * 1.0;
        z.y = scale * z.y - (scale-1.0) * 1.0;
        z.z = scale * z.z - (scale-1.0) * 1.0;

        float m = dot(z, z);
        b = min(m, b);
        t = float(i+1);
        if (m >= 8.0) {
            break;
        }
    }

    return Color((length(z)-2.0) * pow(scale, -t), hsv2rgb(b*COLOR_HUE_SCALE+COLOR_HUE_OFFSET, COLOR_SATURATION, COLOR_VALUE));
}
