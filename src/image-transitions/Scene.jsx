import { useState, useRef, useEffect } from "react";
import { extend, useLoader, useThree } from "@react-three/fiber";
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

    const [imageIndex, setImageIndex] = useState(0);

    const handleClick = () => {
        setImageIndex((prev) => (prev + 1) % images.length);
    }

    useEffect(() => {
        if (!imageRef.current) return;

        gsap.to(imageRef.current.uniforms.uProgress, {
            value: 1,
            duration: 1.5,
            ease: 'power2.out',
            onComplete: () => {
                imageRef.current.uniforms.uTexture1.value = images[imageIndex];
                imageRef.current.uniforms.uProgress.value = 0;
            }
        });

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