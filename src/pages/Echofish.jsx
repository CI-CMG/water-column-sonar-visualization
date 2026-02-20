import { useRef, useEffect, useState, use } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as THREE from 'three'
import { scaleSequential } from 'd3-scale'
import { interpolateTurbo } from 'd3-scale-chromatic'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { MapControls } from '@react-three/drei'
import { fetchSvTile } from '../features/store/storeApi'
import { selectStoreShape, storeShapeAsync } from '../features/store/storeSlice.js'

const fetchTexture = async (coords, tileSize, storeShape) => {
    const ship = "Henry_B._Bigelow"
    const cruise = "HB1906"
    const sensor = "EK60"

    const dataDimension = storeShape;

    const maxBoundsValue =
        [[-1 * Math.ceil(dataDimension[0] / tileSize) * tileSize, 0], [0, Math.ceil(dataDimension[1] / tileSize) * tileSize]];
    const maxTileBoundsX = Math.abs(maxBoundsValue[1][1]) / tileSize;
    const maxTileBoundsY = Math.abs(maxBoundsValue[0][0]) / tileSize;

    // Check bounds prior to the fetch
    if (coords.y < 0 || coords.y >= maxTileBoundsY || coords.x < 0 || coords.x >= maxTileBoundsX) {
        return null;
    }

    const maxBoundsY = Math.abs(dataDimension[0]);
    const maxBoundsX = Math.abs(dataDimension[1]);

    const indicesLeft = tileSize * coords.x;
    const indicesRight = Math.min(tileSize * coords.x + tileSize, maxBoundsX);
    const indicesTop = tileSize * coords.y;
    const indicesBottom = Math.min(tileSize * coords.y + tileSize, maxBoundsY);

    // FIX: This occasionally tries to fetch data that does not exist
    const initTile = await fetchSvTile(
        ship,
        cruise,
        sensor,
        indicesTop,
        indicesBottom,
        indicesLeft,
        indicesRight
    )

    if (!initTile || !initTile.data) {
        return null;
    }
    
    const tile = initTile;

    const [width, height] = tile.shape;

    // Maps the SV points to a d3 scale
    const colorScale = scaleSequential(interpolateTurbo).domain([-100, 0]);
    // This array stores each byte of color separately as RGBA
    const colorData = new Uint8ClampedArray(tile.data.length * 4).fill(255);
    try {
        for (let i = 0; i < tile.data.length; i++) {
            const sv = tile.data[i];
            if (sv === 0) {
                colorData[i * 4 + 0] = 0;
                colorData[i * 4 + 1] = 0;
                colorData[i * 4 + 2] = 0;
                colorData[i * 4 + 3] = 225;
            } else {
                const color = new THREE.Color(colorScale(sv));
                colorData[i * 4 + 0] = Math.round(color.r * 255);
                colorData[i * 4 + 1] = Math.round(color.g * 255);
                colorData[i * 4 + 2] = Math.round(color.b * 255);
                colorData[i * 4 + 3] = 255;
            }
        }

        const dataTexture = new THREE.DataTexture(
            colorData, 
            width, 
            height, 
            THREE.RGBAFormat, 
            THREE.UnsignedByteType
        );

        dataTexture.needsUpdate = true;
        dataTexture.minFilter = THREE.LinearFilter;
        dataTexture.magFilter = THREE.LinearFilter;

        console.log(`Fetched tile at coords (${coords.x}, ${coords.y}) with bounds [${indicesLeft}, ${indicesRight}] x [${indicesTop}, ${indicesBottom}]`);
        return dataTexture;
    } catch (error) {
        if (!error.message?.includes("404")) {
            console.error(`Error tile ${coords.x}, ${coords.y}:`, error);
        }
        return null;
    }
}

const Tile = ({ coords, dataTexture, ...props }) => {
    const meshRef = useRef();
    const materialRef = useRef();

    useEffect(() => {
        if (!meshRef.current) return;
        meshRef.current.position.set(coords.x, coords.y, 0);
    }, [coords])

    useEffect(() => {
        if (!materialRef.current) return;

        if (dataTexture) {
            materialRef.current.map = dataTexture;
            materialRef.current.needsUpdate = true;
        }
    }, [dataTexture])

    return (
        <mesh ref={meshRef} {...props}>
            <planeGeometry args={[1, 1]} />
            <meshStandardMaterial ref={materialRef} />
        </mesh>
    )
}

const TileMap = () => {
    const textures = useRef(new Map());
    const activeTiles = useRef(new Set());
    const fetchingTiles = useRef(new Set());
    const failedTiles = useRef(new Set());
    const fetchQueue = useRef([]); // Queue to manage fetches when there are too many concurrent ones-- throws an insufficient resources error if too many fetches are attempted at once.
    const [visibleTiles, setVisibleTiles] = useState([]);
    const [, setForceUpdate] = useState(0); // State to force re-render when textures update
    const dispatch = useDispatch();
    const lastBoundsRef = useRef(null);
    const isProcessingQueue = useRef(false);

    const storeShape = useSelector(selectStoreShape);

    const MAX_CONCURRENT_FETCHES = 5; // The lower, the slower it loads. The higher, the faster it loads but the more likely it is to throw an insufficient resources error. 

    useEffect(() => {
        // Temporary values
        const ship = "Henry_B._Bigelow"
        const cruise = "HB1906"
        const sensor = "EK60"
        // Dispatch the thunk call so it goes through the store
        dispatch(storeShapeAsync({ ship, cruise, sensor }))
    }, [dispatch]);

    // Log bounds on load
    useEffect(() => {
        if (storeShape) {
            const tileSize = 256;
            const maxTilesX = Math.ceil(storeShape[1] / tileSize);
            const maxTilesY = Math.ceil(storeShape[0] / tileSize);
            console.log(`Store shape: [${storeShape[0]}, ${storeShape[1]}]`);
            console.log(`Tile/World bounds: [0 to ${maxTilesX}] x [0 to ${maxTilesY}]`);
        }
    }, [storeShape]);

    // Cleaning up old textures that aren't in use anymore
    useEffect(() => {
        if (storeShape) {
            console.log(`Store shape: [${storeShape[0]}, ${storeShape[1]}]`);
            console.log(`Tile bounds: [0 to ${Math.ceil(storeShape[0] / 256)}] x [0 to ${Math.ceil(storeShape[1] / 256)}]`);
        }
    }, [storeShape]);

    // Process the fetching in batches
    const processFetchQueue = async () => {
        if (isProcessingQueue.current || !storeShape) return;
        if (fetchQueue.current.length === 0) return;

        isProcessingQueue.current = true;

        while (fetchQueue.current.length > 0) {
            const batch = fetchQueue.current.splice(0, MAX_CONCURRENT_FETCHES);

            const batchPromises = batch.map(async (tile) => {
                if (textures.current.has(tile.key) ||
                    fetchingTiles.current.has(tile.key) ||
                    failedTiles.current.has(tile.key)) {
                    return;
                }

                fetchingTiles.current.add(tile.key);
                try {
                    const texture = await fetchTexture(tile.coords, 256, storeShape);

                    if (texture) {
                        textures.current.set(tile.key, texture);
                        activeTiles.current.add(tile.key);
                    } else {
                        failedTiles.current.add(tile.key);
                    }
                } catch (error) {
                    console.error("Error fetching texture:", error);
                    failedTiles.current.add(tile.key);
                } finally {
                    fetchingTiles.current.delete(tile.key);
                }
            });

            await Promise.all(batchPromises);
            setForceUpdate(prev => prev + 1); // Force update after each batch
            await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between batches to prevent overwhelming the server
        }

        isProcessingQueue.current = false;
        console.log(`Loaded: ${textures.current.size}, Failed: ${failedTiles.current.size}`);
    };

    useEffect(() => {
        const currentKeys = new Set(visibleTiles.map(tile => tile.key));

        const texturesToRemove = [];
        textures.current.forEach((value, key) => {
            if (!currentKeys.has(key)) {
                texturesToRemove.push(key);
            }
        });

        texturesToRemove.forEach(key => {
            const texture = textures.current.get(key);
            if (texture && texture.dispose) {
                texture.dispose();
            }
            textures.current.delete(key);
            activeTiles.current.delete(key);
        });
    }, [visibleTiles]);

    // Complete clean up on unmount
    useEffect(() => {
        return () => {
            textures.current.forEach(texture => {
                if (texture && texture.dispose) {
                    texture.dispose();
                }            
            });
            textures.current.clear();
        };
    }, []);

    useEffect(() => {
        if (!storeShape) return;

        const tilesToFetch = visibleTiles.filter(tile => 
            !textures.current.has(tile.key) &&
            !fetchingTiles.current.has(tile.key) &&
            !failedTiles.current.has(tile.key)
        );

        if (tilesToFetch.length === 0) return;

        const centerX = visibleTiles.reduce((sum, tile) => sum + tile.coords.x, 0) / visibleTiles.length;
        const centerY = visibleTiles.reduce((sum, tile) => sum + tile.coords.y, 0) / visibleTiles.length;

        tilesToFetch.sort((a, b) => {
            const distA = Math.hypot(a.coords.x - centerX, a.coords.y - centerY);
            const distB = Math.hypot(b.coords.x - centerX, b.coords.y - centerY);
            return distA - distB;
        });

        fetchQueue.current.push(...tilesToFetch);
        processFetchQueue();
    }, [visibleTiles, storeShape]);

    // Updating the tiles based on viewport
    useFrame(({ camera, viewport }) => {
        const left = camera.position.x - viewport.width / 2;
        const right = camera.position.x + viewport.width / 2;
        const bottom = camera.position.y - viewport.height / 2;
        const top = camera.position.y + viewport.height / 2;

        const TILE_PADDING = 1;
        const minX = Math.floor(left) - TILE_PADDING;
        const maxX = Math.floor(right) + TILE_PADDING;
        const minY = Math.floor(bottom) - TILE_PADDING;
        const maxY = Math.floor(top) + TILE_PADDING;

        const newBounds = `${minX},${maxX},${minY},${maxY}`;

        if (newBounds !== lastBoundsRef.current) {
            lastBoundsRef.current = newBounds;

            const newVisibleTiles = [];
            const newActiveTiles = new Set();

            for (let x = minX; x < maxX; x++) {
                for (let y = minY; y < maxY; y++) {
                    const key = `${x},${y}`;
                    newVisibleTiles.push({ key, coords: { x, y } });
                    newActiveTiles.add(key);
                }
            }

            activeTiles.current = newActiveTiles;
            setVisibleTiles(newVisibleTiles);
            }

            });

            return (
                <>
                    {visibleTiles.map(tile => {
                    const texture = textures.current.get(tile.key);
                    return (
                    <Tile 
                        key={tile.key} 
                        coords={tile.coords} 
                        dataTexture={texture} 
                    />
                );
            })}
        </>
    )
}
            

const Echofish = () => {
    return (
        // This is an R3F canvas that allows for higher-level rendering
        // Without this, the implementation would be twice as long
        <Canvas
            style={{ width: '100vw', height: '100vh' }}
            // Flip the camera upside down to make it render the data rightside up
            camera={{ up: [0, -1, 0], position: [0, 0, 0.75] }}
        >
            {/* Some lighting */}
            <ambientLight intensity={Math.PI / 2} />
            <TileMap />
            {/* Enables panning and zooming on the box */}
            <MapControls
                makeDefault
                enableRotate={false}
                minDistance={0.125}
                maxDistance={10}
                minPolarAngle={Math.PI / 2}
                maxPolarAngle={Math.PI / 2}
                screenSpacePanning={true}
            />
        </Canvas>
    )
}

export default Echofish
