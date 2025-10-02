import * as zarr from 'zarrita'
import { get } from '@zarrita/ndarray'
import { slice } from 'zarrita'

async function get_store(url) {
    return zarr.withConsolidated(new zarr.FetchStore(url))
        .then((storePromise) => {
            return zarr.open.v2(storePromise, { kind: "group" });
        })
        .then((rootPromise) => {
            return zarr.open(rootPromise.resolve("Sv"), { kind: "array" });
        })
        .then((svArray) => {
            return get(svArray, [slice(0, 512), slice(0, 512), 1]);
        });
}

function Zarrita() {
    console.log(get_store("https://noaa-wcsd-zarr-pds.s3.amazonaws.com/level_2/Henry_B._Bigelow/HB1906/EK60/HB1906.zarr/"))
    return (
        <div></div>
    )
}

export default Zarrita
