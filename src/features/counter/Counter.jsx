import { useSelector, useDispatch } from "react-redux";
import { decrement, increment } from "./counterSlice";

export default function Counter() {
    const count = useSelector((state) => state.counter.value)
    const dispatch = useDispatch()

    return (
        <div style={{ display: 'flex' }}>
            <button onClick={() => { dispatch(increment()) }}>+</button>
            <div>{count}</div>
            <button onClick={() => { dispatch(decrement()) }}>-</button>
        </div>
    )
}
