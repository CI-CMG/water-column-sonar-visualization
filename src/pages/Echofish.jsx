import { useRef, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as THREE from 'three'
import { scaleSequential } from 'd3-scale'
import { interpolateTurbo } from 'd3-scale-chromatic'
import { Canvas, useFrame } from '@react-three/fiber'
import { MapControls } from '@react-three/drei'
import { fetchSvTile } from '../features/store/storeApi'
import { selectStoreShape, storeShapeAsync } from '../features/store/storeSlice.js'
import '../App.css'

const Tile = ({ coords, tileSize, storeShape, ...props }) => {
    const meshRef = useRef(null);
    const [texture, setTexture] = useState(null);

    useEffect(() => {
        const makeTile = async () => {
            const ship = "Henry_B._Bigelow"
            const cruise = "HB1906"
            const sensor = "EK60"

            const dataDimension = storeShape;

            const maxBoundsValue =
                [[-1 * Math.ceil(dataDimension[0] / tileSize) * tileSize, 0], [0, Math.ceil(dataDimension[1] / tileSize) * tileSize]];
            const maxTileBoundsX = Math.abs(maxBoundsValue[1][1]) / tileSize;
            const maxTileBoundsY = Math.abs(maxBoundsValue[0][0]) / tileSize;

            // TODO: Do something when we go beyond the edge of the data
            if (coords.y < 0 || coords.y >= maxTileBoundsY || coords.x < 0 || coords.x >= maxTileBoundsX) return (<></>)

            const maxBoundsY = Math.abs(dataDimension[0]);
            const maxBoundsX = Math.abs(dataDimension[1]);

            const indicesLeft = tileSize * coords.x;
            const indicesRight = Math.min(tileSize * coords.x + tileSize, maxBoundsX);
            const indicesTop = tileSize * coords.y;
            const indicesBottom = Math.min(tileSize * coords.y + tileSize, maxBoundsY);

            // FIX: This occasionally tries to fetch data that does not exist
            // and loads the entire dataset at once instead of by tile
            const initTile = await fetchSvTile(
                ship,
                cruise,
                sensor,
                indicesTop,
                indicesBottom,
                indicesLeft,
                indicesRight
            )
            const tile = initTile;

            const [width, height] = tile.shape;

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
            }

            const dataTexture = new THREE.DataTexture(colorData, width, height, THREE.RGBAFormat, THREE.UnsignedByteType);

            // WARN: This is deprecated?
            dataTexture.flipY = true;

            dataTexture.needsUpdate = true;

            setTexture(dataTexture);
            return;
        }

        makeTile();
    }, [coords, tileSize]);

    return (
        <mesh
            {...props}
            position={[coords.x, coords.y, 0]}
            ref={meshRef}>
            <planeGeometry args={[1, 1]} />
            {texture && <meshStandardMaterial map={texture} />}
        </mesh>
    )
}

const TileMap = () => {
    const [visibleKeys, setVisibleKeys] = useState([]);
    const tiles = useRef(new Map());
    const dispatch = useDispatch();

    const storeShape = useSelector(selectStoreShape);

    useEffect(() => {
        // Temporary values
        const ship = "Henry_B._Bigelow"
        const cruise = "HB1906"
        const sensor = "EK60"
        // Dispatch the thunk call so it goes through the store
        dispatch(storeShapeAsync({ ship, cruise, sensor }))
    }, [dispatch])

    useFrame(({ camera, viewport }) => {
        if (!storeShape) return

        const left = camera.position.x - viewport.width / 2;
        const right = camera.position.x + viewport.width / 2;
        const bottom = camera.position.y - viewport.height / 2;
        const top = camera.position.y + viewport.height / 2;

        const TILE_PADDING = 0;
        const minX = Math.floor(left) - TILE_PADDING;
        const maxX = Math.floor(right) + TILE_PADDING;
        const minY = Math.floor(bottom) - TILE_PADDING;
        const maxY = Math.floor(top) + TILE_PADDING;

        const newVisibleKeys = [];
        for (let x = minX; x < maxX; x++) {
            for (let y = minY; y < maxY; y++) {
                // HACK: Store the key as a 32-bit number where the first
                // 16 bits are the x and the second 16 are the y. The next best
                // solution is to use a string, which does not have overflow
                // problems but is significantly less space efficient
                const key = (x << 16) | (y & 0xffff);
                newVisibleKeys.push(key);
            }
        }
        setVisibleKeys(newVisibleKeys);
    })

    visibleKeys.forEach(key => {
        if (!tiles.current.has(key)) {
            // Decode the key for the coordinates
            const x = key >> 16;
            const y = key & 0xffff;
            tiles.current.set(key, (<Tile
                key={key}
                coords={{ x, y }}
                tileSize={256}
                storeShape={storeShape}
            />))
        }
    })

    return (
        <>{Array.from(tiles.current.values())}</>
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
            <TileMap />
            {/* Enables panning and zooming on the box */}
            <MapControls
                makeDefault
                enableRotate={false}
                minDistance={0.125}
                maxDistance={1}
                maxPolarAngle={Math.PI / 2}
                screenSpacePanning={true}
            />
        </Canvas>
    )
}

export default Echofish
