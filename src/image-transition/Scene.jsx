import { useState, useRef, useEffect } from "react";
import { extend, useLoader, useThree } from "@react-three/fiber";
import {shaderMaterial, useTexture} from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

const ImageTransitionMaterial = shaderMaterial(
    // Adjust `intensity` in (0, 2)
    { uProgress: 0, intensity: 0.3, uTexture1: null, uTexture2: null, resolution: new THREE.Vector4(1, 1, 1, 1)},
    `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `,
    `
    uniform float uProgress;
    uniform float intensity;
    uniform sampler2D uTexture1;
    uniform sampler2D uTexture2;
    uniform sampler2D displacement;
    uniform vec4 resolution;

    varying vec2 vUv;
    
    void main() {
        vec2 newUV = (vUv - vec2(0.5)) * resolution.zw + vec2(0.5);

        vec4 d1 = texture2D(uTexture1, newUV);
        vec4 d2 = texture2D(uTexture2, newUV);

        float displace1 = (d1.r + d1.g + d1.b) * 0.33;
        float displace2 = (d2.r + d2.g + d2.b) * 0.33;
         
        vec4 t1 = texture2D(uTexture1, vec2(newUV.x, newUV.y + uProgress * (displace2 * intensity)));
        vec4 t2 = texture2D(uTexture2, vec2(newUV.x, newUV.y + (1.0 - uProgress) * (displace1 * intensity)));

        gl_FragColor = mix(t1, t2, uProgress);
    }
    `
)

extend({ ImageTransitionMaterial });

const ImageTransition = () => {
    const imageRef = useRef();
    const isAnimating = useRef(false);

    const { viewport } = useThree();
    const { size } = useThree();

    const images = useLoader(THREE.TextureLoader, [
        "../assets/images/image00.png",
        "../assets/images/image01.png",
        "../assets/images/image02.png"
    ]);

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

        /*
        gsap.to(imageRef.current.uniforms.intensity,{
            value: 0.3,
            duration: 1.5,
            ease: "power2.out"
        });
         */

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
            <imageTransitionMaterial
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
            <ImageTransition />
        </>
    );
};

export default Scene;