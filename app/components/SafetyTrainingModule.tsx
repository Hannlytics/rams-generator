'use client';

import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, XCircle, Award, Clock, AlertTriangle, BookOpen } from 'lucide-react';

// Training module data structure
interface TrainingModule {
  id: string;
  hazardType: string;
  title: string;
  duration: number; // in minutes
  videoUrl?: string;
  content: string[];
  quiz: QuizQuestion[];
  requiredScore: number;
  certificateExpiry: number; // days
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface TrainingProgress {
  moduleId: string;
  completed: boolean;
  score?: number;
  completedDate?: string;
  certificateExpiry?: string;
}

interface SafetyTrainingProps {
  selectedHazards: string[];
  userId?: string;
  onTrainingComplete?: (moduleId: string, score: number) => void;
}

// Training modules database - mapped to your existing hazards
const trainingModules: TrainingModule[] = [
  {
    id: 'WH001',
    hazardType: 'Working at Height',
    title: 'Working at Height Safety Training',
    duration: 5,
    content: [
      'Always use proper fall protection equipment above 2 meters',
      'Inspect harnesses before each use - check for cuts, burns, or damage',
      'Maintain three points of contact when climbing',
      'Never work at height in winds exceeding 23mph (Force 5)',
      'Ensure rescue plan is in place before starting work'
    ],
    quiz: [
      {
        question: 'At what height must fall protection be used?',
        options: ['1 meter', '2 meters', '3 meters', '4 meters'],
        correctAnswer: 1,
        explanation: 'UK regulations require fall protection for work at 2 meters or above.'
      },
      {
        question: 'How many points of contact should you maintain when climbing?',
        options: ['One', 'Two', 'Three', 'Four'],
        correctAnswer: 2,
        explanation: 'Three points of contact (two hands and one foot, or two feet and one hand) must be maintained.'
      },
      {
        question: 'What wind speed makes working at height unsafe?',
        options: ['15mph', '20mph', '23mph', '30mph'],
        correctAnswer: 2,
        explanation: 'Work should stop when winds exceed 23mph (Force 5 on Beaufort scale).'
      }
    ],
    requiredScore: 80,
    certificateExpiry: 365
  },
  {
    id: 'COSHH001',
    hazardType: 'Hazardous Substances (COSHH)',
    title: 'COSHH Awareness Training',
    duration: 5,
    content: [
      'Always read Safety Data Sheets (SDS) before using chemicals',
      'Use appropriate PPE - gloves, goggles, respirators as specified',
      'Ensure adequate ventilation when using solvents or paints',
      'Store chemicals in original containers with labels intact',
      'Know location of spill kits and emergency shower/eyewash'
    ],
    quiz: [
      {
        question: 'What should you read before using any chemical?',
        options: ['Product label only', 'Safety Data Sheet (SDS)', 'Instructions only', 'Warning signs'],
        correctAnswer: 1,
        explanation: 'Safety Data Sheets contain critical safety information about chemicals.'
      },
      {
        question: 'Where should chemicals be stored?',
        options: ['Any container', 'Original labeled containers', 'Unlabeled bottles', 'Open containers'],
        correctAnswer: 1,
        explanation: 'Chemicals must be stored in original containers with labels to prevent accidents.'
      },
      {
        question: 'What is required when using solvents indoors?',
        options: ['PPE only', 'Ventilation only', 'Both PPE and ventilation', 'Neither'],
        correctAnswer: 2,
        explanation: 'Both proper PPE and adequate ventilation are required for solvent use.'
      }
    ],
    requiredScore: 80,
    certificateExpiry: 365
  },
  {
    id: 'MT001',
    hazardType: 'Manual Handling',
    title: 'Manual Handling Training',
    duration: 5,
    content: [
      'Assess the load - test weight before lifting',
      'Bend knees, not back - keep back straight',
      'Keep load close to your body',
      'Maximum safe lifting weight: 25kg for men, 16kg for women',
      'Use mechanical aids for heavy or awkward loads'
    ],
    quiz: [
      {
        question: 'What is the maximum safe lifting weight for men?',
        options: ['20kg', '25kg', '30kg', '35kg'],
        correctAnswer: 1,
        explanation: 'HSE guidelines recommend maximum 25kg for men in ideal conditions.'
      },
      {
        question: 'How should you bend when lifting?',
        options: ['Bend your back', 'Bend your knees', 'Bend sideways', 'Dont bend'],
        correctAnswer: 1,
        explanation: 'Always bend your knees and keep your back straight when lifting.'
      },
      {
        question: 'Where should you keep the load when carrying?',
        options: ['Away from body', 'Close to body', 'Above head', 'To the side'],
        correctAnswer: 1,
        explanation: 'Keep loads close to your body to reduce strain on your back.'
      }
    ],
    requiredScore: 80,
    certificateExpiry: 730 // 2 years
  }
];

const SafetyTrainingModule: React.FC<SafetyTrainingProps> = ({ 
  selectedHazards = [], 
  userId = 'user1',
  onTrainingComplete 
}) => {
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [progress, setProgress] = useState<TrainingProgress[]>([]);
  const [viewMode, setViewMode] = useState<'overview' | 'content' | 'quiz' | 'results'>('overview');

  // Load saved progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem(`training_progress_${userId}`);
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }
  }, [userId]);

  // Save progress to localStorage
  const saveProgress = (newProgress: TrainingProgress[]) => {
    setProgress(newProgress);
    localStorage.setItem(`training_progress_${userId}`, JSON.stringify(newProgress));
  };

  // Get relevant training modules based on selected hazards
  const relevantModules = trainingModules.filter(module => 
    selectedHazards.some(hazard => hazard.includes(module.hazardType))
  );

  // Check if module is completed
  const isModuleCompleted = (moduleId: string) => {
    const moduleProgress = progress.find(p => p.moduleId === moduleId);
    return moduleProgress?.completed || false;
  };

  // Check if certificate is valid
  const isCertificateValid = (moduleId: string) => {
    const moduleProgress = progress.find(p => p.moduleId === moduleId);
    if (!moduleProgress?.certificateExpiry) return false;
    return new Date(moduleProgress.certificateExpiry) > new Date();
  };

  // Start training module
  const startModule = (module: TrainingModule) => {
    setSelectedModule(module);
    setViewMode('content');
    setSelectedAnswers([]);
    setCurrentQuizIndex(0);
    setShowResults(false);
  };

  // Start quiz
  const startQuiz = () => {
    setViewMode('quiz');
    setCurrentQuizIndex(0);
    setSelectedAnswers([]);
  };

  // Submit quiz answer
  const submitAnswer = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuizIndex] = answerIndex;
    setSelectedAnswers(newAnswers);

    if (currentQuizIndex < selectedModule!.quiz.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
    } else {
      calculateResults();
    }
  };

  // Calculate quiz results
  const calculateResults = () => {
    if (!selectedModule) return;

    let correct = 0;
    selectedModule.quiz.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });

    const score = Math.round((correct / selectedModule.quiz.length) * 100);
    const passed = score >= selectedModule.requiredScore;

    if (passed) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + selectedModule.certificateExpiry);

      const newProgress: TrainingProgress = {
        moduleId: selectedModule.id,
        completed: true,
        score,
        completedDate: new Date().toISOString(),
        certificateExpiry: expiryDate.toISOString()
      };

      const updatedProgress = progress.filter(p => p.moduleId !== selectedModule.id);
      updatedProgress.push(newProgress);
      saveProgress(updatedProgress);

      if (onTrainingComplete) {
        onTrainingComplete(selectedModule.id, score);
      }
    }

    setViewMode('results');
    setShowResults(true);
  };

  // Get quiz score
  const getQuizScore = () => {
    if (!selectedModule) return 0;
    let correct = 0;
    selectedModule.quiz.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / selectedModule.quiz.length) * 100);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-blue-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-800">Safety Training Centre</h2>
            <p className="text-sm text-gray-600">Complete required training for identified hazards</p>
          </div>
        </div>
      </div>

      {viewMode === 'overview' && (
        <div className="space-y-4">
          {relevantModules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
              <p>No training modules required based on selected hazards.</p>
              <p className="text-sm mt-2">Select hazards in your RAMS to see required training.</p>
            </div>
          ) : (
            <>
              <h3 className="font-semibold text-gray-700 mb-3">Required Training Modules</h3>
              {relevantModules.map(module => {
                const completed = isModuleCompleted(module.id);
                const valid = isCertificateValid(module.id);
                const moduleProgress = progress.find(p => p.moduleId === module.id);

                return (
                  <div 
                    key={module.id} 
                    className={`border rounded-lg p-4 ${
                      completed && valid ? 'bg-green-50 border-green-300' : 
                      completed && !valid ? 'bg-yellow-50 border-yellow-300' :
                      'bg-gray-50 border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{module.title}</h4>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {module.duration} minutes
                          </span>
                          {completed && (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              Score: {moduleProgress?.score}%
                            </span>
                          )}
                          {completed && !valid && (
                            <span className="text-yellow-600 font-medium">
                              Certificate Expired
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => startModule(module)}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                          completed && valid 
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {completed && valid ? (
                          <>
                            <Award className="w-4 h-4" />
                            Review
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            Start
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {viewMode === 'content' && selectedModule && (
        <div className="space-y-4">
          <button
            onClick={() => setViewMode('overview')}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            ← Back to modules
          </button>
          
          <h3 className="text-lg font-bold text-gray-800">{selectedModule.title}</h3>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-3">Key Safety Points:</h4>
            <ul className="space-y-2">
              {selectedModule.content.map((point, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end">
            <button
              onClick={startQuiz}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Take Quiz →
            </button>
          </div>
        </div>
      )}

      {viewMode === 'quiz' && selectedModule && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Knowledge Check</h3>
            <span className="text-sm text-gray-600">
              Question {currentQuizIndex + 1} of {selectedModule.quiz.length}
            </span>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-lg font-medium text-gray-800 mb-4">
              {selectedModule.quiz[currentQuizIndex].question}
            </p>

            <div className="space-y-3">
              {selectedModule.quiz[currentQuizIndex].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => submitAnswer(index)}
                  className="w-full text-left p-3 rounded-lg border border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <div className="flex gap-1">
              {selectedModule.quiz.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index < currentQuizIndex ? 'bg-blue-600' :
                    index === currentQuizIndex ? 'bg-blue-400' :
                    'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'results' && selectedModule && showResults && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800">Quiz Results</h3>
          
          <div className={`text-center py-8 rounded-lg ${
            getQuizScore() >= selectedModule.requiredScore
              ? 'bg-green-50 border-2 border-green-300'
              : 'bg-red-50 border-2 border-red-300'
          }`}>
            {getQuizScore() >= selectedModule.requiredScore ? (
              <>
                <Award className="w-16 h-16 text-green-600 mx-auto mb-3" />
                <p className="text-2xl font-bold text-green-800">Passed!</p>
                <p className="text-lg text-green-700 mt-2">Score: {getQuizScore()}%</p>
                <p className="text-sm text-green-600 mt-2">
                  Certificate valid until {new Date(
                    new Date().setDate(new Date().getDate() + selectedModule.certificateExpiry)
                  ).toLocaleDateString()}
                </p>
              </>
            ) : (
              <>
                <XCircle className="w-16 h-16 text-red-600 mx-auto mb-3" />
                <p className="text-2xl font-bold text-red-800">Not Passed</p>
                <p className="text-lg text-red-700 mt-2">Score: {getQuizScore()}%</p>
                <p className="text-sm text-red-600 mt-2">
                  Required: {selectedModule.requiredScore}% - Please retry
                </p>
              </>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-700">Review Answers:</h4>
            {selectedModule.quiz.map((question, index) => {
              const isCorrect = selectedAnswers[index] === question.correctAnswer;
              return (
                <div key={index} className={`p-3 rounded-lg border ${
                  isCorrect ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
                }`}>
                  <p className="font-medium text-gray-800 mb-1">{question.question}</p>
                  <p className="text-sm text-gray-600">
                    Your answer: {question.options[selectedAnswers[index]]}
                  </p>
                  {!isCorrect && (
                    <p className="text-sm text-green-700 mt-1">
                      Correct: {question.options[question.correctAnswer]}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 italic mt-1">{question.explanation}</p>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setViewMode('overview')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Back to Modules
            </button>
            {getQuizScore() < selectedModule.requiredScore && (
              <button
                onClick={startQuiz}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry Quiz
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SafetyTrainingModule;