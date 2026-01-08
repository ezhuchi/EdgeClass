// Demo Data Seeder for GhostClass
// Run this in browser console to populate with sample data

import { createQuiz } from './db/quizzes';
import { loginUser } from './db/users';

export const sampleQuizzes = [
  {
    title: "Introduction to Science",
    description: "Basic scientific concepts for beginners",
    questions: [
      {
        question: "What is the chemical formula for water?",
        options: ["H2O", "CO2", "O2", "N2"],
        correctAnswer: "H2O"
      },
      {
        question: "Which planet is closest to the Sun?",
        options: ["Venus", "Mars", "Mercury", "Earth"],
        correctAnswer: "Mercury"
      },
      {
        question: "What is the powerhouse of the cell?",
        options: ["Nucleus", "Mitochondria", "Ribosome", "Chloroplast"],
        correctAnswer: "Mitochondria"
      },
      {
        question: "What gas do plants absorb from the atmosphere?",
        options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
        correctAnswer: "Carbon Dioxide"
      },
      {
        question: "What is the speed of light?",
        options: ["300,000 km/s", "150,000 km/s", "450,000 km/s", "600,000 km/s"],
        correctAnswer: "300,000 km/s"
      }
    ]
  },
  {
    title: "Indian History - Freedom Struggle",
    description: "Key events and personalities in India's independence movement",
    questions: [
      {
        question: "In which year did India gain independence?",
        options: ["1945", "1946", "1947", "1948"],
        correctAnswer: "1947"
      },
      {
        question: "Who gave the slogan 'Jai Hind'?",
        options: ["Mahatma Gandhi", "Jawaharlal Nehru", "Subhas Chandra Bose", "Bhagat Singh"],
        correctAnswer: "Subhas Chandra Bose"
      },
      {
        question: "When was the Quit India Movement launched?",
        options: ["1940", "1942", "1944", "1946"],
        correctAnswer: "1942"
      },
      {
        question: "Who was the first President of India?",
        options: ["Jawaharlal Nehru", "Rajendra Prasad", "Sardar Patel", "B.R. Ambedkar"],
        correctAnswer: "Rajendra Prasad"
      }
    ]
  },
  {
    title: "Mathematics Basics",
    description: "Fundamental mathematical concepts",
    questions: [
      {
        question: "What is 15 × 12?",
        options: ["180", "160", "200", "150"],
        correctAnswer: "180"
      },
      {
        question: "What is the square root of 144?",
        options: ["10", "11", "12", "13"],
        correctAnswer: "12"
      },
      {
        question: "What is 25% of 200?",
        options: ["25", "50", "75", "100"],
        correctAnswer: "50"
      },
      {
        question: "What is the value of π (pi) approximately?",
        options: ["2.14", "3.14", "4.14", "5.14"],
        correctAnswer: "3.14"
      },
      {
        question: "What is the sum of angles in a triangle?",
        options: ["90°", "180°", "270°", "360°"],
        correctAnswer: "180°"
      }
    ]
  },
  {
    title: "English Grammar",
    description: "Basic English grammar rules",
    questions: [
      {
        question: "Which is the correct plural of 'child'?",
        options: ["childs", "childes", "children", "childrens"],
        correctAnswer: "children"
      },
      {
        question: "Identify the noun: 'The quick brown fox jumps'",
        options: ["quick", "brown", "fox", "jumps"],
        correctAnswer: "fox"
      },
      {
        question: "Which article is correct: '___ apple a day'",
        options: ["a", "an", "the", "no article"],
        correctAnswer: "an"
      }
    ]
  },
  {
    title: "Geography of India",
    description: "Learn about Indian geography",
    questions: [
      {
        question: "What is the capital of India?",
        options: ["Mumbai", "Kolkata", "New Delhi", "Chennai"],
        correctAnswer: "New Delhi"
      },
      {
        question: "Which is the longest river in India?",
        options: ["Yamuna", "Brahmaputra", "Ganga", "Godavari"],
        correctAnswer: "Ganga"
      },
      {
        question: "How many states are in India?",
        options: ["28", "29", "30", "31"],
        correctAnswer: "28"
      },
      {
        question: "Which state is known as 'God's Own Country'?",
        options: ["Goa", "Kerala", "Tamil Nadu", "Karnataka"],
        correctAnswer: "Kerala"
      }
    ]
  }
];

// Seed function
export const seedDemoData = async () => {
  console.log('🌱 Seeding demo data...');
  
  try {
    // Login as demo user
    await loginUser('DemoTeacher');
    console.log('✅ Demo user created');
    
    // Create all sample quizzes
    for (const quiz of sampleQuizzes) {
      await createQuiz(quiz);
      console.log(`✅ Created quiz: ${quiz.title}`);
    }
    
    console.log('🎉 Demo data seeded successfully!');
    console.log(`📚 Created ${sampleQuizzes.length} quizzes`);
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
};

// Auto-run if in development
if (import.meta.env.DEV) {
  window.seedDemoData = seedDemoData;
  console.log('💡 Run seedDemoData() in console to populate sample quizzes');
}
