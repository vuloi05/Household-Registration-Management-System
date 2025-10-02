import { createSlice } from '@reduxjs/toolkit';

interface FeeState {
	fees: any[];
	loading: boolean;
	error: string | null;
}

const initialState: FeeState = {
	fees: [],
	loading: false,
	error: null,
};

const feeSlice = createSlice({
	name: 'fee',
	initialState,
	reducers: {}
});

export default feeSlice.reducer;
