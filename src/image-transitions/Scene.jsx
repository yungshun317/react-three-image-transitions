import { useState, useRef, useEffect } from "react";
import {extend, useFrame, useLoader, useThree} from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import image1 from "../assets/images/image00.png";
import image2 from "../assets/images/image01.png";
import image3 from "../assets/images/image02.png";

const ImageTransitionsMaterial = shaderMaterial(
    { uTime: 0, uProgress: 0, width: 0.5, scaleX: 40, scaleY: 40, uTexture1: null, uTexture2: null },
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

    varying vec2 vUv;

    void main() {
        vec4 texture1 = texture2D(uTexture1, vUv);
        vec4 texture2 = texture2D(uTexture2, vUv);
        gl_FragColor = mix(texture1, texture2, uProgress);
    }
    `
)

extend({ ImageTransitionsMaterial });

const ImageTransitions = () => {
    const imageRef = useRef();
    const isAnimating = useRef(false);
    const { viewport } = useThree();

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
            duration: 3,
            ease: 'power2.out',
            onComplete: () => {
                material.uTexture1.value = images[imageIndex];
                material.uProgress.value = 0;
                isAnimating.current = false;
            }
        });

        /*
        gsap.to(imageRef.current.uniforms.width ,{
            value: 10,
            duration: 1.5,
            ease: "power2.out"
        });

        gsap.to(imageRef.current.uniforms.scaleX ,{
            value: 60,
            duration: 1.5,
            ease: "power2.out"
        });

        gsap.to(imageRef.current.uniforms.scaleY ,{
            value: 60,
            duration: 1.5,
            ease: "power2.out"
        });
        */

    }, [imageIndex]);

    return (
        <mesh onClick={handleClick}>
            <planeGeometry args={[viewport.width, viewport.height]} />
            <imageTransitionsMaterial
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
            <ImageTransitions />
        </>
    );
};

export default Scene;