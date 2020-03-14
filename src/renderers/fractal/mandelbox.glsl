
uniform int NUM_ITERATIONS;         // default: 15, min: 0, max: 30

uniform float SCALE;                // default: 2.0, min: -5.0, max: 5.0
uniform float R1;                   // default: 0.5, min: 0.0, max: 5.0
uniform float R2;                   // default: 1.0, min: 0.0, max: 5.0
uniform float F;                    // default: 1.2, min: -5.0, max: 5.0

Distance Scene(vec3 p)
{
	vec3 z = vec3(0.0);
	float d = 1.0;
	float r = 0.0;
	float b = 10000.0;

	for (int i = 0; i < 30; ++i) {
		if (i == NUM_ITERATIONS) {
			break;
		}
		z = clamp(z, -1.0, 1.0) * 2.0 - z;
		z *= F;

		r = length(z);
		if (r < R1) {
			float w = R2/R1;
			w *= w;
			z *= w;
			d *= w;
		} else if (r < R2) {
			float w = R2/r;
			w *= w;
			z *= w;
			d *= w;
		}
		z = z * SCALE + p;
		d = d * abs(SCALE) + 1.0;

		r = length(z);
		b = min(r, b);
		if (r >= 10.0) {
			break;
		}
	}
	return Color(r / d, hsv2rgb(b/5.0*COLOR_HUE_SCALE+COLOR_HUE_OFFSET, COLOR_SATURATION, COLOR_VALUE));
}
