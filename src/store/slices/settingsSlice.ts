import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { GlobalSettings, AmazonCredentials } from '../../types';
import { supabase } from '../../services/supabase';

interface SettingsState {
  globalSettings: GlobalSettings | null;
  amazonCredentials: AmazonCredentials | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  globalSettings: null,
  amazonCredentials: null,
  isLoading: false,
  error: null,
};

export const fetchGlobalSettings = createAsyncThunk(
  'settings/fetchGlobalSettings',
  async (userId: string) => {
    const { data, error } = await supabase
      .from('global_settings')
      .select('*')
      .eq('userId', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 means no rows found
    return data as GlobalSettings | null;
  }
);

export const updateGlobalSettings = createAsyncThunk(
  'settings/updateGlobalSettings',
  async ({ userId, settings }: { userId: string; settings: Partial<GlobalSettings> }) => {
    const { data: existing } = await supabase
      .from('global_settings')
      .select('id')
      .eq('userId', userId)
      .single();

    let result;
    if (existing) {
      // Update existing settings
      result = await supabase
        .from('global_settings')
        .update({ ...settings, updatedAt: new Date().toISOString() })
        .eq('userId', userId)
        .select()
        .single();
    } else {
      // Create new settings
      result = await supabase
        .from('global_settings')
        .insert([{ ...settings, userId }])
        .select()
        .single();
    }

    if (result.error) throw result.error;
    return result.data as GlobalSettings;
  }
);

export const fetchAmazonCredentials = createAsyncThunk(
  'settings/fetchAmazonCredentials',
  async (userId: string) => {
    const { data, error } = await supabase
      .from('amazon_credentials')
      .select('*')
      .eq('userId', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data as AmazonCredentials | null;
  }
);

export const saveAmazonCredentials = createAsyncThunk(
  'settings/saveAmazonCredentials',
  async ({ userId, credentials }: { userId: string; credentials: Partial<AmazonCredentials> }) => {
    const { data: existing } = await supabase
      .from('amazon_credentials')
      .select('id')
      .eq('userId', userId)
      .single();

    let result;
    if (existing) {
      // Update existing credentials
      result = await supabase
        .from('amazon_credentials')
        .update({ ...credentials, updatedAt: new Date().toISOString() })
        .eq('userId', userId)
        .select()
        .single();
    } else {
      // Create new credentials
      result = await supabase
        .from('amazon_credentials')
        .insert([{ ...credentials, userId }])
        .select()
        .single();
    }

    if (result.error) throw result.error;
    return result.data as AmazonCredentials;
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateLocalSettings: (state, action: PayloadAction<Partial<GlobalSettings>>) => {
      if (state.globalSettings) {
        state.globalSettings = { ...state.globalSettings, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch global settings
    builder
      .addCase(fetchGlobalSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGlobalSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.globalSettings = action.payload;
      })
      .addCase(fetchGlobalSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch settings';
      });

    // Update global settings
    builder
      .addCase(updateGlobalSettings.fulfilled, (state, action) => {
        state.globalSettings = action.payload;
      });

    // Fetch Amazon credentials
    builder
      .addCase(fetchAmazonCredentials.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAmazonCredentials.fulfilled, (state, action) => {
        state.isLoading = false;
        state.amazonCredentials = action.payload;
      })
      .addCase(fetchAmazonCredentials.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch Amazon credentials';
      });

    // Save Amazon credentials
    builder
      .addCase(saveAmazonCredentials.fulfilled, (state, action) => {
        state.amazonCredentials = action.payload;
      });
  },
});

export const { clearError, updateLocalSettings } = settingsSlice.actions;
export default settingsSlice.reducer;