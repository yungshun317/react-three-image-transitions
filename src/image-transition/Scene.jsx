import { useState, useRef, useEffect } from "react";
import { extend, useLoader, useThree } from "@react-three/fiber";
import {shaderMaterial} from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

const ImageTransitionMaterial = shaderMaterial(
    // Adjust `width` in (0, 10)
    { uTime: 0, uProgress: 0, width: 0.5, uTexture1: null, uTexture2: null, resolution: new THREE.Vector4(1, 1, 1, 1)},
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
    uniform sampler2D uTexture1;
    uniform sampler2D uTexture2;
    uniform vec4 resolution;

    varying vec2 vUv;

    void main() {
        vec2 newUV = (vUv - vec2(0.5)) * resolution.zw + vec2(0.5);
        vec2 p = newUV;
        float x = uProgress;
        x = smoothstep(.0, 1.0, (x * 2.0 + p.y - 1.0));
        vec4 f = mix(
            texture2D(uTexture1, (p - .5) * (1. - x) + .5), 
            texture2D(uTexture2, (p - .5) * x + .5), 
            x
        );
        gl_FragColor = f;
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

        gsap.to(imageRef.current.uniforms.width,{
            value: 0.5,
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