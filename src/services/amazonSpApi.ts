import axios, { AxiosInstance } from 'axios';
import { AmazonCredentials, Product, Shipment, ShipmentPlan } from '../types';

class AmazonSpApiService {
  private client: AxiosInstance;
  private credentials: AmazonCredentials | null = null;
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
    this.client = axios.create({
      baseURL: `${this.baseUrl}/api/amazon`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use(
      async (config) => {
        if (this.credentials?.accessToken) {
          config.headers['x-amz-access-token'] = this.credentials.accessToken;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          await this.refreshAccessToken();
          return this.client(originalRequest);
        }
        
        return Promise.reject(error);
      }
    );
  }

  setCredentials(credentials: AmazonCredentials) {
    this.credentials = credentials;
  }

  private async refreshAccessToken(): Promise<void> {
    if (!this.credentials?.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post(`${this.baseUrl}/api/amazon/auth/refresh`, {
        refreshToken: this.credentials.refreshToken,
      });

      if (this.credentials) {
        this.credentials.accessToken = response.data.access_token;
        this.credentials.accessTokenExpiry = new Date(
          Date.now() + response.data.expires_in * 1000
        );
      }
    } catch (error) {
      console.error('Failed to refresh access token:', error);
      throw error;
    }
  }

  // Seller API
  async getMarketplaceParticipations() {
    const response = await this.client.get('/sellers/v1/marketplaceParticipations');
    return response.data;
  }

  // Catalog API
  async searchCatalogItems(params: {
    keywords?: string;
    marketplaceIds: string[];
    includedData?: string[];
    pageSize?: number;
    pageToken?: string;
  }) {
    const response = await this.client.get('/catalog/2022-04-01/items', { params });
    return response.data;
  }

  async getCatalogItem(asin: string, marketplaceIds: string[]) {
    const response = await this.client.get(`/catalog/2022-04-01/items/${asin}`, {
      params: { marketplaceIds: marketplaceIds.join(',') },
    });
    return response.data;
  }

  // Listings API
  async getListingsItem(sellerId: string, sku: string, marketplaceIds: string[]) {
    const response = await this.client.get(`/listings/2021-08-01/items/${sellerId}/${sku}`, {
      params: { marketplaceIds: marketplaceIds.join(',') },
    });
    return response.data;
  }

  // FBA Inbound API
  async getInboundGuidance(params: {
    marketplaceId: string;
    sellerSKUList?: string[];
    asinList?: string[];
  }) {
    const response = await this.client.get('/fba/inbound/v0/itemsGuidance', { params });
    return response.data;
  }

  async createInboundShipmentPlan(params: {
    shipFromAddress: any;
    labelPrepPreference: string;
    inboundShipmentPlanRequestItems: Array<{
      sellerSKU: string;
      asin: string;
      condition: string;
      quantity: number;
      quantityInCase?: number;
      prepDetailsList?: any[];
    }>;
    shipToCountryCode?: string;
    shipToCountrySubdivisionCode?: string;
  }) {
    const response = await this.client.post('/fba/inbound/v0/plans', params);
    return response.data;
  }

  async createInboundShipment(params: {
    shipmentId: string;
    inboundShipmentHeader: {
      shipmentName: string;
      shipFromAddress: any;
      destinationFulfillmentCenterId: string;
      labelPrepPreference: string;
      shipmentStatus: string;
    };
    inboundShipmentItems: Array<{
      sellerSKU: string;
      quantityShipped: number;
      quantityInCase?: number;
      releaseDate?: string;
      prepDetailsList?: any[];
    }>;
    marketplaceId: string;
  }) {
    const response = await this.client.put(
      `/fba/inbound/v0/shipments/${params.shipmentId}`,
      params
    );
    return response.data;
  }

  async updateInboundShipment(shipmentId: string, params: any) {
    const response = await this.client.put(`/fba/inbound/v0/shipments/${shipmentId}`, params);
    return response.data;
  }

  async getShipments(params?: {
    shipmentStatusList?: string[];
    shipmentIdList?: string[];
    lastUpdatedAfter?: string;
    lastUpdatedBefore?: string;
    queryType?: 'SHIPMENT' | 'DATE_RANGE' | 'NEXT_TOKEN';
    nextToken?: string;
    marketplaceId?: string;
  }) {
    const response = await this.client.get('/fba/inbound/v0/shipments', { params });
    return response.data;
  }

  async getShipmentItems(params: {
    shipmentId: string;
    marketplaceId: string;
  }) {
    const response = await this.client.get('/fba/inbound/v0/shipments/' + params.shipmentId + '/items', {
      params: { marketplaceId: params.marketplaceId },
    });
    return response.data;
  }

  async getLabels(params: {
    shipmentId: string;
    pageType: string;
    labelType: string;
    numberOfPackages?: number;
    packageLabelsToPrint?: string[];
    numberOfPallets?: number;
    pageSize?: number;
    pageStartIndex?: number;
  }) {
    const response = await this.client.get(`/fba/inbound/v0/shipments/${params.shipmentId}/labels`, {
      params,
    });
    return response.data;
  }

  async getPrepInstructions(params: {
    shipToCountryCode: string;
    sellerSKUList?: string[];
    asinList?: string[];
  }) {
    const response = await this.client.get('/fba/inbound/v0/prepInstructions', { params });
    return response.data;
  }

  // Reports API
  async createReport(params: {
    reportType: string;
    dataStartTime?: string;
    dataEndTime?: string;
    marketplaceIds: string[];
    reportOptions?: any;
  }) {
    const response = await this.client.post('/reports/2021-06-30/reports', params);
    return response.data;
  }

  async getReport(reportId: string) {
    const response = await this.client.get(`/reports/2021-06-30/reports/${reportId}`);
    return response.data;
  }

  async getReportDocument(reportDocumentId: string) {
    const response = await this.client.get(`/reports/2021-06-30/documents/${reportDocumentId}`);
    return response.data;
  }

  async downloadReportDocument(url: string) {
    const response = await axios.get(url);
    return response.data;
  }

  // Helper methods for common operations
  async importProductFromAmazon(asin: string, marketplaceId: string): Promise<Product> {
    const catalogItem = await this.getCatalogItem(asin, [marketplaceId]);
    
    // Transform Amazon catalog item to our Product type
    const product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: '', // Will be set by the caller
      asin: catalogItem.asin,
      sellerSku: '', // Will need to be set by the user
      productName: catalogItem.itemName || '',
      description: catalogItem.itemDescription || '',
      condition: 'NEW' as any, // Default, user can change
      price: catalogItem.price?.amount || 0,
      imageUrls: catalogItem.images?.map((img: any) => img.link) || [],
      marketplaceId: marketplaceId,
      fnsku: catalogItem.fnsku || '',
    };

    return product as Product;
  }

  async validateShipmentPlan(plan: ShipmentPlan): Promise<boolean> {
    // Validate that all items have required prep instructions
    for (const item of plan.items) {
      const prepInstructions = await this.getPrepInstructions({
        shipToCountryCode: 'US', // Default to US
        sellerSKUList: [item.sellerSku],
      });

      if (prepInstructions.errors && prepInstructions.errors.length > 0) {
        console.error(`Prep instruction errors for SKU ${item.sellerSku}:`, prepInstructions.errors);
        return false;
      }
    }

    return true;
  }

  // Rate limiting helper
  private rateLimitDelay = 500; // milliseconds between requests
  private lastRequestTime = 0;

  private async enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest));
    }
    
    this.lastRequestTime = Date.now();
  }
}

export default new AmazonSpApiService();