export interface AuthResponse {
  success: boolean;
  userId: string;
  configurations: {
    generalContext: string;
    topPostsLimit: number;
    topCommentsLimit: number;
    lastHours?: number;
    orderBy: 'new' | 'top';
    timeFilter?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
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
