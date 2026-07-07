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
      organizations: {
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
      memberships: {
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
            foreignKeyName: "memberships_org_id_fkey";
            columns: ["org_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      projects: {
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
            foreignKeyName: "projects_org_id_fkey";
            columns: ["org_id"];
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_org_member: {
        Args: { target_org: string };
        Returns: boolean;
      };
      has_org_role: {
        Args: { target_org: string; roles: OrgRole[] };
        Returns: boolean;
      };
      create_organization: {
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
      org_role: OrgRole;
    };
    CompositeTypes: Record<string, never>;
  };
};

/* Convenience row aliases used across the app. */
export type Organization = Database["public"]["Tables"]["organizations"]["Row"];
export type Membership = Database["public"]["Tables"]["memberships"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
