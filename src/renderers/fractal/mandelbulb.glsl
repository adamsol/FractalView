
uniform int NUM_ITERATIONS;         // default: 8, min: 0, max: 30

uniform float EXPONENT;             // default: 6.0, min: 1.0, max: 16.0

Distance Scene(vec3 p)
{
	vec3 z = vec3(0.0);
	vec3 d = vec3(1.0);
	float r = 0.0;
	float k = EXPONENT;
	float b = 10000.0;

	for (int i = 0; i < 30; ++i) {
		if (i == NUM_ITERATIONS) {
			break;
		}
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
		if (r >= 2.0) {
			break;
		}
	}
	return Color(r * log(r) * 0.5 / length(d), hsv2rgb(vec3(b*COLOR_HUE_SCALE+COLOR_HUE_OFFSET, COLOR_SATURATION, COLOR_VALUE*1.3)));
}
