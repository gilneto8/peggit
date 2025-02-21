import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { RedditClient } from '@/lib/reddit';
import { Crypt } from '@/lib/crypt';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subreddit = searchParams.get('name');
    const username = searchParams.get('username');
    const userId = searchParams.get('userId');

    if (!subreddit || !username || !userId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Get encrypted credentials
    const userResult = await sql`
      SELECT encrypted_password, password_iv, password_auth_tag
      FROM users 
      WHERE id = ${userId}
    `;

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { encrypted_password, password_iv, password_auth_tag } = userResult.rows[0];
    const password = Crypt.decrypt(encrypted_password, password_iv, password_auth_tag);

    const redditClient = RedditClient.getInstance();
    const client = await redditClient.initializeClient(username, password);
    const exists = await redditClient.validateSubReddit(client, subreddit);

    return NextResponse.json({ exists });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Validation failed' }, { status: 500 });
  }
}
