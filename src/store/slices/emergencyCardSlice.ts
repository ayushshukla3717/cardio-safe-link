import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/config/api';

interface EmergencyCard {
  id?: string;
  fullName: string;
  bloodType: string;
  allergies: string;
  medications: string;
  emergencyContact: string;
  medicalConditions: string;
  qrCode?: string;
}

interface EmergencyCardState {
  card: EmergencyCard | null;
  loading: boolean;
  error: string | null;
}

const initialState: EmergencyCardState = {
  card: null,
  loading: false,
  error: null,
};

export const fetchEmergencyCard = createAsyncThunk(
  'emergencyCard/fetch',
  async () => {
    const response = await api.get('/emergency-card');
    return response.data;
  }
);

export const saveEmergencyCard = createAsyncThunk(
  'emergencyCard/save',
  async (cardData: EmergencyCard) => {
    const response = await api.post('/emergency-card', cardData);
    return response.data;
  }
);

const emergencyCardSlice = createSlice({
  name: 'emergencyCard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmergencyCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmergencyCard.fulfilled, (state, action: PayloadAction<EmergencyCard>) => {
        state.loading = false;
        state.card = action.payload;
      })
      .addCase(fetchEmergencyCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch emergency card';
      })
      .addCase(saveEmergencyCard.fulfilled, (state, action: PayloadAction<EmergencyCard>) => {
        state.card = action.payload;
      });
  },
});

export const { clearError } = emergencyCardSlice.actions;
export default emergencyCardSlice.reducer;
