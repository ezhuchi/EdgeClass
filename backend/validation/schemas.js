import { z } from 'zod';

// User validation schema
export const userSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
  username: z.string()
    .min(2, 'Username must be at least 2 characters')
    .max(50, 'Username must be less than 50 characters')
    .trim(),
  deviceId: z.string().min(1, 'Device ID is required'),
  createdAt: z.string().datetime()
});

// Quiz validation schema
export const quizSchema = z.object({
  id: z.string().min(1, 'Quiz ID is required'),
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters')
    .trim(),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .default(''),
  createdBy: z.string().min(1, 'Creator ID is required'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deviceId: z.string().min(1, 'Device ID is required')
});

// Question validation schema
export const questionSchema = z.object({
  id: z.string().min(1, 'Question ID is required'),
  quizId: z.string().min(1, 'Quiz ID is required'),
  question: z.string()
    .min(5, 'Question must be at least 5 characters')
    .max(500, 'Question must be less than 500 characters')
    .trim(),
  options: z.string(), // JSON string of options
  correctAnswer: z.union([z.string(), z.number()]),
  order: z.number().int().min(0)
});

// Questions batch validation
export const questionsBatchSchema = z.object({
  questions: z.array(questionSchema)
    .min(1, 'At least one question is required')
    .max(50, 'Maximum 50 questions allowed per sync'),
  deviceId: z.string().min(1, 'Device ID is required')
});

// Attempt validation schema
export const attemptSchema = z.object({
  id: z.string().min(1, 'Attempt ID is required'),
  quizId: z.string().min(1, 'Quiz ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  answers: z.string(), // JSON string of answers
  score: z.number().int().min(0),
  totalQuestions: z.number().int().min(1),
  completedAt: z.string().datetime(),
  deviceId: z.string().min(1, 'Device ID is required')
});

// Validation middleware factory
export const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.body);
      req.validatedBody = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};
