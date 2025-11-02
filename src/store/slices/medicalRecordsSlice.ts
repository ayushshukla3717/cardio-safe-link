import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/config/api';

interface MedicalRecord {
  id: string;
  title: string;
  fileUrl: string;
  uploadedAt: string;
}

interface MedicalRecordsState {
  records: MedicalRecord[];
  loading: boolean;
  error: string | null;
}

const initialState: MedicalRecordsState = {
  records: [],
  loading: false,
  error: null,
};

export const fetchMedicalRecords = createAsyncThunk(
  'medicalRecords/fetch',
  async () => {
    const response = await api.get('/medical-records');
    return response.data;
  }
);

export const uploadMedicalRecord = createAsyncThunk(
  'medicalRecords/upload',
  async ({ file, title }: { file: File; title: string }) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    
    const response = await api.post('/medical-records/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
);

export const deleteMedicalRecord = createAsyncThunk(
  'medicalRecords/delete',
  async (id: string) => {
    await api.delete(`/medical-records/${id}`);
    return id;
  }
);

const medicalRecordsSlice = createSlice({
  name: 'medicalRecords',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMedicalRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMedicalRecords.fulfilled, (state, action: PayloadAction<MedicalRecord[]>) => {
        state.loading = false;
        state.records = action.payload;
      })
      .addCase(fetchMedicalRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch records';
      })
      .addCase(uploadMedicalRecord.fulfilled, (state, action: PayloadAction<MedicalRecord>) => {
        state.records.unshift(action.payload);
      })
      .addCase(deleteMedicalRecord.fulfilled, (state, action: PayloadAction<string>) => {
        state.records = state.records.filter(record => record.id !== action.payload);
      });
  },
});

export const { clearError } = medicalRecordsSlice.actions;
export default medicalRecordsSlice.reducer;
