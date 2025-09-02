import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Shipment, ShipmentItem, ShipmentPlan, ShipmentStatus } from '../../types';
import { supabase } from '../../services/supabase';

interface ShipmentsState {
  shipments: Shipment[];
  shipmentItems: Record<string, ShipmentItem[]>; // keyed by shipmentId
  shipmentPlans: ShipmentPlan[];
  selectedShipment: Shipment | null;
  currentPlan: ShipmentPlan | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    status?: ShipmentStatus;
    fulfillmentCenterId?: string;
  };
}

const initialState: ShipmentsState = {
  shipments: [],
  shipmentItems: {},
  shipmentPlans: [],
  selectedShipment: null,
  currentPlan: null,
  isLoading: false,
  error: null,
  filters: {},
};

export const fetchShipments = createAsyncThunk(
  'shipments/fetchShipments',
  async ({ userId, filters }: { 
    userId: string; 
    filters?: ShipmentsState['filters'];
  }) => {
    let query = supabase
      .from('shipments')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false });

    if (filters?.status) {
      query = query.eq('shipmentStatus', filters.status);
    }

    if (filters?.fulfillmentCenterId) {
      query = query.eq('destinationFulfillmentCenterId', filters.fulfillmentCenterId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Shipment[];
  }
);

export const fetchShipmentById = createAsyncThunk(
  'shipments/fetchShipmentById',
  async (shipmentId: string) => {
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('id', shipmentId)
      .single();
    
    if (error) throw error;
    return data as Shipment;
  }
);

export const fetchShipmentItems = createAsyncThunk(
  'shipments/fetchShipmentItems',
  async (shipmentId: string) => {
    const { data, error } = await supabase
      .from('shipment_items')
      .select('*')
      .eq('shipmentId', shipmentId);
    
    if (error) throw error;
    return { shipmentId, items: data as ShipmentItem[] };
  }
);

export const createShipment = createAsyncThunk(
  'shipments/createShipment',
  async (shipment: Omit<Shipment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data, error } = await supabase
      .from('shipments')
      .insert([shipment])
      .select()
      .single();
    
    if (error) throw error;
    return data as Shipment;
  }
);

export const updateShipmentStatus = createAsyncThunk(
  'shipments/updateShipmentStatus',
  async ({ id, status }: { id: string; status: ShipmentStatus }) => {
    const { data, error } = await supabase
      .from('shipments')
      .update({ shipmentStatus: status, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Shipment;
  }
);

export const createShipmentPlan = createAsyncThunk(
  'shipments/createShipmentPlan',
  async (plan: Omit<ShipmentPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data, error } = await supabase
      .from('shipment_plans')
      .insert([plan])
      .select()
      .single();
    
    if (error) throw error;
    return data as ShipmentPlan;
  }
);

export const fetchShipmentPlans = createAsyncThunk(
  'shipments/fetchShipmentPlans',
  async (userId: string) => {
    const { data, error } = await supabase
      .from('shipment_plans')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false });
    
    if (error) throw error;
    return data as ShipmentPlan[];
  }
);

export const addShipmentItems = createAsyncThunk(
  'shipments/addShipmentItems',
  async ({ shipmentId, items }: { 
    shipmentId: string; 
    items: Omit<ShipmentItem, 'id' | 'createdAt' | 'updatedAt'>[];
  }) => {
    const itemsWithShipmentId = items.map(item => ({
      ...item,
      shipmentId
    }));

    const { data, error } = await supabase
      .from('shipment_items')
      .insert(itemsWithShipmentId)
      .select();
    
    if (error) throw error;
    return { shipmentId, items: data as ShipmentItem[] };
  }
);

const shipmentsSlice = createSlice({
  name: 'shipments',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<ShipmentsState['filters']>) => {
      state.filters = action.payload;
    },
    selectShipment: (state, action: PayloadAction<Shipment | null>) => {
      state.selectedShipment = action.payload;
    },
    setCurrentPlan: (state, action: PayloadAction<ShipmentPlan | null>) => {
      state.currentPlan = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch shipments
    builder
      .addCase(fetchShipments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchShipments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.shipments = action.payload;
      })
      .addCase(fetchShipments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch shipments';
      });

    // Fetch shipment by ID
    builder
      .addCase(fetchShipmentById.fulfilled, (state, action) => {
        state.selectedShipment = action.payload;
        const index = state.shipments.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.shipments[index] = action.payload;
        }
      });

    // Fetch shipment items
    builder
      .addCase(fetchShipmentItems.fulfilled, (state, action) => {
        state.shipmentItems[action.payload.shipmentId] = action.payload.items;
      });

    // Create shipment
    builder
      .addCase(createShipment.fulfilled, (state, action) => {
        state.shipments.unshift(action.payload);
      });

    // Update shipment status
    builder
      .addCase(updateShipmentStatus.fulfilled, (state, action) => {
        const index = state.shipments.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.shipments[index] = action.payload;
        }
        if (state.selectedShipment?.id === action.payload.id) {
          state.selectedShipment = action.payload;
        }
      });

    // Create shipment plan
    builder
      .addCase(createShipmentPlan.fulfilled, (state, action) => {
        state.shipmentPlans.unshift(action.payload);
        state.currentPlan = action.payload;
      });

    // Fetch shipment plans
    builder
      .addCase(fetchShipmentPlans.fulfilled, (state, action) => {
        state.shipmentPlans = action.payload;
      });

    // Add shipment items
    builder
      .addCase(addShipmentItems.fulfilled, (state, action) => {
        state.shipmentItems[action.payload.shipmentId] = [
          ...(state.shipmentItems[action.payload.shipmentId] || []),
          ...action.payload.items
        ];
      });
  },
});

export const { setFilters, selectShipment, setCurrentPlan, clearError } = shipmentsSlice.actions;
export default shipmentsSlice.reducer;