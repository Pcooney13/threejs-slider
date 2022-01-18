uniform float time;
uniform float bend;
varying vec2 vUv;
float PI = 3.141592653589793238;
uniform float distanceFromCenter;
void main() {
    vec3 pos = position;
    // pass to to frag
    vUv = (uv - vec2(0.5))*(0.8 - 0.1*distanceFromCenter*(2.0 - distanceFromCenter)) + vec2(0.5);
    //card bend
    pos.y += sin(PI*uv.x)*bend;
    // card bounce speed
    pos.y += sin(time * 0.5)*bend;
    //inner image bounce speed
    vUv.y += sin(time * 0.5)*0.025;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0);
}


    