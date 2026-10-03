// Handwritten scaffold types matching supabase/migrations/202610020001_zaltrex_initial.sql.
// Replace with: supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Profile = {
  id: string;
  full_name: string;
  email: string | null;
  role: "client" | "admin";
  created_at: string;
};
export type Service = {
  id: string;
  title: string;
  description: string;
  title_i18n?: Json;
  description_i18n?: Json;
  price: number | null;
  icon_name: string;
  is_active: boolean;
  created_at: string;
};
type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "unread" | "read" | "archived";
  created_at: string;
};
export type ServiceRequest = {
  id: string;
  client_id: string;
  service_id: string;
  requirements: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  created_at: string;
};
export type SiteContent = {
  id: string;
  section_name: string;
  content_text: string;
  image_url: string | null;
};

type Table<
  Row,
  Insert,
  Update,
  Relationships extends {
    foreignKeyName: string;
    columns: string[];
    isOneToOne: boolean;
    referencedRelation: string;
    referencedColumns: string[];
  }[] = [],
> = { Row: Row; Insert: Insert; Update: Update; Relationships: Relationships };

export type Database = {
  public: {
    Tables: {
      profiles: Table<
        Profile,
        {
          id: string;
          full_name?: string;
          email?: string | null;
          role?: Profile["role"];
          created_at?: string;
        },
        Partial<Pick<Profile, "full_name" | "role">>
      >;
      services: Table<
        Service,
        {
          title: string;
          description?: string;
          title_i18n?: Json;
          description_i18n?: Json;
          price?: number | null;
          icon_name?: string;
          is_active?: boolean;
          id?: string;
          created_at?: string;
        },
        Partial<
          Pick<
            Service,
            | "title"
            | "description"
            | "title_i18n"
            | "description_i18n"
            | "price"
            | "icon_name"
            | "is_active"
          >
        >
      >;
      contact_messages: Table<
        ContactMessage,
        Pick<ContactMessage, "name" | "email" | "subject" | "message">,
        Partial<
          Pick<
            ContactMessage,
            "name" | "email" | "subject" | "message" | "status"
          >
        >
      >;
      service_requests: Table<
        ServiceRequest,
        Pick<ServiceRequest, "client_id" | "service_id" | "requirements">,
        Partial<
          Pick<
            ServiceRequest,
            "client_id" | "service_id" | "requirements" | "status"
          >
        >,
        [
          {
            foreignKeyName: "service_requests_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_requests_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
        ]
      >;
      site_content: Table<
        SiteContent,
        {
          section_name: string;
          content_text?: string;
          image_url?: string | null;
          id?: string;
        },
        Partial<Pick<SiteContent, "content_text" | "image_url">>
      >;
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
