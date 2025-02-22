import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const configResult = await sql`
      SELECT c.id, c.general_context, c.top_posts_limit, c.top_comments_limit, c.last_hours, c.order_by, c.time_filter
      FROM users u
      LEFT JOIN configurations c ON c.user_id = u.id
      WHERE u.id = ${userId}
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
        topPostsLimit: configResult.rows[0].top_posts_limit || 10,
        topCommentsLimit: configResult.rows[0].top_comments_limit || 10,
        lastHours: configResult.rows[0].last_hours || 24,
        orderBy: configResult.rows[0].order_by || 'new',
        timeFilter: configResult.rows[0].time_filter || 'hour',
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
    const { userId, generalContext, forums, timeRanges, topPostsLimit, topCommentsLimit, lastHours, orderBy, timeFilter } =
      await request.json();

    // Verify user credentials against database
    const userResult = await sql`
      SELECT id FROM users 
      WHERE id = ${userId}
    `;

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Insert or update configuration
    const configResult = await sql`
      INSERT INTO configurations (user_id, general_context, top_posts_limit, top_comments_limit, last_hours, order_by, time_filter)
      VALUES (${userId}, ${generalContext}, ${topPostsLimit}, ${topCommentsLimit}, ${lastHours}, ${orderBy}, ${timeFilter})
      ON CONFLICT (user_id) 
      DO UPDATE SET general_context = ${generalContext}, top_posts_limit = ${topPostsLimit}, top_comments_limit = ${topCommentsLimit}, last_hours = ${lastHours}, order_by = ${orderBy}, time_filter = ${timeFilter}
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

    // Delete existing time ranges for this config
    await sql`
      DELETE FROM time_ranges 
      WHERE config_id = ${configId}
    `;

    // Insert new time ranges
    for (const timeRange of timeRanges) {
      await sql`
        INSERT INTO time_ranges (config_id, min, max)
        VALUES (${configId}, ${timeRange.min}, ${timeRange.max})
      `;
    }

    return NextResponse.json({
      success: true,
      configId,
      configurations: { userId, generalContext, forums, timeRanges, topPostsLimit, topCommentsLimit, lastHours, orderBy, timeFilter },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to save configuration' }, { status: 500 });
  }
}
