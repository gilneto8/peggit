import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { RedditClient } from '@/lib/reddit';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    const redditClient = RedditClient.getInstance();
    redditClient.setUserInfo(username, password);

    const isValidRedditUser = await redditClient.validateCredentials();
    if (!isValidRedditUser) {
      return NextResponse.json({ error: 'Invalid Reddit credentials' }, { status: 401 });
    }

    // Get or create user
    let userId;
    const userResult = await sql`
      SELECT id, username FROM users 
      WHERE username = ${username}
    `;

    if (userResult.rows.length === 0) {
      const newUser = await sql`
        INSERT INTO users (username)
        VALUES (${username})
        RETURNING id
      `;
      userId = newUser.rows[0].id;
    } else {
      userId = userResult.rows[0].id;
    }

    // Fetch configurations
    const configResult = await sql`
      SELECT id, general_context
      FROM configurations
      WHERE user_id = ${userId}
    `;

    const forumsResult = await sql`
      SELECT id, identifier, specific_context
      FROM forums
      WHERE config_id = ${configResult.rows[0]?.id}
    `;

    return NextResponse.json({
      success: true,
      configurations: {
        generalContext: configResult.rows[0]?.general_context || '',
        forums: forumsResult.rows || [],
      },
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Authentication failed' }, { status: 500 });
  }
}
