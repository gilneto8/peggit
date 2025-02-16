export interface AuthResponse {
  success: boolean;
  configurations: {
    generalContext: string;
    forums: ForumResponse[];
  };
}

export interface ForumResponse {
  id: number;
  identifier: string;
  specific_context: string;
}
