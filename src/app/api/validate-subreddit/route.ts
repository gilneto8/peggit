import { NextResponse } from 'next/server';
import { RedditClient } from '@/lib/reddit';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subreddit = searchParams.get('name');

    if (!subreddit) {
      console.log('what', subreddit);
      return NextResponse.json({ error: 'Subreddit name is required' }, { status: 400 });
    }

    const exists = await RedditClient.getInstance().validateSubReddit(subreddit);

    return NextResponse.json({ exists });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Validation failed' }, { status: 500 });
  }
}
