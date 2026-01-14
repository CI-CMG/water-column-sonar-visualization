import * as zarr from 'zarrita'

export const fetchStoreShape = async (ship, cruise, sensor) => {
    // Interpolate the base url with the actual thing we want to grab
    const url =
        `https://noaa-wcsd-zarr-pds.s3.amazonaws.com/level_5/${ship}/${cruise}/${sensor}/${cruise}_resampled.zarr/level_0`

    // This big promise chain fetches the zarr store at the given url and then unwraps it to get the data we want
    // Each one will be slightly different, so the code can't really be reused
    const root = zarr.root(new zarr.FetchStore(url))

    const arr = await zarr.open.v3(root.resolve("Sv"), { kind: 'array' })
    return arr.shape
}

export const fetchStoreAttributes = async (ship, cruise, sensor) => {
    const url =
        `https://noaa-wcsd-zarr-pds.s3.amazonaws.com/level_5/${ship}/${cruise}/${sensor}/${cruise}_resampled.zarr/level_0`;

    const root = zarr.root(new zarr.FetchStore(url))

    const rootPromise = await zarr.open.v3(root, { kind: 'group' })
    return rootPromise.attrs
}

export const fetchSv = async (ship, cruise, sensor, indexDepth, indexTime) => {
    const url =
        `https://noaa-wcsd-zarr-pds.s3.amazonaws.com/level_5/${ship}/${cruise}/${sensor}/${cruise}_resampled.zarr/level_0`;
    const root = zarr.root(new zarr.FetchStore(url));

    const arr = await zarr.open.v3(root.resolve("Sv"), { kind: "array" })
    return zarr.get(arr, [indexDepth, indexTime])
};

export const fetchSvTile = async (ship, cruise, sensor, indexTop, indexBottom, indexLeft, indexRight) => {
    const url =
        `https://noaa-wcsd-zarr-pds.s3.amazonaws.com/level_5/${ship}/${cruise}/${sensor}/${cruise}_resampled.zarr/level_0`;
    const root = zarr.root(new zarr.FetchStore(url));

    const arr = await zarr.open.v3(root.resolve("Sv"), { kind: "array" })
    return zarr.get(arr, [zarr.slice(indexTop, indexBottom), zarr.slice(indexLeft, indexRight)])
}

export const fetchDepth = async (ship, cruise, sensor, indexDepth) => {
    const url =
        `https://noaa-wcsd-zarr-pds.s3.amazonaws.com/level_5/${ship}/${cruise}/${sensor}/${cruise}_resampled.zarr/level_0`;

    const root = zarr.root(new zarr.FetchStore(url))

    const arr = await zarr.open.v3(root.resolve("depth"), { kind: 'array' })
    return zarr.get(arr, [indexDepth])
}

export const fetchDepthArray = async (ship, cruise, sensor) => {
    const url =
        `https://noaa-wcsd-zarr-pds.s3.amazonaws.com/level_5/${ship}/${cruise}/${sensor}/${cruise}_resampled.zarr/level_0`;

    const root = zarr.root(new zarr.FetchStore(url))

    const arr = await zarr.open.v3(root.resolve("depth"), { kind: 'array' })
    return zarr.get(arr, [zarr.slice(null)])
}
