import { useDispatch, useSelector } from 'react-redux'
import { selectStoreShape, storeShapeAsync } from '../features/zarr/zarrSlice'
import { useEffect } from 'react'

function Zarrita() {
    const dispatch = useDispatch()

    const storeShape = useSelector(selectStoreShape)

    useEffect(() => {
        // Temporary values
        const ship = "Henry_B._Bigelow"
        const cruise = "HB1906"
        const sensor = "EK60"
        dispatch(storeShapeAsync({ ship, cruise, sensor }))
    }, [dispatch])

    return (
        <div>{storeShape}</div>
    )
}

export default Zarrita
