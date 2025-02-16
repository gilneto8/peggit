import { RedditClientInterface } from '@/types/reddit';
import snoowrap from 'snoowrap';

export class RedditClient implements RedditClientInterface {
  username: string | undefined;
  password: string | undefined;
  private static instance: RedditClient;

  constructor() {}

  static getInstance(): RedditClient {
    if (!RedditClient.instance) {
      RedditClient.instance = new RedditClient();
    }
    return RedditClient.instance;
  }

  setUserInfo(username: string, password: string) {
    this.username = username;
    this.password = password;
  }

  async validateCredentials(): Promise<boolean> {
    const reddit = new snoowrap({
      userAgent: process.env.REDDIT_USER_AGENT!,
      clientId: process.env.REDDIT_CLIENT_ID!,
      clientSecret: process.env.REDDIT_CLIENT_SECRET!,
      username: this.username,
      password: this.password,
    });
    return reddit
      .getMe()
      .fetch()
      .then((_user: snoowrap.RedditUser) => {
        try {
          return _user.name.toLowerCase() === this.username!.toLowerCase();
        } catch (error) {
          console.error(error);
          return false;
        }
      });
  }

  async validateSubReddit(subreddit: string): Promise<boolean> {
    const reddit = new snoowrap({
      userAgent: process.env.REDDIT_USER_AGENT!,
      clientId: process.env.REDDIT_CLIENT_ID!,
      clientSecret: process.env.REDDIT_CLIENT_SECRET!,
      username: this.username,
      password: this.password,
    });

    return await reddit
      .getSubreddit(subreddit)
      .fetch()
      .then(() => true)
      .catch(() => false);
  }

  // async submitPost(subreddit: string title: string, text: string): Promise<string> {
  //   try {
  //     const submission = await this.reddit.submitSelfpost({
  //       subredditName: subreddit,
  //       title,
  //       text
  //     });
  //     return submission.id;
  //   } catch (error) {
  //     throw new Error(`Failed to submit post: ${error instanceof Error ? error.message : 'Unknown error'}`);
  //   }
  // }

  // async submitComment(postId: string, text: string): Promise<string> {
  //   try {
  //     const submission = await this.reddit.getSubmission(postId);
  //     const comment = await submission.reply(text);
  //     return comment.id;
  //   } catch (error) {
  //     throw new Error(`Failed to submit comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
  //   }
  // }
}
