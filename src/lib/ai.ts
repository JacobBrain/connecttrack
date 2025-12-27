import Anthropic from '@anthropic-ai/sdk';
import { getResourcesForPrompt } from './resources';
import type { Recommendation, QuestionResponse } from '@/types';
import { questions, calculateStage, calculateCategoryScores } from './questions';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface GenerateRecommendationsInput {
  email: string;
  responses: QuestionResponse[];
  experiences: string[];
  skills: string[];
}

interface GenerateRecommendationsOutput {
  stage: string;
  stageSummary: string;
  recommendations: Recommendation[];
  totalScore: number;
  categoryScores: {
    god_score: number;
    others_score: number;
    disciples_score: number;
    sin_score: number;
  };
  isSeekerOverride: boolean;
}

export async function generateRecommendations(
  input: GenerateRecommendationsInput
): Promise<GenerateRecommendationsOutput> {
  const { email, responses, experiences, skills } = input;

  // Calculate total score
  const totalScore = responses.reduce((sum, r) => sum + r.score, 0);

  // Get question 10 answer for stage override
  const question10Response = responses.find(r => r.questionId === 10);
  const question10Answer = question10Response?.answerText || '';

  // Calculate stage with Question 10 override
  const stage = calculateStage(totalScore, question10Answer);
  const isSeekerOverride =
    (question10Answer === 'No' || question10Answer === "I'm unsure") && totalScore >= 0;

  // Calculate category scores
  const categoryScores = calculateCategoryScores(responses);

  // Format responses for AI prompt
  const formattedResponses = responses.map(r => {
    const question = questions.find(q => q.id === r.questionId);
    return `Q${r.questionId}: "${question?.text}" - Answer: "${r.answerText}"`;
  }).join('\n');

  // Build the prompt
  const prompt = `You are a pastoral counselor for Mountain View Community Church (MVCC) in Frederick, Maryland. Based on this person's spiritual assessment, provide personalized recommendations for their next steps in faith.

## Person's Assessment Results

**Email:** ${email}
**Spiritual Stage:** ${stage}
**Total Score:** ${totalScore}
${isSeekerOverride ? '**Note:** This person indicated they have not yet made a decision to follow Jesus or are unsure.' : ''}

**Category Scores:**
- Relationship with God: ${categoryScores.god_score}
- Relationship with Others: ${categoryScores.others_score}
- Discipleship Practices: ${categoryScores.disciples_score}
- Understanding of Sin: ${categoryScores.sin_score}

**Question Responses:**
${formattedResponses}

**Life Experiences:** ${experiences.length > 0 ? experiences.join(', ') : 'None selected'}
**Skills/Passions:** ${skills.length > 0 ? skills.join(', ') : 'None selected'}

## Available MVCC Resources
${getResourcesForPrompt()}

## Instructions

Provide 4-8 specific, prioritized recommendations. For each:
1. Select from the available MVCC resources list (don't invent resources that don't exist)
2. Explain WHY this resource fits their current stage and responses
3. Make it personal and encouraging, not generic
4. If they selected life experiences (like grief, divorce, etc.), prioritize relevant support resources
5. If they selected skills/passions, include relevant serving opportunities
6. If they are in the Seeking stage, prioritize welcoming, low-pressure opportunities to explore faith

Format as JSON:
{
  "stage_summary": "2-3 sentence encouraging description of where they are in their spiritual journey",
  "recommendations": [
    {
      "category": "Community|Resources|Serving|Practices|Support",
      "title": "Resource name exactly as listed",
      "description": "2-3 sentence personalized explanation of why this fits them. Reference their actual answers.",
      "link": "URL from the resources list",
      "priority": 1-5 (1 = highest priority)
    }
  ]
}

Tone Guidelines:
- Warm and pastoral, like a caring friend
- Encouraging, not prescriptive ("You might enjoy..." not "You must...")
- Grace-filled approach to growth areas
- Reference their specific answers when explaining recommendations
- If they're in the Seeking stage, be especially welcoming and non-judgmental`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  // Parse the AI response
  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from AI');
  }

  // Extract JSON from the response
  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse AI response as JSON');
  }

  const aiResponse = JSON.parse(jsonMatch[0]);

  return {
    stage,
    stageSummary: aiResponse.stage_summary,
    recommendations: aiResponse.recommendations,
    totalScore,
    categoryScores,
    isSeekerOverride,
  };
}
