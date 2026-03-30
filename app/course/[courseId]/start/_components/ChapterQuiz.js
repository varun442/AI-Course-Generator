"use client"
import React, { useState } from 'react'
import { GenerateQuiz_AI } from '@/configs/AiModel'
import { HiOutlineAcademicCap, HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi2'
import Spinner from '@/app/_components/Spinner'

function ChapterQuiz({ chapter, content }) {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState([]);

  const generateQuiz = async () => {
    setLoading(true);
    setQuiz(null);
    setCurrentQ(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setFinished(false);
    setAnswers([]);

    try {
      // Build context from chapter content
      const contentItems = content?.content;
      let contentText = '';
      if (Array.isArray(contentItems)) {
        contentText = contentItems.map(item => `${item.title}: ${item.description}`).join('\n');
      } else if (contentItems && typeof contentItems === 'object') {
        contentText = Object.values(contentItems)
          .filter(item => item?.title)
          .map(item => `${item.title}: ${item.description}`).join('\n');
      }

      const prompt = `Generate a quiz with 5 multiple-choice questions based on this chapter content:\n\nChapter: ${chapter?.name}\n\n${contentText}`;

      const result = await GenerateQuiz_AI.sendMessage(prompt);
      const parsed = JSON.parse(result.response.text());
      setQuiz(parsed.quiz);
    } catch (err) {
      console.error('[ChapterQuiz] Error:', err?.message);
    }
    setLoading(false);
  };

  const handleSelect = (optionIndex) => {
    if (answered) return;
    setSelected(optionIndex);
    setAnswered(true);

    const isCorrect = optionIndex === quiz[currentQ].correctAnswer;
    if (isCorrect) setScore(prev => prev + 1);

    setAnswers(prev => [...prev, { selected: optionIndex, correct: quiz[currentQ].correctAnswer, isCorrect }]);
  };

  const nextQuestion = () => {
    if (currentQ + 1 >= quiz.length) {
      setFinished(true);
    } else {
      setCurrentQ(prev => prev + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const getOptionStyle = (index) => {
    if (!answered) {
      return selected === index
        ? 'border-primary bg-primary/5'
        : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50 cursor-pointer';
    }
    if (index === quiz[currentQ].correctAnswer) {
      return 'border-green-500 bg-green-50';
    }
    if (index === selected && index !== quiz[currentQ].correctAnswer) {
      return 'border-red-500 bg-red-50';
    }
    return 'border-gray-200 opacity-60';
  };

  // Not started yet
  if (!quiz && !loading) {
    return (
      <div className='mt-10 border-t pt-8'>
        <div className='bg-gradient-to-r from-primary/5 to-purple-50 rounded-xl p-8 text-center'>
          <HiOutlineAcademicCap className='text-4xl text-primary mx-auto mb-3' />
          <h3 className='font-semibold text-lg text-gray-900 mb-2'>Test Your Knowledge</h3>
          <p className='text-sm text-gray-500 mb-5'>Take a quick quiz to check your understanding of this chapter</p>
          <button
            onClick={generateQuiz}
            className='bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors'
          >
            Take Quiz
          </button>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className='mt-10 border-t pt-8'>
        <div className='bg-gray-50 rounded-xl p-12 text-center'>
          <Spinner size="md" />
          <p className='text-sm text-gray-500 mt-3'>Generating quiz questions...</p>
        </div>
      </div>
    );
  }

  // Finished — show results
  if (finished) {
    const percentage = Math.round((score / quiz.length) * 100);
    return (
      <div className='mt-10 border-t pt-8'>
        <div className='bg-white border rounded-xl p-8'>
          <div className='text-center mb-8'>
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-3xl font-bold mb-4 ${
              percentage >= 80 ? 'bg-green-100 text-green-600' :
              percentage >= 60 ? 'bg-yellow-100 text-yellow-600' :
              'bg-red-100 text-red-600'
            }`}>
              {percentage}%
            </div>
            <h3 className='font-semibold text-xl text-gray-900'>
              {percentage >= 80 ? 'Excellent!' : percentage >= 60 ? 'Good job!' : 'Keep learning!'}
            </h3>
            <p className='text-sm text-gray-500 mt-1'>
              You got {score} out of {quiz.length} questions correct
            </p>
          </div>

          {/* Review answers */}
          <div className='space-y-4'>
            {quiz.map((q, i) => (
              <div key={i} className={`p-4 rounded-lg border ${answers[i]?.isCorrect ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}>
                <div className='flex items-start gap-2 mb-2'>
                  {answers[i]?.isCorrect
                    ? <HiOutlineCheckCircle className='text-green-500 text-lg flex-shrink-0 mt-0.5' />
                    : <HiOutlineXCircle className='text-red-500 text-lg flex-shrink-0 mt-0.5' />
                  }
                  <p className='text-sm font-medium text-gray-900'>{q.question}</p>
                </div>
                {!answers[i]?.isCorrect && (
                  <p className='text-xs text-gray-500 ml-7'>
                    Correct answer: <span className='font-medium text-green-700'>{q.options[q.correctAnswer]}</span>
                  </p>
                )}
                <p className='text-xs text-gray-500 ml-7 mt-1'>{q.explanation}</p>
              </div>
            ))}
          </div>

          <div className='flex gap-3 mt-6 justify-center'>
            <button
              onClick={generateQuiz}
              className='bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors'
            >
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active quiz
  const q = quiz[currentQ];
  return (
    <div className='mt-10 border-t pt-8'>
      <div className='bg-white border rounded-xl p-6 md:p-8'>
        {/* Progress */}
        <div className='flex items-center justify-between mb-6'>
          <span className='text-xs font-medium text-gray-500'>Question {currentQ + 1} of {quiz.length}</span>
          <div className='flex gap-1.5'>
            {quiz.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${
                i < currentQ ? (answers[i]?.isCorrect ? 'bg-green-400' : 'bg-red-400') :
                i === currentQ ? 'bg-primary' : 'bg-gray-200'
              }`} />
            ))}
          </div>
        </div>

        {/* Question */}
        <h3 className='font-semibold text-gray-900 text-lg mb-5'>{q.question}</h3>

        {/* Options */}
        <div className='space-y-3'>
          {q.options.map((option, i) => (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={answered}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all text-sm ${getOptionStyle(i)}`}
            >
              <div className='flex items-center gap-3'>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                  answered && i === q.correctAnswer ? 'bg-green-500 text-white' :
                  answered && i === selected && i !== q.correctAnswer ? 'bg-red-500 text-white' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className='text-gray-700'>{option}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Explanation + Next */}
        {answered && (
          <div className='mt-5'>
            <div className={`p-4 rounded-lg text-sm ${
              selected === q.correctAnswer ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              <p className='font-medium mb-1'>
                {selected === q.correctAnswer ? 'Correct!' : 'Incorrect'}
              </p>
              <p className='text-xs opacity-80'>{q.explanation}</p>
            </div>
            <button
              onClick={nextQuestion}
              className='mt-4 bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors'
            >
              {currentQ + 1 >= quiz.length ? 'See Results' : 'Next Question'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChapterQuiz
