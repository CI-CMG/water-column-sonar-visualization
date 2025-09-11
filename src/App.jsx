import { useRef, } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { MapControls } from '@react-three/drei'
import * as THREE from 'three'
import './App.css'

function Box(props) {
    const meshRef = useRef(null)
    useFrame((_, delta) => {
        meshRef.current.rotation.x += delta;
        meshRef.current.rotation.y += delta;
    })
    return (
        <mesh
            {...props}
            ref={meshRef}
            scale={1}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color='green' map={createTextTexture("fish")} />
        </mesh>
    )
}

function App() {
    return (
        <Canvas
            style={{ width: '100vw', height: '100vh' }}>
            <ambientLight intensity={Math.PI / 2} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
            <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
            <Box position={[0, 0, 0]} />
            <MapControls
                makeDefault
                enableRotate={false}
                minDistance={2}
                maxDistance={10}
                maxPolarAngle={Math.PI / 2}
                screenSpacePanning={true}
            />
        </Canvas >
    )
}

export default App

function createTextTexture(text) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 256;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "black";
    ctx.font = '100px "Comic Sans MS"';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    return new THREE.CanvasTexture(canvas);
}
