'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Response {
  id: string;
  question_id: number;
  question_text: string;
  answer_text: string;
  answer_score: number;
  category: string;
}

interface Attribute {
  id: string;
  attribute_type: 'experience' | 'skill';
  attribute_value: string;
}

interface Recommendation {
  category: string;
  title: string;
  description: string;
  link: string;
  priority: number;
}

interface AssessmentDetail {
  id: string;
  email: string;
  created_at: string;
  stage: string;
  total_score: number;
  god_score: number;
  others_score: number;
  disciples_score: number;
  sin_score: number;
  is_seeker_override: boolean;
  responses: Response[];
  attributes: Attribute[];
  recommendations: {
    stage_summary: string;
    recommendations_json: Recommendation[];
  } | null;
}

export default function AssessmentDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const response = await fetch(`/api/admin/assessments/${id}`);
        if (!response.ok) throw new Error('Failed to fetch');

        const data = await response.json();
        setAssessment(data);
      } catch (err) {
        setError('Failed to load assessment');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAssessment();
  }, [id]);

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Seeking': return 'bg-amber-100 text-amber-800';
      case 'Beginning': return 'bg-blue-100 text-blue-800';
      case 'Growing': return 'bg-green-100 text-green-800';
      case 'Multiplying': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'God': return 'bg-blue-100 text-blue-700';
      case 'Others': return 'bg-green-100 text-green-700';
      case 'Disciples': return 'bg-purple-100 text-purple-700';
      case 'Sin': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 2) return 'text-green-600';
    if (score >= 0) return 'text-gray-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Assessment not found'}</p>
          <Link href="/admin" className="text-teal-600 hover:text-teal-700">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const experiences = assessment.attributes.filter(a => a.attribute_type === 'experience');
  const skills = assessment.attributes.filter(a => a.attribute_type === 'skill');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/admin" className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Assessment Detail</h1>
                <p className="text-sm text-gray-500">{assessment.email}</p>
              </div>
            </div>
            <Link
              href={`/results/${assessment.id}`}
              target="_blank"
              className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              View Public Results
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Email</dt>
                  <dd className="text-gray-900 font-medium">{assessment.email}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Date</dt>
                  <dd className="text-gray-900">
                    {new Date(assessment.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-gray-500">Stage</dt>
                  <dd>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(assessment.stage)}`}>
                      {assessment.stage}
                    </span>
                    {assessment.is_seeker_override && (
                      <span className="ml-2 text-xs text-amber-600">(Q10 Override)</span>
                    )}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Total Score</dt>
                  <dd className="text-gray-900 font-bold">{assessment.total_score}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Scores</h2>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Relationship with God</span>
                    <span className="font-medium">{assessment.god_score}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${Math.max(0, (assessment.god_score + 10) / 20 * 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Relationship with Others</span>
                    <span className="font-medium">{assessment.others_score}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${Math.max(0, (assessment.others_score + 12) / 24 * 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Discipleship Practices</span>
                    <span className="font-medium">{assessment.disciples_score}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${Math.max(0, (assessment.disciples_score + 6) / 12 * 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Understanding of Sin</span>
                    <span className="font-medium">{assessment.sin_score}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${Math.max(0, (assessment.sin_score + 6) / 12 * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Responses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Question Responses</h2>
          <div className="space-y-3">
            {assessment.responses.map((response) => (
              <div
                key={response.id}
                className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">Q{response.question_id}.</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(response.category)}`}>
                      {response.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{response.question_text}</p>
                  <p className="text-sm font-medium text-gray-900">Answer: {response.answer_text}</p>
                </div>
                <span className={`text-sm font-bold ${getScoreColor(response.answer_score)}`}>
                  {response.answer_score > 0 ? '+' : ''}{response.answer_score}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Attributes */}
        {(experiences.length > 0 || skills.length > 0) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Selected Attributes</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {experiences.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Life Experiences</h3>
                  <div className="flex flex-wrap gap-2">
                    {experiences.map((attr) => (
                      <span key={attr.id} className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm">
                        {attr.attribute_value}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {skills.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Skills & Passions</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((attr) => (
                      <span key={attr.id} className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm">
                        {attr.attribute_value}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        {assessment.recommendations && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">AI Recommendations</h2>
            <p className="text-gray-600 mb-4">{assessment.recommendations.stage_summary}</p>

            <div className="space-y-3">
              {assessment.recommendations.recommendations_json
                .sort((a, b) => a.priority - b.priority)
                .map((rec, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">{rec.title}</span>
                          <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full">
                            {rec.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{rec.description}</p>
                      </div>
                      <a
                        href={rec.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-600 hover:text-teal-700 text-sm whitespace-nowrap"
                      >
                        Visit Link
                      </a>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
