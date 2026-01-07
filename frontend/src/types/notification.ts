export type Notification = {
  id: string;
  title: string;
  message: string;
  metadata?: {
    disease?: string;
    crop?: string;
    distance_km?: number;
    farmer?: string;
  };
  is_read: boolean;
  created_at: string;
};
