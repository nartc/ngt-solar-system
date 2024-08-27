uniform vec3 color1;
uniform vec3 color2;

varying float vReflectionFactor;

void main() {
    float f = clamp(vReflectionFactor, 0.0, 1.0);
    gl_FragColor = vec4(mix(color2, color1, vec3(f)), f);
}
