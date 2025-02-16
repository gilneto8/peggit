import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Check reddit API first
    const externalValidation = await fetch('https://external-auth-api.com/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!externalValidation.ok) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Check if user exists in our database
    const userResult = await sql`
      SELECT username FROM users 
      WHERE username = ${username} AND password = ${password}
    `;

    if (userResult.rows.length === 0) {
      // Add new user if externally validated but not in our database
      await sql`
        INSERT INTO users (username, password)
        VALUES (${username}, ${password})
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Authentication failed' },
      { status: 500 }
    );
  }
}