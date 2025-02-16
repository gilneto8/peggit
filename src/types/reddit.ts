import { RedditUser } from 'snoowrap';

export interface RedditClientInterface {
  validateCredentials(username: string, password: string): Promise<boolean>;
  // submitPost(subreddit: string, title: string, text: string): Promise<string>;
  // submitComment(postId: string, text: string): Promise<string>;
}
