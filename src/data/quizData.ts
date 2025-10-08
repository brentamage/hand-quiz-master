export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export const quizQuestions: Question[] = [
  {
    id: 1,
    question: "What does AI stand for?",
    options: [
      "Artificial Intelligence",
      "Automated Integration",
      "Advanced Information",
      "Autonomous Innovation"
    ],
    correctAnswer: 0
  },
  {
    id: 2,
    question: "Which programming language is commonly used for machine learning?",
    options: [
      "Java",
      "Python",
      "C++",
      "Ruby"
    ],
    correctAnswer: 1
  },
  {
    id: 3,
    question: "What is TensorFlow?",
    options: [
      "A web framework",
      "A machine learning library",
      "A database system",
      "A mobile app platform"
    ],
    correctAnswer: 1
  },
  {
    id: 4,
    question: "Which company developed the Teachable Machine platform?",
    options: [
      "Microsoft",
      "Apple",
      "Google",
      "Amazon"
    ],
    correctAnswer: 2
  },
  {
    id: 5,
    question: "What is gesture recognition a part of?",
    options: [
      "Natural Language Processing",
      "Computer Vision",
      "Audio Processing",
      "Data Mining"
    ],
    correctAnswer: 1
  }
];
