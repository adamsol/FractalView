
uniform int NUM_ITERATIONS;         // default: 10, min: 0, max: 30

uniform float SCALE;                // default: 3.0, min: 1.0, max: 5.0
uniform float C_X;                  // default: 1.0, min: 0.0, max: 5.0
uniform float C_Y;                  // default: 1.0, min: 0.0, max: 5.0
uniform float C_Z;                  // default: 1.0, min: 0.0, max: 5.0
uniform float ROT1_X;               // default: 0.0, min: -90.0, max: 90.0
uniform float ROT1_Y;               // default: 0.0, min: -90.0, max: 90.0
uniform float ROT1_Z;               // default: 0.0, min: -90.0, max: 90.0
uniform float ROT2_X;               // default: 0.0, min: -90.0, max: 90.0
uniform float ROT2_Y;               // default: 0.0, min: -90.0, max: 90.0
uniform float ROT2_Z;               // default: 0.0, min: -90.0, max: 90.0

Distance Scene(vec3 p)
{
	vec3 z = p;
	float b = 10000.0;
	float t = 0.0;

	for (int i = 0; i < 30; ++i) {
		if (i == NUM_ITERATIONS) {
			break;
		}
		z = rotateX(z, ROT1_X);
		z = rotateY(z, ROT1_Y);
		z = rotateZ(z, ROT1_Z);

		z = abs(z);
		if (z.x - z.y < 0.0) { z.xy = z.yx; }
		if (z.x - z.z < 0.0) { z.xz = z.zx; }
		if (z.y - z.z < 0.0) { z.yz = z.zy; }

		z = rotateX(z, ROT2_X);
		z = rotateY(z, ROT2_Y);
		z = rotateZ(z, ROT2_Z);

		z.x = SCALE * z.x - (SCALE-1.0) * C_X;
		z.y = SCALE * z.y - (SCALE-1.0) * C_Y;
		z.z = SCALE * z.z;
		if (z.z > (SCALE-1.0)*0.5 * C_Z) {
			z.z -= (SCALE-1.0) * C_Z;
		}

		float m = dot(z, z);
		b = min(m, b);
		t = float(i+1);
		if (m >= 8.0) {
			break;
		}
	}

	return Color((length(z)-2.0) * pow(SCALE, -t), hsv2rgb(b*COLOR_HUE_SCALE*0.3+COLOR_HUE_OFFSET, COLOR_SATURATION, COLOR_VALUE));
}
