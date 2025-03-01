import { useRef } from "react";

const fragmentShader = ``;
const vertexShader = ``;

const Scene = () => {
    const mesh = useRef();

    return (
        <>
            <mesh ref={mesh}>
                <boxGeometry args={[1, 1, 1]} />
                <shaderMaterial
                    fragmentShader={fragmentShader}
                    vertexShader={vertexShader}
                />
            </mesh>
        </>
    );
};

export default Scene;