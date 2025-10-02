import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { residentService } from '@services/resident.service';
import { Resident, ResidentFormData } from 'types/resident.types';
import { SearchParams } from 'types/common.types';

interface ResidentState {
  residents: Resident[];
  selectedResident: Resident | null;
  loading: boolean;
  error: string | null;
  totalElements: number;
  totalPages: number;
}

const initialState: ResidentState = {
  residents: [],
  selectedResident: null,
  loading: false,
  error: null,
  totalElements: 0,
  totalPages: 0,
};

export const fetchResidents = createAsyncThunk(
  'resident/fetchAll',
  async (params: SearchParams) => {
    const response = await residentService.getAll(params);
    return response;
  }
);

export const fetchResidentById = createAsyncThunk(
  'resident/fetchById',
  async (id: number) => {
    const response = await residentService.getById(id);
    return response;
  }
);

const residentSlice = createSlice({
  name: 'resident',
  initialState,
  reducers: {}
});

export default residentSlice.reducer;