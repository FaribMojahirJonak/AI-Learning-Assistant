# AI Learning Assistant

A React TypeScript application that uses the Groq API to generate educational lessons and quizzes on any topic. Users can input a topic, receive a comprehensive lesson, and take an interactive quiz to test their knowledge.

## Features

- **Dynamic Lesson Generation**: Enter any topic and get a comprehensive lesson (around 300 words)
- **Interactive Quiz**: 5-question multiple choice quiz with immediate feedback
- **Score Tracking**: See your quiz results with percentage score
- **Modern UI**: Beautiful, responsive design with smooth animations
- **TypeScript**: Full type safety and better development experience

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Groq API key

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd my-saas-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory and add your Groq API key:
   ```
   VITE_GROQ_API_KEY=your_groq_api_key_here
   ```
   
   To get a Groq API key:
   1. Visit [Groq Console](https://console.groq.com/)
   2. Sign up or log in
   3. Navigate to API Keys section
   4. Create a new API key
   5. Copy the key and paste it in your `.env` file

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173` to see the application.

## Usage

1. **Enter a Topic**: Type any educational topic in the input field (e.g., "Python loops", "React hooks", "Photosynthesis")
2. **Generate Content**: Click "Generate Lesson & Quiz" to create educational content
3. **Read the Lesson**: Review the generated lesson material
4. **Take the Quiz**: Answer the 5 multiple choice questions
5. **View Results**: See your score and review correct answers
6. **Start Over**: Click "Start Over" to try a new topic

## Technology Stack

- **Frontend**: React 19 with TypeScript
- **Styling**: CSS3 with modern design patterns
- **HTTP Client**: Axios for API requests
- **Build Tool**: Vite for fast development and building
- **AI Integration**: Groq API with Mixtral-8x7b model

## API Integration

The application integrates with Groq's API using the Mixtral-8x7b model to generate:
- Educational lessons tailored to the requested topic
- Multiple choice quizzes with correct answers
- JSON-formatted responses for easy parsing

## Project Structure

```
src/
├── App.tsx          # Main application component
├── App.css          # Application styles
├── main.tsx         # Application entry point
└── assets/          # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_GROQ_API_KEY` | Your Groq API key for AI content generation | Yes |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues:
1. Check that your Groq API key is correctly set in the `.env` file
2. Ensure you have a stable internet connection
3. Verify that your Groq account has sufficient credits
4. Check the browser console for any error messages
