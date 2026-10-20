export const LIMB_FADE_VERTEX = `
#include <begin_vertex>
vec3 dotCenter = (modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
vec3 globeCenter = (modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
float facing = dot(normalize(dotCenter - globeCenter), normalize(-dotCenter));
transformed *= smoothstep(0.04, 0.32, facing);
`;
