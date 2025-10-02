import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { householdService } from '@services/household.service';
import { Household, HouseholdFormData } from 'types/household.types';
import { PaginatedResponse, SearchParams } from 'types/common.types';

interface HouseholdState {
  households: Household[];
  selectedHousehold: Household | null;
  loading: boolean;
  error: string | null;
  totalElements: number;
  totalPages: number;
}

const initialState: HouseholdState = {
  households: [],
  selectedHousehold: null,
  loading: false,
  error: null,
  totalElements: 0,
  totalPages: 0,
};

export const fetchHouseholds = createAsyncThunk(
  'household/fetchAll',
  async (params: SearchParams) => {
    const response = await householdService.getAll(params);
    return response;
  }
);

export const fetchHouseholdById = createAsyncThunk(
  'household/fetchById',
  async (id: number) => {
    const response = await householdService.getById(id);
    return response;
  }
);

export const createHousehold = createAsyncThunk(
  'household/create',
  async (data: HouseholdFormData) => {
    const response = await householdService.create(data);
    return response;
  }
);

export const updateHousehold = createAsyncThunk(
  'household/update',
  async ({ id, data }: { id: number; data: Partial<HouseholdFormData> }) => {
    const response = await householdService.update(id, data);
    return response;
  }
);

export const deleteHousehold = createAsyncThunk(
  'household/delete',
  async (id: number) => {
    await householdService.delete(id);
    return id;
  }
);

const householdSlice = createSlice({
  name: 'household',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedHousehold: (state, action: PayloadAction<Household | null>) => {
      state.selectedHousehold = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch households
      .addCase(fetchHouseholds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHouseholds.fulfilled, (state, action) => {
        state.loading = false;
        state.households = action.payload.content;
        state.totalElements = action.payload.totalElements;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchHouseholds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch households';
      })
      // Fetch by ID
      .addCase(fetchHouseholdById.fulfilled, (state, action) => {
        state.selectedHousehold = action.payload;
      })
      // Create
      .addCase(createHousehold.fulfilled, (state, action) => {
        state.households.unshift(action.payload);
        state.totalElements += 1;
      })
      // Update
      .addCase(updateHousehold.fulfilled, (state, action) => {
        const index = state.households.findIndex(h => h.id === action.payload.id);
        if (index !== -1) {
          state.households[index] = action.payload;
        }
        if (state.selectedHousehold?.id === action.payload.id) {
          state.selectedHousehold = action.payload;
        }
      })
      // Delete
      .addCase(deleteHousehold.fulfilled, (state, action) => {
        state.households = state.households.filter(h => h.id !== action.payload);
        state.totalElements -= 1;
      });
  },
});

export const { clearError, setSelectedHousehold } = householdSlice.actions;
export default householdSlice.reducer;