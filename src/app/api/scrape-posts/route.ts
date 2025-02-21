import { NextResponse } from 'next/server';
import { z } from 'zod';

// Zod schema for type validation (similar to Pydantic)
const TimeFilterSchema = z.enum(['hour', 'day', 'week', 'month', 'year', 'all']);

const ScrapeRequestSchema = z
  .object({
    user_id: z.string(),
    order_by: z.enum(['top', 'new']),
    last_hours: z.number().optional(),
    time_filter: TimeFilterSchema.optional(),
    top_posts_limit: z.number().min(1).max(100),
    top_comments_limit: z.number().min(1).max(100),
  })
  .refine(
    data => {
      if (data.order_by === 'new' && !data.last_hours) {
        throw new Error("'last_hours' is required when order_by is 'new'");
      }
      if (data.order_by === 'top' && !data.time_filter) {
        throw new Error("'time_filter' is required when order_by is 'top'");
      }
      return true;
    },
    { message: 'Invalid request parameters' },
  );

export async function POST(request: Request) {
  try {
    // Parse and validate incoming request body
    const body = await request.json();
    const validatedData = ScrapeRequestSchema.parse(body);

    // Fetch the API_URL from environment variables
    const apiUrl = process.env.API_URL;
    if (!apiUrl) {
      return NextResponse.json({ error: 'API_URL is not configured' }, { status: 500 });
    }

    // Forward the request to the external API
    const apiResponse = await fetch(`${apiUrl}/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      return NextResponse.json({ error: 'Failed to fetch posts', details: errorText }, { status: apiResponse.status });
    }

    // Parse and return the API response
    const data = await apiResponse.json();
    return NextResponse.json({
      success: true,
      data: data.data,
    });
  } catch (error) {
    console.error('Scrape posts error:', error);

    if (error instanceof z.ZodError) {
      // Handle validation errors
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 },
      );
    }

    // Handle other errors
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
