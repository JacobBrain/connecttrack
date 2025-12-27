import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();

    // Fetch assessment
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', id)
      .single();

    if (assessmentError || !assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // Fetch responses
    const { data: responses } = await supabase
      .from('responses')
      .select('*')
      .eq('assessment_id', id)
      .order('question_id', { ascending: true });

    // Fetch attributes
    const { data: attributes } = await supabase
      .from('attributes')
      .select('*')
      .eq('assessment_id', id);

    // Fetch recommendations
    const { data: recommendations } = await supabase
      .from('recommendations')
      .select('*')
      .eq('assessment_id', id)
      .single();

    return NextResponse.json({
      ...assessment,
      responses: responses || [],
      attributes: attributes || [],
      recommendations: recommendations || null,
    });
  } catch (error) {
    console.error('Admin assessment detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
