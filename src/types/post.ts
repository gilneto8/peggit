export interface Comment {
  id: string;
  author: string;
  body: string;
  score: number;
  created_utc: number;
}

export interface Post {
  id: string;
  subreddit: string;
  title: string;
  url: string;
  author: string;
  created_utc: number;
  score: number;
  num_comments: number;
  relevance_score?: number;
  comments: Comment[];
}

export interface ScrapePostsResponse {
  success: boolean;
  data: {
    posts: Post[];
  };
}
