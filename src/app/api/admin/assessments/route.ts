import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);

    // Get filter parameters
    const stage = searchParams.get('stage');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = supabase
      .from('assessments')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (stage && stage !== 'all') {
      query = query.eq('stage', stage);
    }

    if (search) {
      query = query.ilike('email', `%${search}%`);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data: assessments, error } = await query;

    if (error) {
      console.error('Error fetching assessments:', error);
      return NextResponse.json({ error: 'Failed to fetch assessments' }, { status: 500 });
    }

    return NextResponse.json(assessments);
  } catch (error) {
    console.error('Admin assessments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
