import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { generateRecommendations } from '@/lib/ai';
import { questions } from '@/lib/questions';
import type { SubmitAssessmentRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: SubmitAssessmentRequest = await request.json();
    const { email, responses, experiences, skills } = body;

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Generate AI recommendations
    const aiResult = await generateRecommendations({
      email,
      responses,
      experiences,
      skills,
    });

    const supabase = getSupabaseAdmin();

    // Create assessment record
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .insert({
        email,
        total_score: aiResult.totalScore,
        stage: aiResult.stage,
        god_score: aiResult.categoryScores.god_score,
        others_score: aiResult.categoryScores.others_score,
        disciples_score: aiResult.categoryScores.disciples_score,
        sin_score: aiResult.categoryScores.sin_score,
        is_seeker_override: aiResult.isSeekerOverride,
      })
      .select()
      .single();

    if (assessmentError) {
      console.error('Assessment insert error:', assessmentError);
      throw new Error('Failed to save assessment');
    }

    // Save responses
    const responseRecords = responses.map(r => {
      const question = questions.find(q => q.id === r.questionId);
      return {
        assessment_id: assessment.id,
        question_id: r.questionId,
        question_text: question?.text || '',
        answer_text: r.answerText,
        answer_score: r.score,
        category: question?.category || '',
      };
    });

    if (responseRecords.length > 0) {
      const { error: responsesError } = await supabase
        .from('responses')
        .insert(responseRecords);

      if (responsesError) {
        console.error('Responses insert error:', responsesError);
      }
    }

    // Save attributes (experiences and skills)
    const attributeRecords = [
      ...experiences.map(exp => ({
        assessment_id: assessment.id,
        attribute_type: 'experience' as const,
        attribute_value: exp,
      })),
      ...skills.map(skill => ({
        assessment_id: assessment.id,
        attribute_type: 'skill' as const,
        attribute_value: skill,
      })),
    ];

    if (attributeRecords.length > 0) {
      const { error: attributesError } = await supabase
        .from('attributes')
        .insert(attributeRecords);

      if (attributesError) {
        console.error('Attributes insert error:', attributesError);
      }
    }

    // Save recommendations
    const { error: recommendationsError } = await supabase
      .from('recommendations')
      .insert({
        assessment_id: assessment.id,
        stage_summary: aiResult.stageSummary,
        recommendations_json: aiResult.recommendations,
      });

    if (recommendationsError) {
      console.error('Recommendations insert error:', recommendationsError);
    }

    return NextResponse.json({
      assessmentId: assessment.id,
      stage: aiResult.stage,
      stageSummary: aiResult.stageSummary,
      recommendations: aiResult.recommendations,
    });
  } catch (error) {
    console.error('Submit error:', error);
    return NextResponse.json(
      { error: 'Failed to process assessment' },
      { status: 500 }
    );
  }
}
