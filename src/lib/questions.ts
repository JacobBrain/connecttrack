import { Question } from '@/types';

export const questions: Question[] = [
  {
    id: 1,
    text: "I read/study the Bible to grow in my faith.",
    category: "Disciples",
    answers: [
      { text: "Never", score: -2 },
      { text: "Occasionally", score: -1 },
      { text: "1-3 times/week", score: 1 },
      { text: "4+ times/week", score: 2 }
    ]
  },
  {
    id: 2,
    text: "I pray...",
    category: "Disciples",
    answers: [
      { text: "Never", score: -2 },
      { text: "Sometimes", score: -1 },
      { text: "Often", score: 1 },
      { text: "Continually and Consistently", score: 2 }
    ]
  },
  {
    id: 3,
    text: "I talk to others about Jesus and my faith.",
    category: "Others",
    answers: [
      { text: "Never", score: -2 },
      { text: "Rarely", score: -1 },
      { text: "Sometimes", score: 1 },
      { text: "Weekly", score: 2 }
    ]
  },
  {
    id: 4,
    text: "I financially give to support my local church.",
    category: "Disciples",
    answers: [
      { text: "Never", score: -2 },
      { text: "Occasionally", score: -1 },
      { text: "Regularly", score: 1 },
      { text: "Sacrificially", score: 2 }
    ]
  },
  {
    id: 5,
    text: "I actively invest my time in others by serving them.",
    category: "Others",
    answers: [
      { text: "Never", score: -2 },
      { text: "Rarely", score: -1 },
      { text: "Sometimes", score: 1 },
      { text: "Regularly", score: 2 }
    ]
  },
  {
    id: 6,
    text: "I meet with a group of other followers of Jesus outside of worship services.",
    category: "Others",
    answers: [
      { text: "Never", score: -2 },
      { text: "Rarely", score: -1 },
      { text: "Sometimes", score: 1 },
      { text: "Consistently", score: 2 }
    ]
  },
  {
    id: 7,
    text: "When making an important decision, I seek wisdom through the Bible, prayer, and counsel.",
    category: "God",
    answers: [
      { text: "Never", score: -2 },
      { text: "Rarely", score: -1 },
      { text: "Sometimes", score: 1 },
      { text: "Regularly", score: 2 }
    ]
  },
  {
    id: 8,
    text: "I make attending church a priority.",
    category: "Others",
    answers: [
      { text: "Never", score: -2 },
      { text: "Less than once a month", score: -1 },
      { text: "1-2 times/month", score: 1 },
      { text: "More than twice/month", score: 2 }
    ]
  },
  {
    id: 9,
    text: "I believe my salvation depends on my good works for God.",
    category: "God",
    answers: [
      { text: "Strongly Agree", score: -2 },
      { text: "Agree", score: -1 },
      { text: "Disagree", score: 1 },
      { text: "Strongly Disagree", score: 2 }
    ]
  },
  {
    id: 10,
    text: "I have made a decision to become a follower of Jesus.",
    category: "God",
    answers: [
      { text: "No", score: -2 },
      { text: "I'm unsure", score: 0 },
      { text: "Yes", score: 2 }
    ]
  },
  {
    id: 11,
    text: "I would describe my relationship with God as...",
    category: "God",
    answers: [
      { text: "Non-existent", score: -2 },
      { text: "Distant and cold", score: -1 },
      { text: "Growing", score: 1 },
      { text: "Personal and intimate", score: 2 }
    ]
  },
  {
    id: 12,
    text: "I know the unique roles and distinctions of God the Father, Jesus the Son, and the Holy Spirit.",
    category: "God",
    answers: [
      { text: "Strongly Disagree", score: -2 },
      { text: "Disagree", score: -1 },
      { text: "Agree", score: 1 },
      { text: "Strongly Agree", score: 2 }
    ]
  },
  {
    id: 13,
    text: "When I hear the word \"sin\" I think...",
    category: "Sin",
    answers: [
      { text: "What is that?", score: -2 },
      { text: "It's a bit judgmental", score: -1 },
      { text: "Something I battle daily", score: 1 },
      { text: "Thankful it no longer defines me", score: 2 }
    ]
  },
  {
    id: 14,
    text: "Those who know me best would say that I show the love of Jesus in my attitude and actions.",
    category: "Others",
    answers: [
      { text: "Never", score: -2 },
      { text: "Rarely", score: -1 },
      { text: "Sometimes", score: 1 },
      { text: "Often", score: 2 }
    ]
  },
  {
    id: 15,
    text: "I believe I am a sinner.",
    category: "Sin",
    answers: [
      { text: "No", score: -2 },
      { text: "Unsure", score: 0 },
      { text: "Yes", score: 2 }
    ]
  },
  {
    id: 16,
    text: "When confronted on something I have done wrong, others would say I typically respond by...",
    category: "Sin",
    answers: [
      { text: "Denying any such wrong", score: -2 },
      { text: "Getting angry or defensive", score: -1 },
      { text: "Apologizing and seeking forgiveness", score: 1 },
      { text: "Seeking to understand the situation to make it right", score: 2 }
    ]
  }
];

export const experiences = [
  "You have been divorced",
  "You have struggled with addiction",
  "You are dealing with grief/loss",
  "You are experiencing financial stress",
  "You are in a difficult marriage",
  "You are a single parent",
  "You are involved in foster care or considering it"
];

export const skills = [
  "Administration/Organization",
  "Teaching/Education",
  "Music/Worship",
  "Hospitality/Greeting",
  "Outreach/Evangelism",
  "Working with children",
  "Working with youth/students",
  "Technical/AV/Production",
  "Counseling/Mentoring",
  "Building/Maintenance"
];

export function calculateStage(totalScore: number, question10Answer: string): string {
  // Question 10 override: if not a follower, always Seeking
  if (question10Answer === "No" || question10Answer === "I'm unsure") {
    return "Seeking";
  }

  // Normal score-based calculation
  if (totalScore < 0) return "Seeking";
  if (totalScore <= 10) return "Beginning";
  if (totalScore <= 20) return "Growing";
  return "Multiplying";
}

export function calculateCategoryScores(responses: { questionId: number; score: number }[]) {
  const categoryScores = {
    god_score: 0,
    others_score: 0,
    disciples_score: 0,
    sin_score: 0
  };

  responses.forEach(response => {
    const question = questions.find(q => q.id === response.questionId);
    if (question) {
      switch (question.category) {
        case 'God':
          categoryScores.god_score += response.score;
          break;
        case 'Others':
          categoryScores.others_score += response.score;
          break;
        case 'Disciples':
          categoryScores.disciples_score += response.score;
          break;
        case 'Sin':
          categoryScores.sin_score += response.score;
          break;
      }
    }
  });

  return categoryScores;
}
