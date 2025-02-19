import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: Request) {
  try {
    const { username, timeRanges } = await request.json();

    // Get user and configuration IDs
    const userResult = await sql`
      SELECT u.id as user_id, c.id as config_id
      FROM users u
      LEFT JOIN configurations c ON c.user_id = u.id
      WHERE u.username = ${username}
    `;

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const configId = userResult.rows[0].config_id;

    // Delete existing time ranges
    await sql`DELETE FROM time_ranges WHERE config_id = ${configId}`;

    // Insert new time ranges
    if (timeRanges && timeRanges.length > 0) {
      await sql`
        INSERT INTO time_ranges (config_id, min, max)
        SELECT ${configId}, t.min, t.max
        FROM jsonb_to_recordset(${JSON.stringify(timeRanges)}::jsonb) 
        AS t(min float, max float)
      `;
    }

    // Fetch and return updated time ranges
    const updatedTimeRanges = await sql`
      SELECT id, min, max
      FROM time_ranges
      WHERE config_id = ${configId}
      ORDER BY min ASC
    `;

    return NextResponse.json({
      success: true,
      timeRanges: updatedTimeRanges.rows,
    });
  } catch (error) {
    console.error('Save time ranges error:', error);
    return NextResponse.json({ error: 'Failed to save time ranges' }, { status: 500 });
  }
}
