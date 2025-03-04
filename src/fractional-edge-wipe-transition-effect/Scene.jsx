import { useState, useRef, useEffect } from "react";
import {extend, useFrame, useLoader, useThree} from "@react-three/fiber";
import {shaderMaterial, useTexture} from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import image1 from "../assets/images/image00.png";
import image2 from "../assets/images/image01.png";
import image3 from "../assets/images/image02.png";
import displacementMap from "../assets/images/disp1.jpg";

const FractionalEdgeWipeTransitionMaterial = shaderMaterial(
    // Adjust `width` in (0, 10), `scaleX` in (0.1, 60), `scaleY` in (0.1, 60)
    { uTime: 0, uProgress: 0, width: 0.5, scaleX: 40, scaleY: 40, uTexture1: null, uTexture2: null, displacement: null, resolution: new THREE.Vector4(1, 1, 1, 1)},
    `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `,
    `
    uniform float uTime;
    uniform float uProgress;
    uniform float width;
    uniform float scaleX;
    uniform float scaleY;
    uniform sampler2D uTexture1;
    uniform sampler2D uTexture2;
    uniform sampler2D displacement;
    uniform vec4 resolution;

    varying vec2 vUv;

    // Classic Perlin 3D Noise 
    // by Stefan Gustavson
    //
    vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
    vec4 fade(vec4 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

    float cnoise(vec4 P){
      ;
      vec4 Pi0 = floor(P); // Integer part for indexing
      vec4 Pi1 = Pi0 + 1.0; // Integer part + 1
      Pi0 = mod(Pi0, 289.0);
      Pi1 = mod(Pi1, 289.0);
      vec4 Pf0 = fract(P); // Fractional part for interpolation
      vec4 Pf1 = Pf0 - 1.0; // Fractional part - 1.0
      vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
      vec4 iy = vec4(Pi0.yy, Pi1.yy);
      vec4 iz0 = vec4(Pi0.zzzz);
      vec4 iz1 = vec4(Pi1.zzzz);
      vec4 iw0 = vec4(Pi0.wwww);
      vec4 iw1 = vec4(Pi1.wwww);

      vec4 ixy = permute(permute(ix) + iy);
      vec4 ixy0 = permute(ixy + iz0);
      vec4 ixy1 = permute(ixy + iz1);
      vec4 ixy00 = permute(ixy0 + iw0);
      vec4 ixy01 = permute(ixy0 + iw1);
      vec4 ixy10 = permute(ixy1 + iw0);
      vec4 ixy11 = permute(ixy1 + iw1);

      vec4 gx00 = ixy00 / 7.0;
      vec4 gy00 = floor(gx00) / 7.0;
      vec4 gz00 = floor(gy00) / 6.0;
      gx00 = fract(gx00) - 0.5;
      gy00 = fract(gy00) - 0.5;
      gz00 = fract(gz00) - 0.5;
      vec4 gw00 = vec4(0.75) - abs(gx00) - abs(gy00) - abs(gz00);
      vec4 sw00 = step(gw00, vec4(0.0));
      gx00 -= sw00 * (step(0.0, gx00) - 0.5);
      gy00 -= sw00 * (step(0.0, gy00) - 0.5);

      vec4 gx01 = ixy01 / 7.0;
      vec4 gy01 = floor(gx01) / 7.0;
      vec4 gz01 = floor(gy01) / 6.0;
      gx01 = fract(gx01) - 0.5;
      gy01 = fract(gy01) - 0.5;
      gz01 = fract(gz01) - 0.5;
      vec4 gw01 = vec4(0.75) - abs(gx01) - abs(gy01) - abs(gz01);
      vec4 sw01 = step(gw01, vec4(0.0));
      gx01 -= sw01 * (step(0.0, gx01) - 0.5);
      gy01 -= sw01 * (step(0.0, gy01) - 0.5);

      vec4 gx10 = ixy10 / 7.0;
      vec4 gy10 = floor(gx10) / 7.0;
      vec4 gz10 = floor(gy10) / 6.0;
      gx10 = fract(gx10) - 0.5;
      gy10 = fract(gy10) - 0.5;
      gz10 = fract(gz10) - 0.5;
      vec4 gw10 = vec4(0.75) - abs(gx10) - abs(gy10) - abs(gz10);
      vec4 sw10 = step(gw10, vec4(0.0));
      gx10 -= sw10 * (step(0.0, gx10) - 0.5);
      gy10 -= sw10 * (step(0.0, gy10) - 0.5);

      vec4 gx11 = ixy11 / 7.0;
      vec4 gy11 = floor(gx11) / 7.0;
      vec4 gz11 = floor(gy11) / 6.0;
      gx11 = fract(gx11) - 0.5;
      gy11 = fract(gy11) - 0.5;
      gz11 = fract(gz11) - 0.5;
      vec4 gw11 = vec4(0.75) - abs(gx11) - abs(gy11) - abs(gz11);
      vec4 sw11 = step(gw11, vec4(0.0));
      gx11 -= sw11 * (step(0.0, gx11) - 0.5);
      gy11 -= sw11 * (step(0.0, gy11) - 0.5);

      vec4 g0000 = vec4(gx00.x,gy00.x,gz00.x,gw00.x);
      vec4 g1000 = vec4(gx00.y,gy00.y,gz00.y,gw00.y);
      vec4 g0100 = vec4(gx00.z,gy00.z,gz00.z,gw00.z);
      vec4 g1100 = vec4(gx00.w,gy00.w,gz00.w,gw00.w);
      vec4 g0010 = vec4(gx10.x,gy10.x,gz10.x,gw10.x);
      vec4 g1010 = vec4(gx10.y,gy10.y,gz10.y,gw10.y);
      vec4 g0110 = vec4(gx10.z,gy10.z,gz10.z,gw10.z);
      vec4 g1110 = vec4(gx10.w,gy10.w,gz10.w,gw10.w);
      vec4 g0001 = vec4(gx01.x,gy01.x,gz01.x,gw01.x);
      vec4 g1001 = vec4(gx01.y,gy01.y,gz01.y,gw01.y);
      vec4 g0101 = vec4(gx01.z,gy01.z,gz01.z,gw01.z);
      vec4 g1101 = vec4(gx01.w,gy01.w,gz01.w,gw01.w);
      vec4 g0011 = vec4(gx11.x,gy11.x,gz11.x,gw11.x);
      vec4 g1011 = vec4(gx11.y,gy11.y,gz11.y,gw11.y);
      vec4 g0111 = vec4(gx11.z,gy11.z,gz11.z,gw11.z);
      vec4 g1111 = vec4(gx11.w,gy11.w,gz11.w,gw11.w);

      vec4 norm00 = taylorInvSqrt(vec4(dot(g0000, g0000), dot(g0100, g0100), dot(g1000, g1000), dot(g1100, g1100)));
      g0000 *= norm00.x;
      g0100 *= norm00.y;
      g1000 *= norm00.z;
      g1100 *= norm00.w;

      vec4 norm01 = taylorInvSqrt(vec4(dot(g0001, g0001), dot(g0101, g0101), dot(g1001, g1001), dot(g1101, g1101)));
      g0001 *= norm01.x;
      g0101 *= norm01.y;
      g1001 *= norm01.z;
      g1101 *= norm01.w;

      vec4 norm10 = taylorInvSqrt(vec4(dot(g0010, g0010), dot(g0110, g0110), dot(g1010, g1010), dot(g1110, g1110)));
      g0010 *= norm10.x;
      g0110 *= norm10.y;
      g1010 *= norm10.z;
      g1110 *= norm10.w;

      vec4 norm11 = taylorInvSqrt(vec4(dot(g0011, g0011), dot(g0111, g0111), dot(g1011, g1011), dot(g1111, g1111)));
      g0011 *= norm11.x;
      g0111 *= norm11.y;
      g1011 *= norm11.z;
      g1111 *= norm11.w;

      float n0000 = dot(g0000, Pf0);
      float n1000 = dot(g1000, vec4(Pf1.x, Pf0.yzw));
      float n0100 = dot(g0100, vec4(Pf0.x, Pf1.y, Pf0.zw));
      float n1100 = dot(g1100, vec4(Pf1.xy, Pf0.zw));
      float n0010 = dot(g0010, vec4(Pf0.xy, Pf1.z, Pf0.w));
      float n1010 = dot(g1010, vec4(Pf1.x, Pf0.y, Pf1.z, Pf0.w));
      float n0110 = dot(g0110, vec4(Pf0.x, Pf1.yz, Pf0.w));
      float n1110 = dot(g1110, vec4(Pf1.xyz, Pf0.w));
      float n0001 = dot(g0001, vec4(Pf0.xyz, Pf1.w));
      float n1001 = dot(g1001, vec4(Pf1.x, Pf0.yz, Pf1.w));
      float n0101 = dot(g0101, vec4(Pf0.x, Pf1.y, Pf0.z, Pf1.w));
      float n1101 = dot(g1101, vec4(Pf1.xy, Pf0.z, Pf1.w));
      float n0011 = dot(g0011, vec4(Pf0.xy, Pf1.zw));
      float n1011 = dot(g1011, vec4(Pf1.x, Pf0.y, Pf1.zw));
      float n0111 = dot(g0111, vec4(Pf0.x, Pf1.yzw));
      float n1111 = dot(g1111, Pf1);

      vec4 fade_xyzw = fade(Pf0);
      vec4 n_0w = mix(vec4(n0000, n1000, n0100, n1100), vec4(n0001, n1001, n0101, n1101), fade_xyzw.w);
      vec4 n_1w = mix(vec4(n0010, n1010, n0110, n1110), vec4(n0011, n1011, n0111, n1111), fade_xyzw.w);
      vec4 n_zw = mix(n_0w, n_1w, fade_xyzw.z);
      vec2 n_yzw = mix(n_zw.xy, n_zw.zw, fade_xyzw.y);
      float n_xyzw = mix(n_yzw.x, n_yzw.y, fade_xyzw.x);
      return 2.2 * n_xyzw;
    }

    float parabola( float x, float k ) {
        return pow( 4. * x * ( 1. - x ), k );
    }

    void main() {
        float dt = parabola(uProgress, 1.);
        float border = 1.;
        vec2 newUV = (vUv - vec2(0.5)) * resolution.zw + vec2(0.5);
        
        vec4 color1 = texture2D(uTexture1, newUV);
        vec4 color2 = texture2D(uTexture2, newUV);
        // vec4 d = texture2D(displacement, vec2(newUV.x * scaleX, newUV.y * scaleY));

        float realnoise = 0.5 * (cnoise(vec4(newUV.x * scaleX + 0. * uTime / 3., newUV.y * scaleY, 0. * uTime / 3., 0.)) + 1.);

        float w = width * dt;
        float maskvalue = smoothstep(1. - w, 1., vUv.x + mix(-w/2., 1. - w/2., uProgress));
        // float maskvalue0 = smoothstep(1., 1., vUv.x + uProgress);

        float mask = maskvalue + maskvalue * realnoise;
        // float mask = maskvalue;
        
        float final = smoothstep(border, border + 0.01, mask);

        gl_FragColor = mix(color1, color2, final);
        // gl_FragColor = vec4(maskvalue0, final, 0., 1.);
        
        /*
        vec4 texture1 = texture2D(uTexture1, vUv);
        vec4 texture2 = texture2D(uTexture2, vUv);
        gl_FragColor = mix(texture1, texture2, uProgress);
        */
    }
    `
)

extend({ FractionalEdgeWipeTransitionMaterial });

const FractionalEdgeWipeTransitionEffect = () => {
    const imageRef = useRef();
    const isAnimating = useRef(false);

    const { viewport } = useThree();
    const { size } = useThree();

    /*
    const images = [
        useLoader(THREE.TextureLoader, "../assets/images/image00.png"),
        useLoader(THREE.TextureLoader, "../assets/images/image01.png"),
        useLoader(THREE.TextureLoader, "../assets/images/image02.png")
    ];
    */

    const images = useLoader(THREE.TextureLoader, [
        "../assets/images/image00.png",
        "../assets/images/image01.png",
        "../assets/images/image02.png"
    ]);
    const displacement = useTexture(displacementMap);
    useEffect(() => {
        if (imageRef.current && displacement) {
            imageRef.current.uniforms.displacement.value = displacement;
        }
    }, [displacement]);

    const [hasStarted, setHasStarted] = useState(false);
    const [imageIndex, setImageIndex] = useState(0);

    const handleClick = () => {
        if (isAnimating.current) return;
        isAnimating.current = true;

        // Mark that user has interacted
        setHasStarted(true);

        // Trigger next image
        setImageIndex((prev) => (prev + 1) % images.length);
    }

    useEffect(() => {
        if (!imageRef.current || !hasStarted) return;

        const material = imageRef.current.uniforms;
        const prevImageIndex = (imageIndex - 1 + images.length) % images.length;

        // Correctly assign previous image to textures
        material.uTexture1.value = images[prevImageIndex];
        material.uTexture2.value = images[imageIndex];

        gsap.to(imageRef.current.uniforms.uProgress, {
            value: 1,
            duration: 1.5,
            ease: 'power2.out',
            onComplete: () => {
                material.uTexture1.value = images[imageIndex];
                material.uProgress.value = 0;
                isAnimating.current = false;
            }
        });

        gsap.to(imageRef.current.uniforms.width,{
            value: 0.5,
            duration: 1.5,
            ease: "power2.out"
        });

        gsap.to(imageRef.current.uniforms.scaleX,{
            value: 40,
            duration: 1.5,
            ease: "power2.out"
        });

        gsap.to(imageRef.current.uniforms.scaleY,{
            value: 40,
            duration: 1.5,
            ease: "power2.out"
        });

    }, [imageIndex]);

    useEffect(() => {
        if (imageRef.current) {
            const texture = images[imageIndex];
            const imgAspect = texture.image.height / texture.image.width;
            let a1, a2;

            if (size.height / size.width > imgAspect) {
                a1 = (size.width / size.height) * imgAspect;
                a2 = 1;
            } else {
                a1 = 1;
                a2 = (size.height / size.width) / imgAspect;
            }

            imageRef.current.uniforms.resolution.value.set(
                size.width, size.height, a1, a2
            );
        }
    }, [size, imageIndex]);

    return (
        <mesh onClick={handleClick}>
            <planeGeometry args={[viewport.width, viewport.height]} />
            <fractionalEdgeWipeTransitionMaterial
                ref={imageRef}
                transparent={true}
                uTexture1={images[imageIndex]}
                uTexture2={images[(imageIndex + 1) % images.length]}
                displacement={displacement}
            />
        </mesh>
    );
}

const Scene = () => {
    return (
        <>
            <FractionalEdgeWipeTransitionEffect />
        </>
    );
};

export default Scene;