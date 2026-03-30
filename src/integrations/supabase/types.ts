export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          body: string
          created_by: string | null
          id: string
          is_active: boolean | null
          sent_at: string | null
          target_audience: string | null
          target_grade_max: number | null
          target_grade_min: number | null
          title: string
        }
        Insert: {
          body: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          sent_at?: string | null
          target_audience?: string | null
          target_grade_max?: number | null
          target_grade_min?: number | null
          title: string
        }
        Update: {
          body?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          sent_at?: string | null
          target_audience?: string | null
          target_grade_max?: number | null
          target_grade_min?: number | null
          title?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          earned_count: number | null
          icon: string | null
          id: string
          name: string
          trigger_condition: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          earned_count?: number | null
          icon?: string | null
          id?: string
          name: string
          trigger_condition?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          earned_count?: number | null
          icon?: string | null
          id?: string
          name?: string
          trigger_condition?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      child_profiles: {
        Row: {
          age: number
          avatar: string
          avatar_config: Json
          created_at: string
          hq_completed: boolean
          id: string
          last_activity_date: string | null
          learning_mode: string
          level: number
          master_certificate_earned: boolean
          name: string
          parent_id: string
          points: number
          streak: number
          updated_at: string
          villains_defeated: number
          worlds_completed: number
        }
        Insert: {
          age: number
          avatar?: string
          avatar_config?: Json
          created_at?: string
          hq_completed?: boolean
          id?: string
          last_activity_date?: string | null
          learning_mode?: string
          level?: number
          master_certificate_earned?: boolean
          name: string
          parent_id: string
          points?: number
          streak?: number
          updated_at?: string
          villains_defeated?: number
          worlds_completed?: number
        }
        Update: {
          age?: number
          avatar?: string
          avatar_config?: Json
          created_at?: string
          hq_completed?: boolean
          id?: string
          last_activity_date?: string | null
          learning_mode?: string
          level?: number
          master_certificate_earned?: boolean
          name?: string
          parent_id?: string
          points?: number
          streak?: number
          updated_at?: string
          villains_defeated?: number
          worlds_completed?: number
        }
        Relationships: []
      }
      continent_progress: {
        Row: {
          boss_defeated: boolean
          child_id: string
          completed_at: string | null
          continent_id: string
          created_at: string
          id: string
          status: string
          zones_completed: number
        }
        Insert: {
          boss_defeated?: boolean
          child_id: string
          completed_at?: string | null
          continent_id: string
          created_at?: string
          id?: string
          status?: string
          zones_completed?: number
        }
        Update: {
          boss_defeated?: boolean
          child_id?: string
          completed_at?: string | null
          continent_id?: string
          created_at?: string
          id?: string
          status?: string
          zones_completed?: number
        }
        Relationships: [
          {
            foreignKeyName: "continent_progress_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_challenges: {
        Row: {
          challenge_date: string
          child_id: string
          completed: boolean
          created_at: string
          game_type: string
          id: string
          points_awarded: number
        }
        Insert: {
          challenge_date?: string
          child_id: string
          completed?: boolean
          created_at?: string
          game_type: string
          id?: string
          points_awarded?: number
        }
        Update: {
          challenge_date?: string
          child_id?: string
          completed?: boolean
          created_at?: string
          game_type?: string
          id?: string
          points_awarded?: number
        }
        Relationships: [
          {
            foreignKeyName: "daily_challenges_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      earned_badges: {
        Row: {
          badge_icon: string
          badge_id: string
          badge_name: string
          child_id: string
          earned_at: string
          id: string
        }
        Insert: {
          badge_icon?: string
          badge_id: string
          badge_name: string
          child_id: string
          earned_at?: string
          id?: string
        }
        Update: {
          badge_icon?: string
          badge_id?: string
          badge_name?: string
          child_id?: string
          earned_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "earned_badges_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_log: {
        Row: {
          body: string
          id: string
          recipient_email: string | null
          recipient_type: string | null
          sent_at: string | null
          sent_by: string | null
          status: string | null
          subject: string
        }
        Insert: {
          body: string
          id?: string
          recipient_email?: string | null
          recipient_type?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: string | null
          subject: string
        }
        Update: {
          body?: string
          id?: string
          recipient_email?: string | null
          recipient_type?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: string | null
          subject?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          badge_id: string | null
          created_at: string | null
          description: string | null
          display_day: string | null
          display_month: string | null
          double_xp: boolean | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: string | null
        }
        Insert: {
          badge_id?: string | null
          created_at?: string | null
          description?: string | null
          display_day?: string | null
          display_month?: string | null
          double_xp?: boolean | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: string | null
        }
        Update: {
          badge_id?: string | null
          created_at?: string | null
          description?: string | null
          display_day?: string | null
          display_month?: string | null
          double_xp?: boolean | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      game_sessions: {
        Row: {
          completed_at: string | null
          duration_seconds: number | null
          game_id: string | null
          id: string
          kid_id: string
          score: number | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          duration_seconds?: number | null
          game_id?: string | null
          id?: string
          kid_id: string
          score?: number | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          duration_seconds?: number | null
          game_id?: string | null
          id?: string
          kid_id?: string
          score?: number | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_sessions_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_sessions_kid_id_fkey"
            columns: ["kid_id"]
            isOneToOne: false
            referencedRelation: "kids"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          age_range: string | null
          category_id: string | null
          completions_count: number | null
          created_at: string | null
          description: string | null
          featured: boolean | null
          icon: string | null
          id: string
          locked: boolean | null
          max_grade: number | null
          min_grade: number | null
          name: string
          players_count: number | null
          publish_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          age_range?: string | null
          category_id?: string | null
          completions_count?: number | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          icon?: string | null
          id?: string
          locked?: boolean | null
          max_grade?: number | null
          min_grade?: number | null
          name: string
          players_count?: number | null
          publish_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          age_range?: string | null
          category_id?: string | null
          completions_count?: number | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          icon?: string | null
          id?: string
          locked?: boolean | null
          max_grade?: number | null
          min_grade?: number | null
          name?: string
          players_count?: number | null
          publish_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "games_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      kid_progress: {
        Row: {
          game_id: string | null
          id: string
          kid_id: string
          last_updated: string | null
          progress_data: Json | null
        }
        Insert: {
          game_id?: string | null
          id?: string
          kid_id: string
          last_updated?: string | null
          progress_data?: Json | null
        }
        Update: {
          game_id?: string | null
          id?: string
          kid_id?: string
          last_updated?: string | null
          progress_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "kid_progress_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      kids: {
        Row: {
          age: number | null
          avatar_color: string | null
          created_at: string | null
          id: string
          name: string
          parent_id: string
          username: string | null
        }
        Insert: {
          age?: number | null
          avatar_color?: string | null
          created_at?: string | null
          id?: string
          name: string
          parent_id: string
          username?: string | null
        }
        Update: {
          age?: number | null
          avatar_color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          parent_id?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kids_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_progress: {
        Row: {
          child_id: string
          completed_at: string | null
          created_at: string
          current_question: number
          game_type: string | null
          id: string
          max_score: number
          mission_id: string
          score: number
          stars_earned: number
          status: string
          updated_at: string
        }
        Insert: {
          child_id: string
          completed_at?: string | null
          created_at?: string
          current_question?: number
          game_type?: string | null
          id?: string
          max_score?: number
          mission_id: string
          score?: number
          stars_earned?: number
          status?: string
          updated_at?: string
        }
        Update: {
          child_id?: string
          completed_at?: string | null
          created_at?: string
          current_question?: number
          game_type?: string | null
          id?: string
          max_score?: number
          mission_id?: string
          score?: number
          stars_earned?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mission_progress_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_kid_links: {
        Row: {
          created_at: string | null
          id: string
          kid_id: string
          parent_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          kid_id: string
          parent_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          kid_id?: string
          parent_id?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          key: string
          value: boolean | null
        }
        Insert: {
          key: string
          value?: boolean | null
        }
        Update: {
          key?: string
          value?: boolean | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: string | null
          created_at: string
          display_name: string
          email: string | null
          grade_level: string | null
          id: string
          parent_pin: string
          plan: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_type?: string | null
          created_at?: string
          display_name?: string
          email?: string | null
          grade_level?: string | null
          id?: string
          parent_pin?: string
          plan?: string | null
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_type?: string | null
          created_at?: string
          display_name?: string
          email?: string | null
          grade_level?: string | null
          id?: string
          parent_pin?: string
          plan?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      zone_progress: {
        Row: {
          child_id: string
          continent_id: string
          created_at: string
          games_completed: number
          id: string
          stars_earned: number
          status: string
          total_games: number
          unlocked_at: string | null
          zone_id: string
        }
        Insert: {
          child_id: string
          continent_id: string
          created_at?: string
          games_completed?: number
          id?: string
          stars_earned?: number
          status?: string
          total_games?: number
          unlocked_at?: string | null
          zone_id: string
        }
        Update: {
          child_id?: string
          continent_id?: string
          created_at?: string
          games_completed?: number
          id?: string
          stars_earned?: number
          status?: string
          total_games?: number
          unlocked_at?: string | null
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "zone_progress_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_creator: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
