import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product, Bundle } from '../../types';
import { supabase } from '../../services/supabase';

interface ProductsState {
  products: Product[];
  bundles: Bundle[];
  selectedProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  filters: {
    marketplaceId?: string;
    condition?: string;
  };
}

const initialState: ProductsState = {
  products: [],
  bundles: [],
  selectedProduct: null,
  isLoading: false,
  error: null,
  searchQuery: '',
  filters: {},
};

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async ({ userId, searchQuery, filters }: { 
    userId: string; 
    searchQuery?: string;
    filters?: ProductsState['filters'];
  }) => {
    let query = supabase
      .from('products')
      .select('*')
      .eq('userId', userId);

    if (searchQuery) {
      query = query.or(`asin.ilike.%${searchQuery}%,sellerSku.ilike.%${searchQuery}%,productName.ilike.%${searchQuery}%`);
    }

    if (filters?.marketplaceId) {
      query = query.eq('marketplaceId', filters.marketplaceId);
    }

    if (filters?.condition) {
      query = query.eq('condition', filters.condition);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Product[];
  }
);

export const fetchProductByAsin = createAsyncThunk(
  'products/fetchProductByAsin',
  async ({ userId, asin }: { userId: string; asin: string }) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('userId', userId)
      .eq('asin', asin)
      .single();
    
    if (error) throw error;
    return data as Product;
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();
    
    if (error) throw error;
    return data as Product;
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, updates }: { id: string; updates: Partial<Product> }) => {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Product;
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return id;
  }
);

export const fetchBundles = createAsyncThunk(
  'products/fetchBundles',
  async (userId: string) => {
    const { data, error } = await supabase
      .from('bundles')
      .select('*')
      .eq('userId', userId);
    
    if (error) throw error;
    return data as Bundle[];
  }
);

export const createBundle = createAsyncThunk(
  'products/createBundle',
  async (bundle: Omit<Bundle, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data, error } = await supabase
      .from('bundles')
      .insert([bundle])
      .select()
      .single();
    
    if (error) throw error;
    return data as Bundle;
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setFilters: (state, action: PayloadAction<ProductsState['filters']>) => {
      state.filters = action.payload;
    },
    selectProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch products
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch products';
      });

    // Fetch product by ASIN
    builder
      .addCase(fetchProductByAsin.fulfilled, (state, action) => {
        state.selectedProduct = action.payload;
        // Update in products array if exists
        const index = state.products.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      });

    // Create product
    builder
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.push(action.payload);
      });

    // Update product
    builder
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        if (state.selectedProduct?.id === action.payload.id) {
          state.selectedProduct = action.payload;
        }
      });

    // Delete product
    builder
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(p => p.id !== action.payload);
        if (state.selectedProduct?.id === action.payload) {
          state.selectedProduct = null;
        }
      });

    // Fetch bundles
    builder
      .addCase(fetchBundles.fulfilled, (state, action) => {
        state.bundles = action.payload;
      });

    // Create bundle
    builder
      .addCase(createBundle.fulfilled, (state, action) => {
        state.bundles.push(action.payload);
      });
  },
});

export const { setSearchQuery, setFilters, selectProduct, clearError } = productsSlice.actions;
export default productsSlice.reducer;