// interfaces/types.ts
export interface LovePageData {
  id?: string;
  clientEmail: string;
  coupleDate: Date; // timestamp
  coupleName: string;
  coupon: string | null;
  createdAt: Date; // timestamp
  date: Date; // timestamp
  editedAt: Date | null;
  enableVideo: boolean;
  fromUrl: string | null;
  hideAppBar: boolean;
  imagesUrl: string[];
  isForever: boolean;
  isPix: boolean;
  maxImages: number;
  message: string;
  price: number;
  updatedAt: Date; // timestamp
  videoId: string;
  paymentId?: string; // ID do pagamento no Mercado Pago
  paymentStatus: 'pending' | 'approved' | 'rejected';
}