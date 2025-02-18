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
      INSERT INTO configurations (user_id, general_context)
      VALUES (${userId}, '')
      ON CONFLICT (user_id)
      DO UPDATE SET user_id = ${userId}
      RETURNING id, general_context
    `;

    // Fetch forums for this configuration
    const forumsResult = await sql`
      SELECT id, identifier, specific_context
      FROM forums
      WHERE config_id = ${configResult.rows[0].id}
    `;

    return NextResponse.json({
      success: true,
      configurations: {
        generalContext: configResult.rows[0].general_context || '',
        forums: forumsResult.rows || [],
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Authentication failed' }, { status: 500 });
  }
}
