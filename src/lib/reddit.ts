import snoowrap from 'snoowrap';

export class RedditClient {
  private reddit: snoowrap;

  constructor() {
    this.reddit = new snoowrap({
      userAgent: process.env.REDDIT_USER_AGENT!,
      clientId: process.env.REDDIT_CLIENT_ID!,
      clientSecret: process.env.REDDIT_CLIENT_SECRET!,
      refreshToken: process.env.REDDIT_REFRESH_TOKEN!
    });
  }

  async validateCredentials(username: string, password: string): Promise<boolean> {
    let user: snoowrap.RedditUser;
    return this.reddit.getUser(username).fetch().then(_user => {
      try {
        user = _user;
        return Boolean(user);
      }
      catch (error) {
        return false;
      }
    });
  }
}