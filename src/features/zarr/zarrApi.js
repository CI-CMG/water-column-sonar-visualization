import * as zarr from 'zarrita'

export const fetchStoreShape = (ship, cruise, sensor) => {
    const url = `https://noaa-wcsd-zarr-pds.s3.amazonaws.com/level_2/${ship}/${cruise}/${sensor}/${cruise}.zarr/`

    return zarr.withConsolidated(new zarr.FetchStore(url)).then((storePromise) => {
        const zarrGroup = zarr.open.v2(storePromise, { kind: "group" })
        return zarrGroup
    }).then((rootPromise) => {
        const svArray = zarr.open(rootPromise.resolve("Sv"), { kind: "array" })
        return svArray
    }).then((svArray) => {
        return svArray.shape
    })
}
