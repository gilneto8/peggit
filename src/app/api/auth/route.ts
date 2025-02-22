import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { RedditClient } from '@/lib/reddit';
import { Crypt } from '@/lib/crypt';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    const redditClient = RedditClient.getInstance();

    const isValidRedditUser = await redditClient.validateCredentials(username, password);
    if (!isValidRedditUser) {
      return NextResponse.json({ error: 'Invalid Reddit credentials' }, { status: 401 });
    }

    const { encryptedData, iv, authTag } = Crypt.encrypt(password);

    // Get or create user with encrypted credentials
    const userResult = await sql`
      INSERT INTO users (username, encrypted_password, password_iv, password_auth_tag)
      VALUES (${username}, ${encryptedData}, ${iv}, ${authTag})
      ON CONFLICT (username) 
      DO UPDATE SET 
        encrypted_password = ${encryptedData},
        password_iv = ${iv},
        password_auth_tag = ${authTag}
      RETURNING id
    `;
    const userId = userResult.rows[0].id;

    // Fetch or create default configuration
    const configResult = await sql`
      INSERT INTO configurations (user_id, general_context, top_posts_limit, top_comments_limit, last_hours, order_by, time_filter)
      VALUES (${userId}, '', 10, 10, 24, 'new', 'hour')
      ON CONFLICT (user_id)
      DO UPDATE SET user_id = ${userId}
      RETURNING id, general_context, top_posts_limit, top_comments_limit, last_hours, order_by, time_filter
    `;

    // Fetch forums for this configuration
    const forumsResult = await sql`
      SELECT id, identifier, specific_context
      FROM forums
      WHERE config_id = ${configResult.rows[0].id}
    `;

    // Fetch time ranges for this configuration
    const timeRangesResult = await sql`
      SELECT id, min, max
      FROM time_ranges
      WHERE config_id = ${configResult.rows[0].id}
    `;

    return NextResponse.json({
      success: true,
      userId: userId,
      configurations: {
        generalContext: configResult.rows[0].general_context || '',
        topPostLimit: configResult.rows[0].top_posts_limit || 10,
        topCommentsLimit: configResult.rows[0].top_comments_limit || 10,
        lastHours: configResult.rows[0].last_hours || 24,
        orderBy: configResult.rows[0].order_by || 'new',
        timeFilter: configResult.rows[0].time_filter || 'hour',
        forums: forumsResult.rows || [],
        timeRanges: timeRangesResult.rows || [],
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Authentication failed' }, { status: 500 });
  }
}
