import { notFound } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import type { Recommendation, RecommendationCategory } from '@/types';

// This page uses dynamic data fetching
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getAssessmentResults(id: string) {
  const supabase = getSupabaseAdmin();

  const { data: assessment, error: assessmentError } = await supabase
    .from('assessments')
    .select('*')
    .eq('id', id)
    .single();

  if (assessmentError || !assessment) {
    return null;
  }

  const { data: recommendations } = await supabase
    .from('recommendations')
    .select('*')
    .eq('assessment_id', id)
    .single();

  return {
    assessment,
    recommendations,
  };
}

function getStageHeader(stage: string): string {
  switch (stage) {
    case 'Seeking':
      return "You're Exploring!";
    case 'Beginning':
      return "You're Beginning!";
    case 'Growing':
      return "You're Growing!";
    case 'Multiplying':
      return "You're Multiplying!";
    default:
      return 'Your Results';
  }
}

function getCategoryIcon(category: RecommendationCategory) {
  switch (category) {
    case 'Community':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    case 'Resources':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    case 'Serving':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      );
    case 'Practices':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
    case 'Support':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
  }
}

function getCategoryColor(category: RecommendationCategory) {
  switch (category) {
    case 'Community':
      return 'bg-blue-100 text-blue-700';
    case 'Resources':
      return 'bg-purple-100 text-purple-700';
    case 'Serving':
      return 'bg-rose-100 text-rose-700';
    case 'Practices':
      return 'bg-amber-100 text-amber-700';
    case 'Support':
      return 'bg-emerald-100 text-emerald-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

export default async function ResultsPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getAssessmentResults(id);

  if (!result) {
    notFound();
  }

  const { assessment, recommendations } = result;
  const recs: Recommendation[] = recommendations?.recommendations_json || [];

  // Sort recommendations by priority
  const sortedRecs = [...recs].sort((a, b) => a.priority - b.priority);

  // Group by category
  const groupedRecs = sortedRecs.reduce((acc, rec) => {
    if (!acc[rec.category]) acc[rec.category] = [];
    acc[rec.category].push(rec);
    return acc;
  }, {} as Record<RecommendationCategory, Recommendation[]>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="MVCC Logo"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <h1 className="text-lg font-semibold text-gray-900">ConnectTrack Results</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Stage Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {getStageHeader(assessment.stage)}
          </h2>
          <div className="inline-block px-4 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium mb-4">
            {assessment.stage} Stage
          </div>
          {recommendations?.stage_summary && (
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              {recommendations.stage_summary}
            </p>
          )}
        </div>

        {/* Recommendations */}
        <div className="space-y-8">
          {Object.entries(groupedRecs).map(([category, categoryRecs]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className={`p-2 rounded-lg ${getCategoryColor(category as RecommendationCategory)}`}>
                  {getCategoryIcon(category as RecommendationCategory)}
                </span>
                {category}
              </h3>
              <div className="space-y-4">
                {categoryRecs.map((rec, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">{rec.title}</h4>
                        <p className="text-gray-600 mb-4">{rec.description}</p>
                        <a
                          href={rec.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
                        >
                          Learn More
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Start Over */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Start Over
          </Link>
        </div>

        {/* Footer Info */}
        <div className="mt-12 bg-gray-50 rounded-xl p-6 text-center">
          <p className="text-gray-600 mb-2">
            Questions about your results or want to connect with someone?
          </p>
          <p className="text-gray-500 text-sm">
            Contact us at{' '}
            <a href="mailto:info@mvccfrederick.com" className="text-teal-600 hover:underline">
              info@mvccfrederick.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
