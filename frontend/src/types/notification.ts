export interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  disease?: string | null;
  crop?: string | null;
  distance_km?: number | null;
  farmer?: string | null;
}
