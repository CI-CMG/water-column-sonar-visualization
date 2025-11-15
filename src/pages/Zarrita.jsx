import { useDispatch, useSelector } from 'react-redux'
import { selectStoreShape, storeShapeAsync } from '../features/zarr/zarrSlice'
import { useEffect } from 'react'

function Zarrita() {
    const dispatch = useDispatch()

    const storeShape = useSelector(selectStoreShape)

    useEffect(() => {
        dispatch(storeShapeAsync())
    }, [dispatch])

    return (
        <div>{storeShape}</div>
    )
}

export default Zarrita
