import { BrowserRouter as Router, Routes, Route, useNavigate, useNavigationType } from 'react-router-dom';
import LandingPage from './LandingPage';
import './App.css';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  const downloadRef = useRef<HTMLDivElement>(null)

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

  const downloadAssessment = async () => {
    if (!downloadRef.current) {
      console.error('Download ref is null')
      alert('Failed to generate PDF. Please try again.')
      return
    }

    try {
      console.log('Starting PDF generation...')
      
      // Temporarily show the div for rendering
      downloadRef.current.style.display = 'block'
      downloadRef.current.style.position = 'absolute'
      downloadRef.current.style.left = '-9999px'
      downloadRef.current.style.top = '0'
      
      // Wait a bit for the content to render
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = 210
      const pageHeight = 297
      const margin = 20
      const contentWidth = pageWidth - (2 * margin)
      const contentHeight = pageHeight - (2 * margin)
      
      let currentY = margin
      let currentPage = 1
      
      // Add title with text wrapping to prevent overflow
      pdf.setFontSize(20)
      pdf.setTextColor(79, 140, 255)
      pdf.setFont('helvetica', 'bold')
      
      const titleText = `AI Learning Assessment: ${topic}`
      const titleLines = pdf.splitTextToSize(titleText, contentWidth - 20)
      
      // Center each line of the title
      titleLines.forEach((line: string, index: number) => {
        pdf.text(line, pageWidth / 2, currentY + (index * 8), { align: 'center' })
      })
      
      currentY += (titleLines.length * 8) + 10
      
      // Add lesson content
      if (lesson) {
        pdf.setFontSize(16)
        pdf.setTextColor(34, 34, 59)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Lesson', margin, currentY)
        currentY += 10
        
        pdf.setFontSize(12)
        pdf.setTextColor(68, 68, 68)
        pdf.setFont('helvetica', 'normal')
        const lessonParagraphs = lesson.split('\n')
        
        for (const paragraph of lessonParagraphs) {
          if (paragraph.trim()) {
            // Use proper padding for lesson text to prevent overflow
            const lines = pdf.splitTextToSize(paragraph, contentWidth - 40)
            
            // Check if we need a new page
            if (currentY + (lines.length * 5) > pageHeight - margin) {
              pdf.addPage()
              currentPage++
              currentY = margin
            }
            
            pdf.text(lines, margin + 20, currentY)
            currentY += lines.length * 5 + 5
          }
        }
        currentY += 10
      }
      
      // Add quiz questions
      if (quiz.length > 0) {
        pdf.setFontSize(16)
        pdf.setTextColor(34, 34, 59)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Quiz', margin, currentY)
        currentY += 10
        
        for (let questionIndex = 0; questionIndex < quiz.length; questionIndex++) {
          const question = quiz[questionIndex]
          
          // Calculate actual question height based on content with proper padding
          const questionTextLines = pdf.splitTextToSize(question.question, contentWidth - 40)
          const questionTextHeight = questionTextLines.length * 5
          
          // Calculate total options height with proper padding
          let totalOptionsHeight = 0
          question.options.forEach((option, optionIndex) => {
            let optionText = `${String.fromCharCode(65 + optionIndex)}. ${option}`
            if (answers[questionIndex] === option) optionText += ' (Selected)'
            if (option === question.correctAnswer) optionText += ' ✓'
            const optionLines = pdf.splitTextToSize(optionText, contentWidth - 50)
            totalOptionsHeight += optionLines.length * 5 + 5
          })
          
          const feedbackHeight = showResults ? 20 : 0
          const questionHeight = 20 + questionTextHeight + totalOptionsHeight + feedbackHeight + 15
          
          // Check if we need a new page for this question
          if (currentY + questionHeight > pageHeight - margin) {
            pdf.addPage()
            currentPage++
            currentY = margin
          }
          
          // Question card background with better styling
          pdf.setFillColor(248, 250, 252)
          pdf.setDrawColor(224, 231, 255)
          pdf.rect(margin, currentY - 8, contentWidth, questionHeight + 8)
          pdf.setFillColor(248, 250, 252)
          pdf.rect(margin, currentY - 8, contentWidth, questionHeight + 8, 'F')
          pdf.setDrawColor(224, 231, 255)
          pdf.rect(margin, currentY - 8, contentWidth, questionHeight + 8, 'S')
          
          // Question number and text
          pdf.setFontSize(14)
          pdf.setTextColor(34, 34, 59)
          pdf.setFont('helvetica', 'bold')
          pdf.text(`Question ${questionIndex + 1}`, margin + 8, currentY)
          currentY += 8
          
          pdf.setFontSize(12)
          pdf.setTextColor(68, 68, 68)
          pdf.setFont('helvetica', 'normal')
          pdf.text(questionTextLines, margin + 20, currentY)
          currentY += questionTextHeight + 8
          
          // Options with consistent font
          question.options.forEach((option, optionIndex) => {
            const isSelected = answers[questionIndex] === option
            const isCorrect = option === question.correctAnswer
            
            // Split option text to prevent overflow with proper padding
            let optionText = `${String.fromCharCode(65 + optionIndex)}. ${option}`
            if (isSelected) optionText += ' (Selected)'
            if (isCorrect) optionText += ' ✓'
            
            const optionLines = pdf.splitTextToSize(optionText, contentWidth - 50)
            const optionHeight = optionLines.length * 5 + 5
            
            pdf.setFontSize(11)
            pdf.setFont('helvetica', 'normal')
            
            if (isSelected) {
              pdf.setTextColor(79, 140, 255)
              pdf.setFont('helvetica', 'bold')
            } else {
              pdf.setTextColor(68, 68, 68)
              pdf.setFont('helvetica', 'normal')
            }
            
            // Draw option text with proper line breaks and padding
            optionLines.forEach((line: string, lineIndex: number) => {
              pdf.text(line, margin + 25, currentY + 2 + (lineIndex * 5))
            })
            
            currentY += optionHeight
          })
          
          // Answer feedback
          if (showResults) {
            currentY += 5
            const isCorrect = answers[questionIndex] === question.correctAnswer
            
            // Create shorter feedback text to prevent overflow
            let feedbackText = isCorrect 
              ? '✓ Correct!' 
              : `✗ Incorrect. Correct answer: ${question.correctAnswer}`
            
            // Use very small width for feedback to prevent overflow
            const feedbackWidth = Math.min(contentWidth - 80, 80)
            const feedbackLines = pdf.splitTextToSize(feedbackText, feedbackWidth)
            const feedbackHeight = feedbackLines.length * 5 + 8
            
            pdf.setTextColor(isCorrect ? 21 : 153, isCorrect ? 128 : 27, isCorrect ? 61 : 27)
            pdf.setFont('helvetica', 'bold')
            pdf.setFontSize(9)
            
            // Draw feedback text with maximum padding from edges
            feedbackLines.forEach((line: string, lineIndex: number) => {
              pdf.text(line, margin + 40, currentY + 3 + (lineIndex * 5))
            })
            
            currentY += feedbackHeight + 5
          }
          
          currentY += 8
        }
      }
      
      // Add results
      if (showResults) {
        // Check if we need a new page for results
        if (currentY + 40 > pageHeight - margin) {
          pdf.addPage()
          currentPage++
          currentY = margin
        }
        
        // Results background
        pdf.setFillColor(243, 248, 255)
        pdf.setDrawColor(161, 196, 253)
        pdf.rect(margin, currentY, contentWidth, 35, 'F')
        pdf.rect(margin, currentY, contentWidth, 35, 'S')
        
        // Results text
        pdf.setFontSize(16)
        pdf.setTextColor(34, 34, 59)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Quiz Results', pageWidth / 2, currentY + 8, { align: 'center' })
        
        pdf.setFontSize(12)
        pdf.setTextColor(68, 68, 68)
        pdf.setFont('helvetica', 'normal')
        pdf.text(`You got ${score} out of ${quiz.length} questions correct!`, pageWidth / 2, currentY + 18, { align: 'center' })
        
        pdf.setFontSize(20)
        pdf.setTextColor(161, 196, 253)
        pdf.setFont('helvetica', 'bold')
        pdf.text(`${Math.round((score / quiz.length) * 100)}%`, pageWidth / 2, currentY + 28, { align: 'center' })
      }
      
      const filename = `AI_Assessment_${topic.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
      
      // Check if we're in an in-app browser (Facebook, Instagram, etc.)
      const isInAppBrowser = /FBAN|FBAV|Instagram|Line|WhatsApp|Telegram|Twitter|LinkedIn/i.test(navigator.userAgent)
      
      if (isInAppBrowser) {
        // For in-app browsers, use blob URL method
        const pdfBlob = pdf.output('blob')
        const blobUrl = URL.createObjectURL(pdfBlob)
        
        // Create a temporary link and trigger download
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = filename
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // Clean up blob URL after a delay
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl)
        }, 1000)
        
        // Show success message for in-app browsers
        alert('PDF generated successfully! Please check your downloads folder.')
      } else {
        // For regular browsers, use the standard method
        pdf.save(filename)
      }
      
      console.log('PDF generated successfully')
      
      // Hide the div again
      downloadRef.current.style.display = 'none'
      
    } catch (error: any) {
      console.error('Error generating PDF:', error)
      
      // Hide the div in case of error
      if (downloadRef.current) {
        downloadRef.current.style.display = 'none'
      }
      
      alert(`Failed to generate PDF: ${error.message || 'Unknown error'}`)
    }
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
          
          {/* Hidden div for PDF generation */}
          <div ref={downloadRef} style={{ 
            display: 'none', 
            backgroundColor: 'white', 
            padding: '20px',
            width: '800px',
            maxWidth: '800px',
            boxSizing: 'border-box',
            wordWrap: 'break-word',
            overflowWrap: 'break-word'
          }}>
            <h1 style={{ color: '#4f8cff', textAlign: 'center', marginBottom: '20px', fontSize: '24px' }}>
              AI Learning Assessment: {topic}
            </h1>
            
            {lesson && (
              <div style={{ marginBottom: '30px' }}>
                <h2 style={{ color: '#22223b', marginBottom: '15px', fontSize: '20px' }}>Lesson</h2>
                <div style={{ lineHeight: '1.6', color: '#444', fontSize: '14px' }}>
                  {lesson.split('\n').map((paragraph, i) => (
                    <p key={i} style={{ marginBottom: '10px', wordWrap: 'break-word', overflowWrap: 'break-word' }}>{paragraph}</p>
                  ))}
                </div>
              </div>
            )}
            
            {quiz.length > 0 && (
              <div style={{ marginBottom: '30px' }}>
                <h2 style={{ color: '#22223b', marginBottom: '15px', fontSize: '20px' }}>Quiz</h2>
                {quiz.map((question, questionIndex) => (
                  <div key={questionIndex} style={{ 
                    marginBottom: '20px', 
                    padding: '15px', 
                    border: '1px solid #e0e7ff', 
                    borderRadius: '8px',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word'
                  }}>
                    <h3 style={{ color: '#22223b', marginBottom: '10px', fontSize: '16px' }}>Question {questionIndex + 1}</h3>
                    <p style={{ marginBottom: '10px', color: '#444', fontSize: '14px', wordWrap: 'break-word', overflowWrap: 'break-word' }}>{question.question}</p>
                    <div style={{ marginBottom: '10px' }}>
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} style={{ marginBottom: '5px', padding: '5px' }}>
                          <span style={{ 
                            fontWeight: answers[questionIndex] === option ? 'bold' : 'normal',
                            color: answers[questionIndex] === option ? '#4f8cff' : '#444',
                            fontSize: '14px',
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word'
                          }}>
                            {String.fromCharCode(65 + optionIndex)}. {option}
                            {answers[questionIndex] === option && ' (Selected)'}
                            {option === question.correctAnswer && ' ✓'}
                          </span>
                        </div>
                      ))}
                    </div>
                    {showResults && (
                      <div style={{ 
                        padding: '8px', 
                        borderRadius: '4px', 
                        backgroundColor: answers[questionIndex] === question.correctAnswer ? '#d4f8e8' : '#ffe0e0',
                        color: answers[questionIndex] === question.correctAnswer ? '#2d6a4f' : '#b00020',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}>
                        {answers[questionIndex] === question.correctAnswer
                          ? '✓ Correct!'
                          : `✗ Incorrect. The correct answer is: ${question.correctAnswer}`}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {showResults && (
              <div style={{ 
                textAlign: 'center', 
                padding: '20px', 
                border: '2px solid #a1c4fd', 
                borderRadius: '8px',
                backgroundColor: '#f3f8ff'
              }}>
                <h3 style={{ color: '#22223b', marginBottom: '10px', fontSize: '18px' }}>Quiz Results</h3>
                <p style={{ fontSize: '16px', marginBottom: '5px' }}>
                  You got {score} out of {quiz.length} questions correct!
                </p>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#a1c4fd', marginBottom: '10px' }}>
                  {Math.round((score / quiz.length) * 100)}%
                </div>
              </div>
            )}
          </div>

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
                  
                  {/* All buttons side by side */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '10px', 
                    justifyContent: 'center', 
                    flexWrap: 'wrap',
                    marginTop: '20px'
                  }}>
                    <button onClick={resetQuiz} className="reset-btn">Start Over</button>
                    <button onClick={changeTopic} className="change-topic-btn">Change Topic</button>
                    <button onClick={downloadAssessment} className="download-btn">
                      📄 Download Assessment PDF
                    </button>
                  </div>
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
