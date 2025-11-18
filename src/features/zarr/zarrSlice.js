import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchStoreShape } from "./zarrApi";

const initialState = {
    shipName: "Henry_B._Bigelow",
    cruiseName: "HB1906",
    sensorName: "EK60",
    storeShape: null,
    storeShapeStatus: "idle",
}

// Get the property from the zarr reducer
export const selectStoreShape = (state) => state.zarr.storeShape

// Eventually there will be a thunk for each property that needs to be accessed
// The thunks are separate from the Api in order to make each section more readable
export const storeShapeAsync = createAsyncThunk(
    "zarr/fetchStoreShape",
    async ({ ship, cruise, sensor }) => {
        const response = fetchStoreShape(ship, cruise, sensor)
        return response
    }
)

export const zarrSlice = createSlice({
    name: "zarr",
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder.addCase(storeShapeAsync.pending, state => {
            state.storeShapeStatus = "loading"
        }).addCase(storeShapeAsync.fulfilled, (state, action) => {
            state.storeShapeStatus = "idle"
            state.storeShape = action.payload
        }).addCase(storeShapeAsync.rejected, state => {
            state.storeShapeStatus = "failed"
        })
    }
})

export default zarrSlice.reducer
