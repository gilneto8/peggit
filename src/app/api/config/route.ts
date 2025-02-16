import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password, generalContext, forums } = await request.json();

    const configResult = await sql`
      INSERT INTO configurations (username, password, general_context)
      VALUES (${username}, ${password}, ${generalContext})
      RETURNING id
    `;
    
    const configId = configResult.rows[0].id;

    for (const forum of forums) {
      await sql`
        INSERT INTO forums (config_id, identifier, specific_context)
        VALUES (${configId}, ${forum.identifier}, ${forum.specificContext})
      `;
    }

    return NextResponse.json({ success: true, configId });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const config = await sql`
      SELECT c.*, json_agg(f.*) as forums
      FROM configurations c
      LEFT JOIN forums f ON c.id = f.config_id
      GROUP BY c.id
      ORDER BY c.id DESC
      LIMIT 1
    `;

    if (config.rows.length === 0) {
      return NextResponse.json({ data: null });
    }

    return NextResponse.json({ data: config.rows[0] });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 });
  }
}