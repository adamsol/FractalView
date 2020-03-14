
uniform int NUM_ITERATIONS;         // default: 15, min: 0, max: 30

uniform float SCALE;                // default: 2.0, min: 1.0, max: 5.0
uniform float C_X;                  // default: 0.8507, min: 0.0, max: 5.0
uniform float C_Y;                  // default: 0.5257, min: 0.0, max: 5.0
uniform float C_Z;                  // default: 0.0, min: 0.0, max: 5.0
uniform float ROT1_X;               // default: 0.0, min: -90.0, max: 90.0
uniform float ROT1_Y;               // default: 0.0, min: -90.0, max: 90.0
uniform float ROT1_Z;               // default: 0.0, min: -90.0, max: 90.0
uniform float ROT2_X;               // default: 0.0, min: -90.0, max: 90.0
uniform float ROT2_Y;               // default: 0.0, min: -90.0, max: 90.0
uniform float ROT2_Z;               // default: 0.0, min: -90.0, max: 90.0

const float PHI = (sqrt(5.0)+1.0)/2.0;
const vec3 N1 = normalize(vec3(-PHI, PHI-1.0, 1.0));
const vec3 N2 = normalize(vec3(1.0, -PHI, PHI+1.0));
const vec3 N3 = normalize(vec3(0.0, 0.0, -1.0));

Distance Scene(vec3 p)
{
	vec3 z = p;
	float b = 10000.0;
	float t = 0.0;

	z = abs(z);
	z -= 2.0 * max(0.0, dot(z, N1)) * N1;
	z -= 2.0 * max(0.0, dot(z, N2)) * N2;
	z -= 2.0 * max(0.0, dot(z, N3)) * N3;
	z -= 2.0 * max(0.0, dot(z, N2)) * N2;

	for (int i = 0; i < 30; ++i) {
		if (i == NUM_ITERATIONS) {
			break;
		}
		z = rotateX(z, ROT1_X);
		z = rotateY(z, ROT1_Y);
		z = rotateZ(z, ROT1_Z);

		z = abs(z);
		z -= 2.0 * max(0.0, dot(z, N1)) * N1;

		z = rotateX(z, ROT2_X);
		z = rotateY(z, ROT2_Y);
		z = rotateZ(z, ROT2_Z);

		z = SCALE * z - (SCALE-1.0) * vec3(C_X, C_Y, C_Z);

		float m = dot(z, z);
		b = min(m, b);
		t = float(i+1);
		if (m >= 8.0) {
			break;
		}
	}
	return Color((length(z)-2.0) * pow(SCALE, -t), hsv2rgb(b*COLOR_HUE_SCALE+COLOR_HUE_OFFSET, COLOR_SATURATION, COLOR_VALUE));
}
