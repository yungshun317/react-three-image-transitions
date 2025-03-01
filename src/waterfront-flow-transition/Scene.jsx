import { useState, useRef, useEffect } from "react";
import { extend, useLoader, useThree } from "@react-three/fiber";
import {shaderMaterial, useTexture} from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import displacementMap from "../assets/images/disp1.jpg";

const WaterfrontFlowTransitionMaterial = shaderMaterial(
    // Adjust `width` in (0, 1), `radius` in (0.1, 2)
    { uTime: 0, uProgress: 0, uTexture1: null, uTexture2: null, displacement: null, resolution: new THREE.Vector4(1, 1, 1, 1)},
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
    uniform sampler2D uTexture1;
    uniform sampler2D uTexture2;
    uniform sampler2D displacement;
    uniform vec4 resolution;

    varying vec2 vUv;
    
    vec2 mirrored(vec2 v) {
        vec2 m = mod(v,2.);
        return mix(m,2.0 - m, step(1.0 ,m));
    }

    void main() {
        vec2 newUV = (vUv - vec2(0.5)) * resolution.zw + vec2(0.5);
        vec4 noise = texture2D(displacement, mirrored(newUV + uTime * 0.04));
        float prog = uProgress * 0.8 - 0.05 + noise.g * 0.06;
        float intpl = pow(abs(smoothstep(0., 1., (prog * 2. - vUv.x + 0.5))), 10.);
 
        vec4 t1 = texture2D(uTexture1, (newUV - 0.5) * (1.0 - intpl) + 0.5) ;
        vec4 t2 = texture2D(uTexture2, (newUV - 0.5) * intpl + 0.5);
        gl_FragColor = mix(t1, t2, intpl);
    }
    `
)

extend({ WaterfrontFlowTransitionMaterial });

const WaterfrontFlowTransition = () => {
    const imageRef = useRef();
    const isAnimating = useRef(false);

    const { viewport } = useThree();
    const { size } = useThree();

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
            <waterfrontFlowTransitionMaterial
                ref={imageRef}
                transparent={true}
                uTexture1={images[imageIndex]}
                uTexture2={images[(imageIndex + 1) % images.length]}
            />
        </mesh>
    );
}

const Scene = () => {
    return (
        <>
            <WaterfrontFlowTransition />
        </>
    );
};

export default Scene;