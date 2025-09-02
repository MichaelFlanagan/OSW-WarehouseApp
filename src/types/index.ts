// Core Entity Types based on REQUIREMENTS.md

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AmazonCredentials {
  id: string;
  userId: string;
  sellerId: string;
  refreshToken: string;
  accessToken?: string;
  accessTokenExpiry?: Date;
  marketplaceId: string;
  region: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  userId: string;
  asin: string;
  sellerSku: string;
  productName: string;
  description?: string;
  condition: ProductCondition;
  price?: number;
  imageUrls: string[];
  marketplaceId: string;
  fnsku?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum ProductCondition {
  NEW = 'NEW',
  USED_LIKE_NEW = 'USED_LIKE_NEW',
  USED_VERY_GOOD = 'USED_VERY_GOOD',
  USED_GOOD = 'USED_GOOD',
  USED_ACCEPTABLE = 'USED_ACCEPTABLE',
  REFURBISHED = 'REFURBISHED',
  COLLECTIBLE_LIKE_NEW = 'COLLECTIBLE_LIKE_NEW',
  COLLECTIBLE_VERY_GOOD = 'COLLECTIBLE_VERY_GOOD',
  COLLECTIBLE_GOOD = 'COLLECTIBLE_GOOD',
  COLLECTIBLE_ACCEPTABLE = 'COLLECTIBLE_ACCEPTABLE'
}

export interface Bundle {
  id: string;
  userId: string;
  asin: string;
  description: string;
  components: BundleComponent[];
  totalCost?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BundleComponent {
  asin: string;
  quantity: number;
  product?: Product;
}

export interface Shipment {
  id: string;
  userId: string;
  shipmentId: string; // Amazon shipment ID
  shipmentName: string;
  destinationFulfillmentCenterId: string;
  shipFromAddress: Address;
  labelPrepType: LabelPrepType;
  shipmentStatus: ShipmentStatus;
  shippedQuantity: number;
  receivedQuantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum ShipmentStatus {
  WORKING = 'WORKING',
  SHIPPED = 'SHIPPED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CHECKED_IN = 'CHECKED_IN',
  RECEIVING = 'RECEIVING',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
  DELETED = 'DELETED',
  ERROR = 'ERROR'
}

export enum LabelPrepType {
  NO_LABEL = 'NO_LABEL',
  SELLER_LABEL = 'SELLER_LABEL',
  AMAZON_LABEL = 'AMAZON_LABEL'
}

export interface ShipmentItem {
  id: string;
  shipmentId: string;
  sellerSku: string;
  fnsku: string;
  quantityShipped: number;
  quantityReceived: number;
  quantityInCase?: number;
  releaseDate?: Date;
  prepDetailsList?: PrepDetails[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PrepDetails {
  prepInstruction: PrepInstruction;
  prepOwner: PrepOwner;
}

export enum PrepInstruction {
  POLYBAGGING = 'POLYBAGGING',
  BUBBLE_WRAPPING = 'BUBBLE_WRAPPING',
  TAPING = 'TAPING',
  BLACK_SHRINK_WRAPPING = 'BLACK_SHRINK_WRAPPING',
  LABELING = 'LABELING',
  HANG_GARMENT = 'HANG_GARMENT'
}

export enum PrepOwner {
  AMAZON = 'AMAZON',
  SELLER = 'SELLER'
}

export interface ShipmentPlan {
  id: string;
  userId: string;
  planId?: string; // Amazon plan ID
  items: ShipmentPlanItem[];
  shipToAddress?: Address;
  labelPrepPreference: LabelPrepType;
  status: 'DRAFT' | 'SUBMITTED' | 'CONFIRMED';
  createdAt: Date;
  updatedAt: Date;
}

export interface ShipmentPlanItem {
  sellerSku: string;
  asin: string;
  condition: ProductCondition;
  quantity: number;
  quantityInCase?: number;
  prepDetailsList?: PrepDetails[];
}

export interface Address {
  id?: string;
  userId?: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateOrProvinceCode: string;
  countryCode: string;
  postalCode: string;
  isDefault?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Report {
  id: string;
  userId: string;
  reportId?: string; // Amazon report ID
  reportType: ReportType;
  processingStatus: ReportProcessingStatus;
  dataStartTime?: Date;
  dataEndTime?: Date;
  reportDocumentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum ReportType {
  FBA_INVENTORY = 'GET_FBA_MYI_UNSUPPRESSED_INVENTORY_DATA',
  FBA_SHIPMENTS = 'GET_FBA_FULFILLMENT_REMOVAL_SHIPMENT_DETAIL_DATA',
  FEE_PREVIEW = 'GET_FBA_ESTIMATED_FBA_FEES_TXT_DATA',
  INVENTORY_REPORT = 'GET_MERCHANT_LISTINGS_ALL_DATA'
}

export enum ReportProcessingStatus {
  QUEUED = 'QUEUED',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED',
  FATAL = 'FATAL'
}

export interface GlobalSettings {
  id: string;
  userId: string;
  shipmentNamingConvention?: string;
  defaultPrepPreferences?: PrepDetails[];
  notificationPreferences?: NotificationPreferences;
  apiRateLimitConfig?: ApiRateLimitConfig;
  timezone?: string;
  language?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  shipmentStatusUpdates: boolean;
  reportCompletionAlerts: boolean;
  inventoryAlerts: boolean;
}

export interface ApiRateLimitConfig {
  catalogApiLimit: number;
  fbaInboundApiLimit: number;
  reportsApiLimit: number;
  retryAttempts: number;
  backoffMultiplier: number;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}