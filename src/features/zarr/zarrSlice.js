import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
    shipName: "Henry_B._Bigelow",
    cruiseName: "HB1906",
    sensorName: "EK60",
    storeShape: null,
    storeShapeStatus: "idle",
}

const storeShapeAsync = createAsyncThunk(

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
