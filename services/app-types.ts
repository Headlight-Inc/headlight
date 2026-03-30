export type IndustryType = 'ecommerce' | 'local' | 'saas' | 'elearning';

export interface ProjectRecord {
  id: string;
  user_id: string;
  name: string;
  url: string;
  industry: IndustryType;
  created_at: string;
}
