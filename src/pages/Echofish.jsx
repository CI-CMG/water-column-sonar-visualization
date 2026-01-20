import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { scaleSequential } from  'd3-scale'
import { interpolateTurbo } from 'd3-scale-chromatic'
import { Canvas } from '@react-three/fiber'
import { MapControls } from '@react-three/drei'
import { fetchSvTile } from '../features/store/storeApi'
import '../App.css'
import { data } from 'react-router'

const Plane = (props) => {
    const meshRef = useRef(null);
    const [texture, setTexture] = useState(null);
    // const dispatch = useDispatch()
    // const sv = useSelector(selectSv)

    useEffect(() => {
        const makeTile = async () => {
            const ship = "Henry_B._Bigelow"
            const cruise = "HB1906"
            const sensor = "EK60"

            const initTile = await fetchSvTile(ship, cruise, sensor, 0, 256, 0, 256)
            const tile = initTile;

            // Maps the SV points to a d3 scale
            const colorScale = scaleSequential(interpolateTurbo).domain([-100, 0]);
            // This array stores each byte of color separately as RGBA
            const colorData = new Uint8ClampedArray(tile.data.length * 4).fill(255);

            for (let i = 0; i < tile.data.length; i++) {
                const sv = tile.data[i];
                const color = new THREE.Color(colorScale(sv));
                colorData[i * 4 + 0] = Math.round(color.r * 255);
                colorData[i * 4 + 1] = Math.round(color.g * 255);
                colorData[i * 4 + 2] = Math.round(color.b * 255);
                colorData[i * 4 + 3] = 255; // Alpha channel
            }

            const dataTexture = new THREE.DataTexture(colorData, 256, 256, THREE.RGBAFormat, THREE.UnsignedByteType);
            dataTexture.flipY = true;
            dataTexture.needsUpdate = true;

            setTexture(dataTexture);
        }

        makeTile();
    }, [])

    return (
        <mesh
            {...props}
            ref={meshRef}>
            <planeGeometry args={[1, 1]} />
            {texture && <meshStandardMaterial map={texture} />}
        </mesh>
    )
}

const Echofish = () => {
    return (
        // This is an R3F canvas that allows for higher-level rendering
        // Without this, the implementation would be twice as long
        <Canvas
            style={{ width: '100vw', height: '100vh' }}>
            {/* Some lighting */}
            <ambientLight intensity={Math.PI / 2} />
            <Plane position={[0, 0, 0]} />
            {/* Enables panning and zooming on the box */}
            <MapControls
                makeDefault
                enableRotate={false}
                minDistance={0.25}
                maxDistance={10}
                maxPolarAngle={Math.PI / 2}
                screenSpacePanning={true}
            />
        </Canvas>
    )
}

export default Echofish
