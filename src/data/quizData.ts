export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

// Easy Level Questions
export const easyQuestions: Question[] = [
  {
    id: 1,
    question: "What does AI stand for?",
    options: [
      "Artificial Intelligence",
      "Automated Integration",
      "Advanced Information",
      "Autonomous Innovation"
    ],
    correctAnswer: 0,
    difficulty: 'easy'
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
    correctAnswer: 1,
    difficulty: 'easy'
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
    correctAnswer: 1,
    difficulty: 'easy'
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
    correctAnswer: 2,
    difficulty: 'easy'
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
    correctAnswer: 1,
    difficulty: 'easy'
  }
];

// Medium Level Questions
export const mediumQuestions: Question[] = [
  {
    id: 6,
    question: "What is the primary purpose of a neural network's activation function?",
    options: [
      "To store data",
      "To introduce non-linearity",
      "To reduce memory usage",
      "To speed up computation"
    ],
    correctAnswer: 1,
    difficulty: 'medium'
  },
  {
    id: 7,
    question: "Which algorithm is commonly used for image classification?",
    options: [
      "Linear Regression",
      "Decision Trees",
      "Convolutional Neural Networks",
      "K-Means Clustering"
    ],
    correctAnswer: 2,
    difficulty: 'medium'
  },
  {
    id: 8,
    question: "What does 'overfitting' mean in machine learning?",
    options: [
      "Model performs well on training data but poorly on new data",
      "Model is too simple",
      "Training takes too long",
      "Model uses too much memory"
    ],
    correctAnswer: 0,
    difficulty: 'medium'
  },
  {
    id: 9,
    question: "Which technique is used to prevent overfitting?",
    options: [
      "Increasing model complexity",
      "Using more training data",
      "Dropout regularization",
      "Both B and C"
    ],
    correctAnswer: 3,
    difficulty: 'medium'
  },
  {
    id: 10,
    question: "What is the purpose of backpropagation in neural networks?",
    options: [
      "To feed data forward",
      "To adjust weights based on error",
      "To initialize weights",
      "To normalize input data"
    ],
    correctAnswer: 1,
    difficulty: 'medium'
  }
];

// Hard Level Questions
export const hardQuestions: Question[] = [
  {
    id: 11,
    question: "What is the vanishing gradient problem in deep neural networks?",
    options: [
      "Gradients become too large during backpropagation",
      "Gradients become extremely small, hindering learning in early layers",
      "The model stops learning completely",
      "Memory usage increases exponentially"
    ],
    correctAnswer: 1,
    difficulty: 'hard'
  },
  {
    id: 12,
    question: "Which optimization algorithm uses adaptive learning rates for each parameter?",
    options: [
      "Stochastic Gradient Descent",
      "Momentum",
      "Adam (Adaptive Moment Estimation)",
      "Mini-batch Gradient Descent"
    ],
    correctAnswer: 2,
    difficulty: 'hard'
  },
  {
    id: 13,
    question: "What is the purpose of batch normalization in deep learning?",
    options: [
      "To reduce the number of parameters",
      "To normalize inputs and stabilize learning",
      "To increase model accuracy",
      "To reduce training time only"
    ],
    correctAnswer: 1,
    difficulty: 'hard'
  },
  {
    id: 14,
    question: "In transfer learning, what is 'fine-tuning'?",
    options: [
      "Training a model from scratch",
      "Adjusting pre-trained model weights for a new task",
      "Increasing the learning rate",
      "Removing layers from the model"
    ],
    correctAnswer: 1,
    difficulty: 'hard'
  },
  {
    id: 15,
    question: "What is the main advantage of using attention mechanisms in neural networks?",
    options: [
      "Faster training",
      "Less memory usage",
      "Ability to focus on relevant parts of input",
      "Simpler architecture"
    ],
    correctAnswer: 2,
    difficulty: 'hard'
  }
];

export const getQuestionsByDifficulty = (difficulty: DifficultyLevel): Question[] => {
  switch (difficulty) {
    case 'easy':
      return easyQuestions;
    case 'medium':
      return mediumQuestions;
    case 'hard':
      return hardQuestions;
    default:
      return easyQuestions;
  }
};

// Legacy export for backward compatibility
export const quizQuestions = easyQuestions;
