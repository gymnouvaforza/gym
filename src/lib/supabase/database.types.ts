export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      leads: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          message: string;
          metadata: Json;
          name: string;
          phone: string | null;
          source: string;
          status: Database["public"]["Enums"]["lead_status"];
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          message: string;
          metadata?: Json;
          name: string;
          phone?: string | null;
          source?: string;
          status?: Database["public"]["Enums"]["lead_status"];
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          message?: string;
          metadata?: Json;
          name?: string;
          phone?: string | null;
          source?: string;
          status?: Database["public"]["Enums"]["lead_status"];
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          address: string | null;
          contact_email: string;
          contact_phone: string | null;
          footer_text: string;
          hero_badge: string;
          hero_description: string;
          hero_highlight_one: string;
          hero_highlight_three: string;
          hero_highlight_two: string;
          hero_primary_cta: string;
          hero_secondary_cta: string;
          hero_title: string;
          hero_video_url: string | null;
          id: number;
          opening_hours: string | null;
          topbar_cta_label: string | null;
          topbar_cta_url: string | null;
          topbar_enabled: boolean;
          topbar_expires_at: string | null;
          topbar_text: string | null;
          topbar_variant: string;
          seo_canonical_url: string | null;
          seo_description: string;
          seo_keywords: string[];
          seo_og_image_url: string | null;
          seo_title: string;
          site_name: string;
          site_tagline: string;
          updated_at: string;
          whatsapp_url: string | null;
        };
        Insert: {
          address?: string | null;
          contact_email: string;
          contact_phone?: string | null;
          footer_text: string;
          hero_badge: string;
          hero_description: string;
          hero_highlight_one: string;
          hero_highlight_three: string;
          hero_highlight_two: string;
          hero_primary_cta: string;
          hero_secondary_cta: string;
          hero_title: string;
          hero_video_url?: string | null;
          id?: number;
          opening_hours?: string | null;
          topbar_cta_label?: string | null;
          topbar_cta_url?: string | null;
          topbar_enabled?: boolean;
          topbar_expires_at?: string | null;
          topbar_text?: string | null;
          topbar_variant?: string;
          seo_canonical_url?: string | null;
          seo_description: string;
          seo_keywords: string[];
          seo_og_image_url?: string | null;
          seo_title: string;
          site_name: string;
          site_tagline: string;
          updated_at?: string;
          whatsapp_url?: string | null;
        };
        Update: {
          address?: string | null;
          contact_email?: string;
          contact_phone?: string | null;
          footer_text?: string;
          hero_badge?: string;
          hero_description?: string;
          hero_highlight_one?: string;
          hero_highlight_three?: string;
          hero_highlight_two?: string;
          hero_primary_cta?: string;
          hero_secondary_cta?: string;
          hero_title?: string;
          hero_video_url?: string | null;
          id?: number;
          opening_hours?: string | null;
          topbar_cta_label?: string | null;
          topbar_cta_url?: string | null;
          topbar_enabled?: boolean;
          topbar_expires_at?: string | null;
          topbar_text?: string | null;
          topbar_variant?: string;
          seo_canonical_url?: string | null;
          seo_description?: string;
          seo_keywords?: string[];
          seo_og_image_url?: string | null;
          seo_title?: string;
          site_name?: string;
          site_tagline?: string;
          updated_at?: string;
          whatsapp_url?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      lead_status: "new" | "contacted" | "closed";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Lead = Database["public"]["Tables"]["leads"]["Row"];
export type LeadStatus = Database["public"]["Enums"]["lead_status"];
export type SiteSettings = Database["public"]["Tables"]["site_settings"]["Row"];
