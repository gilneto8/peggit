import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: Request) {
  try {
    const { username, generalContext, forums } = await request.json();

    // Verify user credentials against database
    const userResult = await sql`
      SELECT id FROM users 
      WHERE username = ${username}
    `;

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = userResult.rows[0].id;

    // Insert or update configuration
    const configResult = await sql`
      INSERT INTO configurations (user_id, general_context)
      VALUES (${userId}, ${generalContext})
      ON CONFLICT (user_id) 
      DO UPDATE SET general_context = ${generalContext}
      RETURNING id
    `;

    const configId = configResult.rows[0].id;

    // Delete existing forums for this config
    await sql`
      DELETE FROM forums 
      WHERE config_id = ${configId}
    `;

    // Insert new forums
    for (const forum of forums) {
      await sql`
        INSERT INTO forums (config_id, identifier, specific_context)
        VALUES (${configId}, ${forum.identifier}, ${forum.specificContext})
      `;
    }

    return NextResponse.json({ success: true, configId });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to save configuration' }, { status: 500 });
  }
}
