import { useSelector, useDispatch } from "react-redux";
import { decrement, increment, incrementAsync, incrementByAmount } from "./counterSlice";
import { useState } from "react";

export default function Counter() {
    // useSelector defines a function to fetch the value
    const count = useSelector((state) => state.counter.value)
    // useDispatch allows for the ability to "dispatch" functions to the store
    const dispatch = useDispatch()
    const [incrementAmount, setIncrementAmount] = useState('2')

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex' }}>
                <button onClick={() => { dispatch(increment()) }}>+</button>
                <div>{count}</div>
                <button onClick={() => { dispatch(decrement()) }}>-</button>
            </div>
            <div style={{ display: 'flex' }}>
                <input value={incrementAmount} type="number" onChange={e => setIncrementAmount(e.target.value)} />
                <button onClick={() => { dispatch(incrementByAmount(Number(incrementAmount))) }}>Increment By Amount</button>
                <button onClick={() => { dispatch(incrementAsync(Number(incrementAmount))) }}>Increment Async</button>
            </div>
        </div>
    )
}
