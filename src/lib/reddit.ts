import { RedditClientInterface } from '@/types/reddit';
import snoowrap from 'snoowrap';

export class RedditClient implements RedditClientInterface {
  private static instance: RedditClient;
  private redditClient: snoowrap | null = null;

  private constructor() {}

  static getInstance(): RedditClient {
    if (!RedditClient.instance) {
      RedditClient.instance = new RedditClient();
    }
    return RedditClient.instance;
  }

  async initializeClient(username: string, password: string): Promise<snoowrap> {
    this.redditClient = new snoowrap({
      userAgent: process.env.REDDIT_USER_AGENT!,
      clientId: process.env.REDDIT_CLIENT_ID!,
      clientSecret: process.env.REDDIT_CLIENT_SECRET!,
      username,
      password,
    });
    return this.redditClient;
  }

  async validateCredentials(username: string, password: string): Promise<boolean> {
    const client = await this.initializeClient(username, password);
    return client
      .getMe()
      .fetch()
      .then((_user: snoowrap.RedditUser) => {
        try {
          return _user.name.toLowerCase() === username.toLowerCase();
        } catch (error) {
          console.error(error);
          return false;
        }
      });
  }

  async validateSubReddit(client: snoowrap, subreddit: string): Promise<boolean> {
    return client
      .getSubreddit(subreddit)
      .fetch()
      .then(() => true)
      .catch(() => false);
  }
}
