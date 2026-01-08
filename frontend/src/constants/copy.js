// Centralized copy for Edge Class
// All user-facing text in one place for easy updates

export const copy = {
  // Global
  appName: "Edge Class",
  tagline: "Teach even when the internet ghosts you",
  
  // Network Status
  networkStatus: {
    online4g: "Network: 4G (Online)",
    online3g: "Network: 3G (Online)",
    online2g: "Network: 2G (Online)",
    offline: "Network: Offline",
  },
  
  // Sync Status
  syncStatus: {
    allSynced: "All data synced",
    pending: (count) => `Pending: ${count} item${count === 1 ? '' : 's'}`,
    syncing: (current, total) => `Syncing ${current}/${total}...`,
    syncSuccess: (count) => `Synced: ${count} item${count === 1 ? '' : 's'} ✅`,
    syncFailed: "Some items failed to sync. Open Sync Status to retry.",
    conflictDetected: (item) => `Conflict detected for "${item}". Server version kept. View details.`,
  },
  
  // Primary Status Indicators
  statusIndicators: {
    onlineSynced: {
      label: "Online — All data synced",
      color: "green",
      icon: "✅"
    },
    onlinePending: {
      label: (count) => `Online — ${count} item${count === 1 ? '' : 's'} pending`,
      color: "amber",
      icon: "⚠️"
    },
    offlineQueued: {
      label: (count) => `Offline — ${count} item${count === 1 ? '' : 's'} queued`,
      color: "red",
      icon: "⛔"
    }
  },
  
  // Login Page
  login: {
    title: "Welcome Back",
    roleLabel: "I am a...",
    studentRole: "Student",
    teacherRole: "Teacher",
    studentCTA: "Login as Student",
    teacherCTA: "Login as Teacher",
    usernameLabel: "Username",
    usernamePlaceholder: "e.g., john_doe or teacher_maya",
    usernameHint: "💡 Choose any username (3-20 characters). It's saved locally.",
    offlineNotice: "✨ Works Offline!",
    offlineDescription: "Your login is saved locally. After your first login, the app works without internet.",
    errors: {
      emptyUsername: "Please enter a username to continue.",
      shortUsername: "Username must be at least 3 characters",
      longUsername: "Username must be less than 20 characters"
    }
  },
  
  // Student Dashboard
  studentDashboard: {
    loading: "Loading student dashboard...",
    welcomeMessage: (name) => `Welcome, ${name}!`,
    description: "Take quizzes and track your progress. Everything works offline!",
    stats: {
      available: "Available Quizzes",
      completed: "Completed",
      avgScore: "Avg Score"
    },
    tabs: {
      available: "Available Quizzes",
      scores: "My Scores"
    },
    emptyStates: {
      noQuizzes: "No quizzes available yet",
      noQuizzesDescription: "Your teachers haven't created any quizzes yet. Check back later!",
      noSearchResults: "No quizzes found",
      tryDifferentSearch: "Try a different search term",
      noAttempts: "No quiz attempts yet",
      noAttemptsDescription: "Take a quiz to see your scores here"
    },
    takeQuiz: "Take Quiz",
    retakeQuiz: "Retake Quiz",
    browseQuizzes: "Browse Quizzes"
  },
  
  // Teacher Dashboard
  teacherDashboard: {
    loading: "Loading teacher dashboard...",
    welcomeMessage: (name) => `👨‍🏫 Teacher Dashboard - Welcome, ${name}!`,
    description: "Create and manage quizzes. View student performance even offline.",
    stats: {
      myQuizzes: "My Quizzes",
      totalStudents: "Total Students",
      totalAttempts: "Total Attempts"
    },
    tabs: {
      myQuizzes: "My Quizzes",
      attempts: "📊 Student Attempts"
    },
    createPanel: {
      title: "Ready to create a new quiz?",
      description: "Build engaging quizzes that work offline for your students"
    },
    emptyStates: {
      noQuizzes: "No quizzes yet",
      noQuizzesDescription: "Create your first quiz to get started",
      noSearchResults: "No quizzes found",
      tryDifferentSearch: "Try a different search term",
      noAttempts: "No attempts yet",
      noAttemptsForQuiz: "No students have attempted this quiz yet",
      noAttemptsDescription: "Students haven't taken any quizzes yet"
    },
    createQuiz: "Create Quiz"
  },
  
  // Create Quiz Page
  createQuiz: {
    title: "Create a new quiz",
    description: "Create quizzes that work offline. Saved locally and automatically synced when online.",
    quizDetails: "Quiz Details",
    titleLabel: "Quiz Title",
    titlePlaceholder: "e.g., Introduction to Photosynthesis",
    descriptionLabel: "Description (optional)",
    descriptionPlaceholder: "Short summary students will see",
    questionHeading: (n) => `Question ${n}`,
    questionLabel: "Question Text",
    questionPlaceholder: "Type the question here",
    optionsLabel: "Options",
    optionsNote: "Select the correct option(s)",
    addOption: "+ Add Option",
    addQuestion: "+ Add Question",
    removeQuestion: "Remove Question",
    saveLocally: "Save Locally",
    saveLocallyTooltip: "Saves to your device and queues for sync",
    saveSyncNow: "Save & Sync Now",
    inlineHelp: "This quiz will be available offline for students. You can sync it now or later.",
    validation: {
      titleRequired: "Quiz title is required",
      questionRequired: "Question text is required",
      optionsRequired: "At least 2 options are required",
      correctAnswerRequired: "Please select the correct answer"
    }
  },
  
  // Sync Page
  syncPage: {
    title: "Synchronization Status",
    description: "Monitor your offline data and sync progress",
    synced: "Synced",
    stats: {
      pending: "Pending Sync"
    },
    howItWorks: {
      title: "📱 How Offline Mode Works",
      local: "All data is saved locally on your device",
      offline: "Works 100% without internet connection",
      autoSync: "Auto-syncs when connection is detected",
      noLoss: "No data loss even if offline for days"
    },
    features: {
      title: "Sync Features",
      retry: "Exponential backoff retry strategy",
      batch: "Batch processing for efficiency",
      conflict: "Conflict resolution (latest wins)",
      realtime: "Real-time sync status updates"
    },
    tips: {
      title: "💡 Pro Tips",
      manual: {
        title: "Manual Sync:",
        description: "Use the \"Sync Now\" button to trigger immediate sync"
      },
      auto: {
        title: "Auto Sync:",
        description: "Happens automatically when you reconnect to the internet"
      },
      pending: {
        title: "Pending Items:",
        description: "Yellow badge shows items waiting to sync"
      },
      failed: {
        title: "Failed Items:",
        description: "Will retry automatically with exponential backoff"
      }
    },
    cards: {
      pending: "Pending",
      synced: "Synced",
      failed: "Failed",
      total: "Total"
    },
    syncNowButton: "Sync Now",
    retryFailed: "Retry Failed",
    filters: {
      all: "All",
      pending: "Pending",
      failed: "Failed",
      success: "Success"
    },
    emptyState: {
      title: "No recent sync activity",
      body: "Sync activity will appear here. You can also run manual sync.",
      cta: "Sync Now"
    },
    deviceInfo: {
      title: "Device Information",
      deviceId: "Device ID",
      description: "Used for sync & conflict resolution"
    }
  },
  
  // Quiz Taking
  quiz: {
    backToDashboard: "← Back to Dashboard",
    questionProgress: (current, total) => `Question ${current} of ${total}`,
    previous: "← Previous",
    next: "Next →",
    submit: "Submit Quiz",
    submitting: "Submitting...",
    questionNavigator: "Question Navigator",
    offlineNotice: "📡 You're currently offline. Your answers are being saved locally and will sync when you're back online.",
    confirmExit: "Are you sure you want to exit? Your progress will be lost.",
    confirmSubmit: (unanswered) => `${unanswered} question(s) unanswered. Submit anyway?`,
    results: {
      congratulations: "Congratulations!",
      goodEffort: "Good Effort!",
      completed: "You've completed the quiz",
      backToDashboard: "Back to Dashboard",
      retake: "Retake Quiz",
      reviewAnswers: "Review Answers",
      yourAnswer: "Your answer:",
      correctAnswer: "Correct answer:",
      notAnswered: "Not answered",
      savedOffline: "✅ Your answers have been saved offline and will sync automatically when you're online",
      willSync: "📡 You're currently offline. Results will sync when connection is restored."
    }
  },
  
  // Toasts
  toasts: {
    loginSuccess: "Login successful!",
    quizCreated: "Quiz created and queued for sync",
    quizSaved: "Saved locally — queued for sync",
    quizSubmitted: "Quiz submitted successfully!",
    syncStarted: "Starting sync...",
    syncComplete: "All items synced ✅",
    syncFailed: "Some items failed to sync",
    quizLoaded: (count) => `Quiz loaded: ${count} question${count === 1 ? '' : 's'}`,
    itemsQueued: (count) => `${count} item${count === 1 ? '' : 's'} queued for sync`,
  },
  
  // Onboarding
  onboarding: {
    step1: {
      title: "Welcome to Edge Class!",
      body: "Edge Class is local-first: your device is the database, the server is just a backup. Everything works offline.",
      icon: "💾"
    },
    step2Teacher: {
      title: "Create Quizzes",
      body: "Build quizzes that work completely offline. They'll sync automatically when you're online.",
      icon: "📝"
    },
    step2Student: {
      title: "Take Quizzes",
      body: "Answer quizzes offline and your scores are saved locally. Results sync when you're back online.",
      icon: "✍️"
    },
    step3: {
      title: "Check Sync Status",
      body: "Monitor what's pending and manually trigger sync anytime from the Sync Status page.",
      icon: "🔄"
    },
    dontShowAgain: "Don't show this again",
    getStarted: "Get Started",
    next: "Next",
    skip: "Skip"
  },
  
  // Network Throttle
  networkInfo: {
    "2g": "2G — low bandwidth: text-only content",
    "3g": "3G — reduced media",
    "4g": "4G — full media",
    "slow-2g": "Slow 2G — minimal data",
    lowDataMode: "Low-data mode",
    toggleLowData: "Toggle low-data mode"
  },
  
  // Common UI
  common: {
    searchPlaceholder: "Search...",
    clearSearch: "Clear Search"
  },
  
  // Errors
  errors: {
    generic: "Something went wrong. Please try again.",
    quizNotFound: "Quiz not found",
    quizNoQuestions: "This quiz has no questions",
    loadFailed: "Failed to load data",
    saveFailed: "Failed to save data",
    syncFailed: "Sync failed. Please try again.",
    networkError: "Network error. Please check your connection.",
    validationError: "Please fix the errors before continuing"
  }
};
