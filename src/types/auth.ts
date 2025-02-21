export interface AuthResponse {
  success: boolean;
  userId: string;
  configurations: {
    generalContext: string;
    forums: ForumResponse[];
    timeRanges: TimeRange[];
  };
}

export interface ForumResponse {
  id: number;
  identifier: string;
  specific_context: string;
}

export interface TimeRange {
  id: string;
  min: number;
  max: number;
}
