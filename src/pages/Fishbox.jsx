import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { MapControls } from '@react-three/drei'
import * as THREE from 'three'
import '../App.css'

function Box(props) {
    const meshRef = useRef(null);
    const [texture, setTexture] = useState(null);

    //Animate the rotation
    useFrame((_, delta) => {
        meshRef.current.rotation.x += delta;
        meshRef.current.rotation.y += delta;
    });

    useEffect(() => {
        async function makeTexture() {
            // The font doesn't load instantly, so we have to wait for it before continuing
            await document.fonts.load('100px "Comic Sans MS"');

            // We are using a traditional canvas for the box sides because it's simple
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 256;
            canvas.height = 256;

            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = 'black';
            ctx.font = '100px "Comic Sans MS"';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('fish', canvas.width / 2, canvas.height / 2);

            // Apply the canvas as a texture to all sides of the box
            setTexture(new THREE.CanvasTexture(canvas));
        }

        makeTexture();
    }, []);

    return (
        <mesh
            {...props}
            ref={meshRef}
            scale={1}>
            <boxGeometry args={[1, 1, 1]} />
            {/* The texture might not exist if it's still loading the font */}
            {texture && <meshStandardMaterial color='green' map={texture} />}
        </mesh>
    )
}

function Fishbox() {
    return (
        // This is an R3F canvas that allows for higher-level rendering
        // Without this, the implementation would be twice as long
        <Canvas
            style={{ width: '100vw', height: '100vh' }}>
            {/* Some lighting */}
            <ambientLight intensity={Math.PI / 2} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
            <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
            <Box position={[0, 0, 0]} />
            {/* Enables panning and zooming on the box */}
            <MapControls
                makeDefault
                enableRotate={false}
                minDistance={2}
                maxDistance={10}
                maxPolarAngle={Math.PI / 2}
                screenSpacePanning={true}
            />
        </Canvas>
    )
}

export default Fishbox
