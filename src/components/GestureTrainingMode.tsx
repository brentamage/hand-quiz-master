import { useState, useEffect } from 'react';
import { Hand, CheckCircle, XCircle, Target, Sparkles, Trophy, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import WebcamGestureDetector from './WebcamGestureDetector';

interface PoseLesson {
  id: string;
  pose: string;
  name: string;
  description: string;
  tips: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

const poseLessons: PoseLesson[] = [
  {
    id: 'pose-a',
    pose: 'A',
    name: 'Pose A',
    description: 'Show the "A" pose clearly to the camera',
    tips: [
      'Keep your body steady and centered',
      'Ensure good lighting on your body',
      'Hold the pose for 2 seconds',
      'Keep your pose clearly visible'
    ],
    difficulty: 'easy'
  },
  {
    id: 'pose-b',
    pose: 'B',
    name: 'Pose B',
    description: 'Show the "B" pose clearly to the camera',
    tips: [
      'Make the pose distinct from A',
      'Hold steady in the camera frame',
      'Maintain consistent body position',
      'Avoid quick movements'
    ],
    difficulty: 'easy'
  },
  {
    id: 'pose-c',
    pose: 'C',
    name: 'Pose C',
    description: 'Show the "C" pose clearly to the camera',
    tips: [
      'Form a clear C shape',
      'Keep body at medium distance',
      'Ensure all body parts are visible',
      'Hold for full detection'
    ],
    difficulty: 'medium'
  },
  {
    id: 'pose-d',
    pose: 'D',
    name: 'Pose D',
    description: 'Show the "D" pose clearly to the camera',
    tips: [
      'Make a distinct D pose',
      'Keep body centered in frame',
      'Maintain good contrast',
      'Hold steady for 2 seconds'
    ],
    difficulty: 'medium'
  },
  {
    id: 'pose-next',
    pose: 'Next',
    name: 'Next Pose',
    description: 'Show the "Next" pose to navigate forward',
    tips: [
      'Use a clear forward motion',
      'Keep pose consistent',
      'Hold at the end position',
      'Ensure camera can see full pose'
    ],
    difficulty: 'hard'
  },
  {
    id: 'pose-previous',
    pose: 'Previous',
    name: 'Previous Pose',
    description: 'Show the "Previous" pose to navigate backward',
    tips: [
      'Use a clear backward motion',
      'Mirror the Next pose',
      'Hold at the end position',
      'Keep movements smooth'
    ],
    difficulty: 'hard'
  }
];

interface PoseTrainingModeProps {
  onComplete?: () => void;
  onExit?: () => void;
}

const PoseTrainingMode = ({ onComplete, onExit }: PoseTrainingModeProps) => {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [successes, setSuccesses] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  const currentLesson = poseLessons[currentLessonIndex];
  const progress = (completedLessons.size / poseLessons.length) * 100;

  useEffect(() => {
    if (detectionStatus !== 'idle') {
      const timer = setTimeout(() => setDetectionStatus('idle'), 2000);
      return () => clearTimeout(timer);
    }
  }, [detectionStatus]);

  const handlePoseDetected = (pose: string) => {
    if (!isDetecting) return;

    const normalizedPose = pose.toLowerCase().trim().replace('.', '');
    const expectedPose = currentLesson.pose.toLowerCase();

    setAttempts(prev => prev + 1);

    if (normalizedPose === expectedPose) {
      setSuccesses(prev => prev + 1);
      setDetectionStatus('success');
      setCompletedLessons(prev => new Set([...prev, currentLesson.id]));
      
      setTimeout(() => {
        if (currentLessonIndex < poseLessons.length - 1) {
          setCurrentLessonIndex(prev => prev + 1);
          setIsDetecting(false);
        } else {
          onComplete?.();
        }
      }, 1500);
    } else {
      setDetectionStatus('error');
    }
  };

  const handleNext = () => {
    if (currentLessonIndex < poseLessons.length - 1) {
      setCurrentLessonIndex(prev => prev + 1);
      setIsDetecting(false);
      setDetectionStatus('idle');
    }
  };

  const handlePrevious = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(prev => prev - 1);
      setIsDetecting(false);
      setDetectionStatus('idle');
    }
  };

  const difficultyColors = {
    easy: 'text-green-500 bg-green-500/10 border-green-500/30',
    medium: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30',
    hard: 'text-red-500 bg-red-500/10 border-red-500/30'
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8 fade-in-up">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Hand className="w-12 h-12 text-accent" />
            <h1 className="text-5xl font-bold text-shimmer">Pose Training</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Master body poses with guided practice
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 fade-in-up delay-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-accent font-bold">{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-card rounded-full overflow-hidden border border-accent/20">
            <div 
              className="h-full bg-gradient-accent transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{completedLessons.size} / {poseLessons.length} completed</span>
            <span>Accuracy: {attempts > 0 ? Math.round((successes / attempts) * 100) : 0}%</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Webcam */}
          <div className="space-y-6 fade-in-up delay-300">
            <WebcamGestureDetector onGestureDetected={handlePoseDetected} />
            
            {/* Detection Status */}
            {detectionStatus !== 'idle' && (
              <div className={`p-4 rounded-xl border-2 animate-pulse-once ${
                detectionStatus === 'success' 
                  ? 'bg-success/10 border-success' 
                  : 'bg-destructive/10 border-destructive'
              }`}>
                <div className="flex items-center gap-3">
                  {detectionStatus === 'success' ? (
                    <>
                      <CheckCircle className="w-8 h-8 text-success" />
                      <div>
                        <p className="font-bold text-success">Perfect!</p>
                        <p className="text-sm text-muted-foreground">Pose detected successfully</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-8 h-8 text-destructive" />
                      <div>
                        <p className="font-bold text-destructive">Try Again</p>
                        <p className="text-sm text-muted-foreground">Pose not recognized</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Practice Button */}
            <Button
              onClick={() => setIsDetecting(!isDetecting)}
              size="lg"
              className={`w-full gap-3 py-6 text-lg rounded-xl transition-elegant ${
                isDetecting 
                  ? 'bg-destructive hover:bg-destructive/90' 
                  : 'bg-gradient-accent hover:opacity-90'
              }`}
            >
              {isDetecting ? (
                <>
                  <XCircle className="w-6 h-6" />
                  Stop Practice
                </>
              ) : (
                <>
                  <Target className="w-6 h-6" />
                  Start Practice
                </>
              )}
            </Button>
          </div>

          {/* Right: Lesson Info */}
          <div className="space-y-6 fade-in-up delay-400">
            {/* Lesson Card */}
            <div className="gradient-card rounded-2xl p-8 border border-accent/20 shadow-elegant">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl font-bold text-accent">
                      {currentLessonIndex + 1}
                    </span>
                    <span className="text-muted-foreground">/ {poseLessons.length}</span>
                  </div>
                  <h2 className="text-3xl font-bold mb-2">{currentLesson.name}</h2>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${difficultyColors[currentLesson.difficulty]}`}>
                    {currentLesson.difficulty.toUpperCase()}
                  </span>
                </div>
                <div className="text-6xl">
                  {completedLessons.has(currentLesson.id) ? (
                    <CheckCircle className="w-16 h-16 text-success" />
                  ) : (
                    <Hand className="w-16 h-16 text-accent animate-pulse" />
                  )}
                </div>
              </div>

              <p className="text-lg text-muted-foreground mb-6">
                {currentLesson.description}
              </p>

              {/* Tips */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  Pro Tips
                </h3>
                <ul className="space-y-2">
                  {currentLesson.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-accent mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-4">
              <Button
                onClick={handlePrevious}
                disabled={currentLessonIndex === 0}
                variant="secondary"
                className="flex-1 gap-2 py-6 rounded-xl"
              >
                Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={currentLessonIndex === poseLessons.length - 1}
                variant="default"
                className="flex-1 gap-2 py-6 rounded-xl bg-gradient-accent"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Exit Button */}
            <Button
              onClick={onExit}
              variant="outline"
              className="w-full gap-2 py-4 rounded-xl"
            >
              Exit Training
            </Button>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="gradient-card rounded-xl p-4 border border-accent/20 text-center">
                <p className="text-2xl font-bold text-accent">{attempts}</p>
                <p className="text-xs text-muted-foreground">Attempts</p>
              </div>
              <div className="gradient-card rounded-xl p-4 border border-accent/20 text-center">
                <p className="text-2xl font-bold text-success">{successes}</p>
                <p className="text-xs text-muted-foreground">Success</p>
              </div>
              <div className="gradient-card rounded-xl p-4 border border-accent/20 text-center">
                <p className="text-2xl font-bold text-yellow-500">
                  {attempts > 0 ? Math.round((successes / attempts) * 100) : 0}%
                </p>
                <p className="text-xs text-muted-foreground">Accuracy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Completion Message */}
        {completedLessons.size === poseLessons.length && (
          <div className="mt-8 gradient-card rounded-2xl p-8 border-2 border-success text-center animate-slide-in-up">
            <Trophy className="w-20 h-20 mx-auto mb-4 text-success animate-bounce" />
            <h2 className="text-4xl font-bold mb-2 text-success">Training Complete!</h2>
            <p className="text-lg text-muted-foreground mb-6">
              You've mastered all poses. Ready to take the quiz?
            </p>
            <Button
              onClick={onComplete}
              size="lg"
              className="gap-3 bg-gradient-accent hover:opacity-90 px-12 py-6 text-xl rounded-xl"
            >
              <Sparkles className="w-6 h-6" />
              Start Quiz
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PoseTrainingMode;
