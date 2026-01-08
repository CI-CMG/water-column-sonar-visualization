import { useDispatch, useSelector } from 'react-redux'
import { selectStoreShape, storeShapeAsync } from '../features/store/storeSlice'
import { useEffect } from 'react'

function Zarrita() {
    const dispatch = useDispatch()

    // The selector hooks into the specific piece of data and watches it for changes
    const storeShape = useSelector(selectStoreShape)

    useEffect(() => {
        // Temporary values
        const ship = "Henry_B._Bigelow"
        const cruise = "HB1906"
        const sensor = "EK60"
        // Dispatch the thunk call so it goes through the store
        dispatch(storeShapeAsync({ ship, cruise, sensor }))
    }, [dispatch])

    // Right now, we're just displaying the store shape, although we will be rendering it with ThreeJS
    return (
        <div>{storeShape}</div>
    )
}

export default Zarrita
