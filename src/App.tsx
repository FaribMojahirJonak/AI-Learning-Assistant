import { BrowserRouter as Router, Routes, Route, useNavigate, useNavigationType } from 'react-router-dom';
import LandingPage from './LandingPage';
import './App.css';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: string
}

interface ApiResponse {
  lesson: string
  quiz: QuizQuestion[]
}

function LearnPage() {
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [lesson, setLesson] = useState('')
  const [quiz, setQuiz] = useState<QuizQuestion[]>([])
  const [answers, setAnswers] = useState<{ [key: number]: string }>({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const navType = useNavigationType()

  useEffect(() => {
    if (navType === 'POP') {
      navigate('/', { replace: true })
    }
  }, [navType, navigate])

  const generateLesson = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic')
      return
    }
    const apiKey = import.meta.env.VITE_GROQ_API_KEY
    if (!apiKey || apiKey === 'your_groq_api_key_here' || !apiKey.startsWith('gsk_')) {
      setError('API key not configured or invalid. Please add your Groq API key to the .env file.')
      return
    }
    setLoading(true)
    setError('')
    setLesson('')
    setQuiz([])
    setAnswers({})
    setShowResults(false)
    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama3-70b-8192',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful tutor. Always respond with valid JSON format only.'
            },
            {
              role: 'user',
              content: `Create educational content about '${topic}'.\n\nCRITICAL: You must respond with ONLY valid JSON. No markdown, no explanations, no additional text.\n\nRequired JSON format:{\n  "lesson": "A comprehensive lesson about ${topic} (more than 1000 words)",\n  "quiz": [{"question": "Question text here?","options": ["Option A", "Option B", "Option C", "Option D"],"correctAnswer": "Option A"}]\n}\nRequirements: 1. Generate a lesson (more than 1000 words) explaining ${topic} 2. Create exactly 10 multiple choice questions with 4 options each 3. Mark the correct answer for each question 4. Ensure all quotes are properly escaped 5. No trailing commas 6. No markdown formatting 7. Pure JSON only\nExample of proper JSON structure:{\n  "lesson": "This is a lesson about the topic...",\n  "quiz": [{"question": "What is the main concept?","options": ["Option 1", "Option 2", "Option 3", "Option 4"],"correctAnswer": "Option 1"}]\n}`
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )
      const content = response.data.choices[0].message.content.trim()
      // Try to parse as JSON, fallback to extracting JSON object
      let parsed: ApiResponse | null = null
      try {
        parsed = JSON.parse(content)
      } catch {
        const match = content.match(/\{[\s\S]*\}/)
        if (match) {
          try {
            parsed = JSON.parse(match[0])
          } catch {}
        }
      }
      if (parsed && parsed.lesson && Array.isArray(parsed.quiz)) {
        setLesson(parsed.lesson)
        setQuiz(parsed.quiz)
      } else {
        setError('Failed to parse the API response. Please try again.')
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        setError('Invalid API key. Please check your Groq API key in the .env file.')
      } else if (error.response?.status === 429) {
        setError('Rate limit exceeded. Please wait a moment and try again.')
      } else if (error.response?.status === 400) {
        setError('Bad request. Please check your topic and try again.')
      } else if (error.code === 'NETWORK_ERROR') {
        setError('Network error. Please check your internet connection and try again.')
      } else {
        setError('Failed to generate lesson. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answer }))
  }

  const submitQuiz = () => {
    const correctCount = quiz.reduce((count, q, i) => count + (answers[i] === q.correctAnswer ? 1 : 0), 0)
    setScore(correctCount)
    setShowResults(true)
  }

  const resetQuiz = () => {
    setAnswers({})
    setShowResults(false)
    setScore(0)
    setError('')
  }

  const changeTopic = () => {
    setTopic('')
    setLesson('')
    setQuiz([])
    setAnswers({})
    setShowResults(false)
    setScore(0)
    setError('')
    navigate('/learn')
  }

  return (
    <div className="app-root">
      <div className="app">
        <header className="app-header">
          <h1>AI Learning Assistant</h1>
          {!lesson && <p>Enter a topic to generate a lesson and quiz</p>}
        </header>
        <main className="app-main">
          {!lesson && (
            <div className="card">
              <div className="card-illustration">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="10" y="14" width="44" height="36" rx="8" fill="#a1c4fd"/>
                  <rect x="16" y="20" width="32" height="24" rx="4" fill="#fff"/>
                  <rect x="20" y="24" width="24" height="4" rx="2" fill="#c2e9fb"/>
                  <rect x="20" y="32" width="16" height="4" rx="2" fill="#c2e9fb"/>
                  <rect x="20" y="40" width="8" height="4" rx="2" fill="#c2e9fb"/>
                  <circle cx="48" cy="48" r="6" fill="#c2e9fb"/>
                  <rect x="44" y="46" width="8" height="4" rx="2" fill="#a1c4fd"/>
                </svg>
              </div>
              {error && (
                <div className="error-message">
                  <strong>Error:</strong> {error}
                </div>
              )}
              <div className="input-group">
                <input
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="Enter a topic (e.g., Python loops, React hooks, etc.)"
                  className="topic-input"
                  disabled={loading}
                  autoFocus
                />
                <button
                  onClick={generateLesson}
                  disabled={loading || !topic.trim()}
                  className="generate-btn"
                >
                  {loading ? 'Generating...' : 'Generate Lesson & Quiz'}
                </button>
              </div>
            </div>
          )}
          {lesson && (
            <div className="lesson-card card">
              <h2>Lesson: {topic}</h2>
              <div className="lesson-content">
                {lesson.split('\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>
          )}
          {lesson && quiz.length > 0 && (
            <div className="quiz-section card">
              <h2>Quiz</h2>
              <form onSubmit={e => { e.preventDefault(); submitQuiz(); }}>
                {quiz.map((question, questionIndex) => (
                  <div key={questionIndex} className="question-card">
                    <h3>Question {questionIndex + 1}</h3>
                    <p className="question-text">{question.question}</p>
                    <div className="options">
                      {question.options.map((option, optionIndex) => (
                        <label
                          key={optionIndex}
                          className={`option${answers[questionIndex] === option ? ' selected' : ''}`}
                        >
                          <input
                            type="radio"
                            name={`question-${questionIndex}`}
                            value={option}
                            checked={answers[questionIndex] === option}
                            onChange={() => handleAnswerChange(questionIndex, option)}
                            disabled={showResults}
                          />
                          <span className="custom-radio"></span>
                          <span className="option-text">{option}</span>
                        </label>
                      ))}
                    </div>
                    {showResults && (
                      <div className={`answer-feedback ${answers[questionIndex] === question.correctAnswer ? 'correct' : 'incorrect'}`}>
                        {answers[questionIndex] === question.correctAnswer
                          ? '✓ Correct!'
                          : `✗ Incorrect. The correct answer is: ${question.correctAnswer}`}
                      </div>
                    )}
                  </div>
                ))}
                {!showResults && (
                  <button type="submit" className="submit-btn">
                    Submit Quiz
                  </button>
                )}
              </form>
              {showResults && (
                <div className="results-section">
                  <h3>Quiz Results</h3>
                  <p className="score">You got {score} out of {quiz.length} questions correct!</p>
                  <div className="score-percentage">
                    {Math.round((score / quiz.length) * 100)}%
                  </div>
                  <button onClick={resetQuiz} className="reset-btn">Start Over</button>
                  <button onClick={changeTopic} className="change-topic-btn">Change Topic</button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/learn" element={<LearnPage />} />
      </Routes>
    </Router>
  );
}
