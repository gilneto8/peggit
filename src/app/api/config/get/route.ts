import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

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
