import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/config/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatbotState {
  messages: Message[];
  loading: boolean;
  error: string | null;
}

const initialState: ChatbotState = {
  messages: [],
  loading: false,
  error: null,
};

export const sendMessage = createAsyncThunk(
  'chatbot/sendMessage',
  async (message: string) => {
    const response = await api.post('/chatbot', { message });
    return response.data;
  }
);

const chatbotSlice = createSlice({
  name: 'chatbot',
  initialState,
  reducers: {
    addUserMessage: (state, action: PayloadAction<string>) => {
      state.messages.push({
        role: 'user',
        content: action.payload,
      });
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action: PayloadAction<{ response: string }>) => {
        state.loading = false;
        state.messages.push({
          role: 'assistant',
          content: action.payload.response,
        });
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to send message';
      });
  },
});

export const { addUserMessage, clearMessages, clearError } = chatbotSlice.actions;
export default chatbotSlice.reducer;
