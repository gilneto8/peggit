import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  try {
    const configResult = await sql`
      SELECT c.id, c.general_context
      FROM users u
      LEFT JOIN configurations c ON c.user_id = u.id
      WHERE u.username = ${username}
    `;

    if (configResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const forumsResult = await sql`
      SELECT id, identifier, specific_context
      FROM forums
      WHERE config_id = ${configResult.rows[0].id}
    `;

    const timeRangesResult = await sql`
      SELECT id, min, max
      FROM time_ranges
      WHERE config_id = ${configResult.rows[0].id}
    `;

    return NextResponse.json({
      success: true,
      configurations: {
        generalContext: configResult.rows[0].general_context || '',
        forums: forumsResult.rows || [],
        timeRanges: timeRangesResult.rows || [],
      },
    });
  } catch (error) {
    console.error('Error fetching configuration:', error);
    return NextResponse.json({ error: 'Failed to fetch configuration' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { username, generalContext, forums, timeRanges } = await request.json();

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

    // Insert new time ranges
    for (const timeRange of timeRanges) {
      await sql`
        INSERT INTO time_ranges (config_id, min, max)
        VALUES (${configId}, ${timeRange.min}, ${timeRange.max})
      `;
    }

    return NextResponse.json({ success: true, configId });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to save configuration' }, { status: 500 });
  }
}
