import * as zarr from 'zarrita'

export const fetchStoreShape = (ship, cruise, sensor) => {
    // Interpolate the base url with the actual thing we want to grab
    const url =
        `https://noaa-wcsd-zarr-pds.s3.amazonaws.com/level_2/${ship}/${cruise}/${sensor}/${cruise}.zarr/`

    // This big promise chain fetches the zarr store at the given url and then unwraps it to get the data we want
    // Each one will be slightly different, so the code can't really be reused
    return zarr.withConsolidated(new zarr.FetchStore(url)).then((storePromise) => {
        const zarrGroup = zarr.open.v2(storePromise, { kind: "group" })
        return zarrGroup
    }).then((rootPromise) => {
        // Here the root store's promise is resolved and we tell it what data we want to resolve
        const svArray = zarr.open(rootPromise.resolve("Sv"), { kind: "array" })
        return svArray
    }).then((svArray) => {
        // This fetcher gets the store's shape
        // A new one will have to be created for each property to be fetched
        return svArray.shape
    })
}
