'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { questions, experiences, skills } from '@/lib/questions';
import type { QuestionResponse } from '@/types';

export default function QuestionnairePage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<number, QuestionResponse>>({});
  const [selectedExperiences, setSelectedExperiences] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('connecttrack_email');
    if (!storedEmail) {
      router.push('/');
      return;
    }
    setEmail(storedEmail);
  }, [router]);

  const handleAnswerSelect = (questionId: number, answerText: string, score: number) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: { questionId, answerText, score }
    }));
  };

  const toggleExperience = (experience: string) => {
    setSelectedExperiences(prev =>
      prev.includes(experience)
        ? prev.filter(e => e !== experience)
        : [...prev, experience]
    );
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleSubmit = async () => {
    if (!email) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          responses: Object.values(responses),
          experiences: selectedExperiences,
          skills: selectedSkills
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit assessment');
      }

      const data = await response.json();
      router.push(`/results/${data.assessmentId}`);
    } catch (error) {
      console.error('Submit error:', error);
      alert('There was an error submitting your assessment. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'God': return 'Relationship with God';
      case 'Others': return 'Relationship with Others';
      case 'Disciples': return 'Discipleship Practices';
      case 'Sin': return 'Understanding of Sin';
      default: return category;
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <h1 className="text-lg font-semibold text-gray-900">Spiritual Growth Assessment</h1>
            </div>
            <span className="text-sm text-gray-500">
              {Object.keys(responses).length} of {questions.length} answered
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <p className="text-gray-600">
            Answer honestly about where you are today, not where you want to be.
            All questions are optional - skip any you prefer not to answer.
          </p>
        </div>

        {/* Questions in numerical order */}
        <div className="space-y-4 mb-8">
          {questions.map(question => (
            <div
              key={question.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <p className="text-gray-900 font-medium">
                  {question.id}. {question.text}
                </p>
                <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${getCategoryColor(question.category)}`}>
                  {getCategoryLabel(question.category)}
                </span>
              </div>
              <div className="grid gap-2">
                {question.answers.map((answer, idx) => (
                  <label
                    key={idx}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      responses[question.id]?.answerText === answer.text
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={answer.text}
                      checked={responses[question.id]?.answerText === answer.text}
                      onChange={() => handleAnswerSelect(question.id, answer.text, answer.score)}
                      className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-gray-700">{answer.text}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Attributes Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-teal-600 rounded-full"></span>
            Life Experiences (Optional)
          </h2>
          <p className="text-gray-600 mb-4">
            Select any that apply to help us provide relevant support resources.
          </p>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="grid gap-2">
              {experiences.map(experience => (
                <label
                  key={experience}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedExperiences.includes(experience)
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedExperiences.includes(experience)}
                    onChange={() => toggleExperience(experience)}
                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <span className="text-gray-700">{experience}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-teal-600 rounded-full"></span>
            Skills & Passions (Optional)
          </h2>
          <p className="text-gray-600 mb-4">
            Select areas where you might enjoy serving or have experience.
          </p>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="grid gap-2 sm:grid-cols-2">
              {skills.map(skill => (
                <label
                  key={skill}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedSkills.includes(skill)
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedSkills.includes(skill)}
                    onChange={() => toggleSkill(skill)}
                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <span className="text-gray-700">{skill}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="sticky bottom-0 bg-gray-50 py-4 border-t border-gray-200 -mx-4 px-4">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating Your Recommendations...
              </span>
            ) : (
              'Get Your Recommendations'
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
