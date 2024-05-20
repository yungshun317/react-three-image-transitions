import {useRef} from "react";

const Scene = () => {
    const mesh = useRef();

    return (
        <>
            <mesh ref={mesh}>
                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial color={0xffffff} />
            </mesh>
        </>
    );
};

export default Scene;