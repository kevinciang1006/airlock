/**
 * Database types for the `public` schema.
 *
 * Hand-authored to exactly match supabase/migrations/*. To regenerate from a
 * running local stack (keeps this in sync if the schema changes):
 *
 *   supabase gen types typescript --local > src/lib/database.types.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type OrgRole = "owner" | "admin" | "member";

export type Database = {
  public: {
    Tables: {
      airlock_organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      airlock_memberships: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          role: OrgRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          user_id: string;
          role?: OrgRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          user_id?: string;
          role?: OrgRole;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "airlock_memberships_org_id_fkey";
            columns: ["org_id"];
            referencedRelation: "airlock_organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      airlock_projects: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          description: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          description?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          description?: string | null;
          created_by?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "airlock_projects_org_id_fkey";
            columns: ["org_id"];
            referencedRelation: "airlock_organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      airlock_profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      airlock_is_org_member: {
        Args: { target_org: string };
        Returns: boolean;
      };
      airlock_has_org_role: {
        Args: { target_org: string; roles: OrgRole[] };
        Returns: boolean;
      };
      airlock_shares_org: {
        Args: { target_user: string };
        Returns: boolean;
      };
      airlock_create_organization: {
        Args: { org_name: string; org_slug: string };
        Returns: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
        };
      };
    };
    Enums: {
      airlock_org_role: OrgRole;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

/* Convenience row aliases used across the app. */
export type Organization = Database["public"]["Tables"]["airlock_organizations"]["Row"];
export type Membership = Database["public"]["Tables"]["airlock_memberships"]["Row"];
export type Project = Database["public"]["Tables"]["airlock_projects"]["Row"];
export type Profile = Database["public"]["Tables"]["airlock_profiles"]["Row"];
