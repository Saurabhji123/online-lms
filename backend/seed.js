const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Course = require('./models/Course');
const Module = require('./models/Module');
const Lecture = require('./models/Lecture');
const Enrollment = require('./models/Enrollment');
const Quiz = require('./models/Quiz');
const Question = require('./models/Question');
const Assignment = require('./models/Assignment');
const Submission = require('./models/Submission');
const LiveSession = require('./models/LiveSession');
const Discussion = require('./models/Discussion');
const Resource = require('./models/Resource');
const Attendance = require('./models/Attendance');
const Notification = require('./models/Notification');

// Load env vars
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lms-university';

const universityCourses = [
  {
    title: 'Fullstack MERN Application Development',
    description: 'Master industry-grade fullstack engineering. Build production REST APIs using Express, Mongoose schemas, token authentication, and design rich React clients.',
    category: 'Web Development',
    duration: 40,
    level: 'Intermediate',
    language: 'English'
  },
  {
    title: 'Advanced Data Structures & Algorithms',
    description: 'Deep dive into computer science fundamentals. Analyze algorithmic complexity, implement trees, graphs, sorting strategies, and dynamic programming patterns.',
    category: 'Computer Science',
    duration: 35,
    level: 'Advanced',
    language: 'English'
  },
  {
    title: 'Database Systems & SQL Optimization',
    description: 'Learn database schema design, indexes tuning, normalization, storage engines, queries execution plans, and scaling relational and non-relational datastores.',
    category: 'Database',
    duration: 30,
    level: 'Intermediate',
    language: 'English'
  },
  {
    title: 'Software System Architecture & Scaling',
    description: 'Design highly available, distributed applications. Study microservices orchestration, load balancers, caching nodes, message queues, and replication clusters.',
    category: 'Computer Science',
    duration: 45,
    level: 'Advanced',
    language: 'English'
  },
  {
    title: 'Object-Oriented Programming (OOP) Essentials',
    description: 'Foundational concepts of object-oriented design. Implement encapsulation, inheritance, polymorphism, abstraction, and OOP architectural design patterns.',
    category: 'Computer Science',
    duration: 25,
    level: 'Beginner',
    language: 'English'
  },
  {
    title: 'Cloud Computing & DevOps Pipelines',
    description: 'Streamline software releases. Build CI/CD pipelines, configure Docker containerization, deploy container pods with Kubernetes, and manage AWS resources.',
    category: 'Computer Science',
    duration: 38,
    level: 'Advanced',
    language: 'English'
  },
  {
    title: 'UI/UX Design Systems & Figma Workflow',
    description: 'Bridge the gap between design and frontend code. Learn grid alignments, typography hierarchies, micro-interactions, components mapping, and interactive prototyping.',
    category: 'Business',
    duration: 20,
    level: 'Beginner',
    language: 'English'
  },
  {
    title: 'Introduction to Computer Networks',
    description: 'Understand how the internet functions. Explore TCP/IP layering, OSI models, routing protocols, secure connections, DNS mapping, and sockets operations.',
    category: 'Computer Science',
    duration: 28,
    level: 'Beginner',
    language: 'English'
  },
  {
    title: 'Operating Systems & Shell Scripting',
    description: 'A study of kernel architecture. Master memory allocation, threads synchronization, processes scheduling, I/O registers, and bash utility automation.',
    category: 'Computer Science',
    duration: 32,
    level: 'Intermediate',
    language: 'English'
  },
  {
    title: 'Product Management for Tech Teams',
    description: 'From idea to MVP. Develop product roadmaps, organize Agile sprints with Jira, analyze tech metrics, prioritize backlogs, and launch tech features.',
    category: 'Business',
    duration: 18,
    level: 'Beginner',
    language: 'English'
  }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected!');

    console.log('Clearing existing collections...');
    await User.deleteMany({});
    await Course.deleteMany({});
    await Module.deleteMany({});
    await Lecture.deleteMany({});
    await Enrollment.deleteMany({});
    await Quiz.deleteMany({});
    await Question.deleteMany({});
    await Assignment.deleteMany({});
    await Submission.deleteMany({});
    await LiveSession.deleteMany({});
    await Discussion.deleteMany({});
    await Resource.deleteMany({});
    await Attendance.deleteMany({});
    await Notification.deleteMany({});
    console.log('Collections cleared!');

    console.log('Creating users...');
    
    // Create Evaluator
    const evaluator = await User.create({
      name: 'Prof. Rajesh Sharma',
      email: 'evaluator@lms.com',
      password: 'password123',
      role: 'evaluator',
      bio: 'Senior Professor of Computer Science. Research focus: Distributed Systems, Databases, and Web Applications.',
      skills: ['Node.js', 'System Design', 'Databases', 'Java'],
      education: [{ institution: 'Indian Institute of Technology', degree: 'Ph.D. in Computer Science', year: 2012 }]
    });

    // Create Admin
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@lms.com',
      password: 'password123',
      role: 'admin',
      bio: 'LMS Platform Management Administrator Account.'
    });

    // Create Students
    const student1 = await User.create({
      name: 'Amit Patel',
      email: 'student@lms.com',
      password: 'password123',
      role: 'student',
      bio: 'Third-year B.Tech Computer Science student. Avid open-source contributor.',
      skills: ['HTML', 'CSS', 'JavaScript']
    });

    const student2 = await User.create({
      name: 'Subrat Kumar',
      email: 'subrat@lms.com',
      password: 'password123',
      role: 'student',
      bio: 'Undergraduate student interested in algorithmic engineering and mathematics.',
      skills: ['C++', 'Python']
    });

    const student3 = await User.create({
      name: 'Saurabh Shukla',
      email: 'saurabh@lms.com',
      password: 'password123',
      role: 'student',
      bio: 'Self-taught software engineering enthusiast focusing on MERN development.',
      skills: ['React', 'Node.js']
    });

    const student4 = await User.create({
      name: 'Priya Singh',
      email: 'priya@lms.com',
      password: 'password123',
      role: 'student',
      bio: 'Electronics engineer student pivoting to UX design and fullstack apps.',
      skills: ['Figma', 'UI/UX']
    });

    console.log('Users created!');

    console.log('Inserting courses...');
    const coursesData = universityCourses.map(course => ({
      ...course,
      instructor: evaluator._id
    }));
    const createdCourses = await Course.insertMany(coursesData);
    console.log(`Inserted ${createdCourses.length} courses!`);

    console.log('Populating modules and lectures for courses...');
    for (let i = 0; i < createdCourses.length; i++) {
      const course = createdCourses[i];

      // Module 1
      const mod1 = await Module.create({
        courseId: course._id,
        title: 'Module 1: Foundations & Architecture Setup',
        order: 1
      });

      await Lecture.create({
        moduleId: mod1._id,
        title: '1.1 Conceptual Foundations & Outline',
        description: 'Introduction to core methodologies, objectives, and course requirements overview.',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: 12,
        order: 1
      });

      await Lecture.create({
        moduleId: mod1._id,
        title: '1.2 Workspace Configuration & Tooling',
        description: 'Step-by-step workspace setup, compilers installation, and validation configurations.',
        videoUrl: 'https://www.w3schools.com/html/movie.mp4',
        duration: 18,
        order: 2
      });

      // Module 2
      const mod2 = await Module.create({
        courseId: course._id,
        title: 'Module 2: Advanced Design Patterns & Practice',
        order: 2
      });

      await Lecture.create({
        moduleId: mod2._id,
        title: '2.1 Core Implementation Paradigms',
        description: 'Advanced logical architectures, components structures, and hands-on coding labs.',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: 24,
        order: 1
      });
    }

    console.log('Modules & Lectures created!');

    console.log('Creating student enrollments...');
    // Enroll Amit, Subrat, Saurabh, Priya in Course 1
    const course1Id = createdCourses[0]._id;
    const course2Id = createdCourses[1]._id;
    const studentsList = [student1, student2, student3, student4];
    
    for (let student of studentsList) {
      await Enrollment.create({
        studentId: student._id,
        courseId: course1Id,
        progress: student === student1 ? 100 : (student === student2 ? 50 : 25)
      });
      await Enrollment.create({
        studentId: student._id,
        courseId: course2Id,
        progress: student === student1 ? 25 : 0
      });
    }
    console.log('Enrollments created!');

    console.log('Creating assignments and submissions for Course 1...');
    // Assignment
    const assignment = await Assignment.create({
      courseId: course1Id,
      title: 'Project 1: Develop REST APIs for E-Commerce Engine',
      description: 'Design and deploy robust REST endpoints for product management, shopping carts, and orders. Enforce strict Mongoose validator schemas and JSON Web Token access security.',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      maxMarks: 100
    });

    // Submissions
    await Submission.create({
      assignmentId: assignment._id,
      studentId: student1._id,
      textSubmission: 'Here is my GitHub repository link for the Project 1 submission: https://github.com/amit-patel/ecommerce-api. Built with Node/Express/MongoDB.',
      fileUrl: '/uploads/cert-mock-sample.pdf',
      status: 'evaluated',
      marks: 95,
      feedback: 'Outstanding implementation of JWT security layers and database schema constraints. Code structure is highly modular and follows solid guidelines.'
    });

    await Submission.create({
      assignmentId: assignment._id,
      studentId: student4._id,
      textSubmission: 'Completed the core shopping cart controllers and mounted secure checkout endpoints. Please find the API repository linked here: https://github.com/priya-singh/lms-api',
      fileUrl: '/uploads/cert-mock-sample.pdf',
      status: 'submitted'
    });
    console.log('Assignments & Submissions seeded!');

    console.log('Creating quizzes & questions for Course 1...');
    // Quiz
    const quiz = await Quiz.create({
      courseId: course1Id,
      title: 'Module 1 Conceptual Assessment Quiz',
      duration: 15,
      maxMarks: 30,
      maxAttempts: 2
    });

    // MCQ Questions
    await Question.create({
      quizId: quiz._id,
      type: 'MCQ',
      questionText: 'Which middleware is commonly used in Express.js to parse incoming requests with JSON payloads?',
      options: ['express.urlencoded()', 'express.static()', 'express.json()', 'cors()'],
      correctAnswer: 'express.json()',
      marks: 10
    });

    await Question.create({
      quizId: quiz._id,
      type: 'MCQ',
      questionText: 'In MongoDB, which index type provides faster access speeds for arrays by indexing each array element?',
      options: ['Compound Index', 'Multikey Index', 'Single Field Index', 'Text Index'],
      correctAnswer: 'Multikey Index',
      marks: 10
    });

    await Question.create({
      quizId: quiz._id,
      type: 'MCQ',
      questionText: 'What is the primary role of JSON Web Token (JWT) in API authorization processes?',
      options: ['To encrypt request payloads', 'To maintain session memory on backend servers', 'To securely transmit user claims as a cryptographically signed token', 'To cache static assets'],
      correctAnswer: 'To securely transmit user claims as a cryptographically signed token',
      marks: 10
    });
    console.log('Quizzes & MCQ questions seeded!');

    console.log('Creating live doubt virtual classes...');
    const liveSession = await LiveSession.create({
      courseId: course1Id,
      title: 'MERN Stack Weekly Mentorship & Doubt Coding Jam',
      date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
      duration: 60,
      meetingLink: 'https://meet.jit.si/edulearn-mern-mentorship-session'
    });

    // Attendance records
    await Attendance.create({ studentId: student1._id, courseId: course1Id, date: new Date(), status: 'Present', source: 'LiveSession' });
    await Attendance.create({ studentId: student2._id, courseId: course1Id, date: new Date(), status: 'Present', source: 'LiveSession' });
    await Attendance.create({ studentId: student3._id, courseId: course1Id, date: new Date(), status: 'Absent', source: 'LiveSession' });
    await Attendance.create({ studentId: student4._id, courseId: course1Id, date: new Date(), status: 'Present', source: 'LiveSession' });
    console.log('Live sessions and Attendance registers seeded!');

    console.log('Creating study resources...');
    await Resource.create({
      courseId: course1Id,
      title: 'MERN Architecture Best Practices (PDF Guide)',
      type: 'PDF',
      fileUrl: 'https://google.com'
    });
    await Resource.create({
      courseId: course1Id,
      title: 'JWT Authentication Integration Slide Deck (PPT)',
      type: 'PPT',
      fileUrl: 'https://google.com'
    });
    console.log('Study resources seeded!');

    console.log('Creating classroom discussions threads...');
    const thread1 = await Discussion.create({
      courseId: course1Id,
      question: 'How do you recommend handling JWT token expiration on the client side using React interceptors?',
      user: student1._id,
      answers: [
        {
          replyText: 'It is highly recommended to setup an Axios response interceptor that catches 401 statuses, triggers a secure refresh token request, and retries the original request.',
          user: evaluator._id,
          isBest: true
        },
        {
          replyText: 'Makes sense! I tried setting up an Axios interceptor yesterday and it handled token refresh silently without disrupting the user dashboard UI.',
          user: student4._id
        }
      ]
    });

    await Discussion.create({
      courseId: course1Id,
      question: 'What indexes should be added in Mongoose schemas to optimize lookup speeds on highly queried nested arrays?',
      user: student2._id,
      answers: []
    });
    console.log('Forum discussions seeded!');

    console.log('Seeding notifications history...');
    await Notification.create({
      userId: student1._id,
      type: 'Assignment',
      message: 'New Assignment published: Project 1: Develop REST APIs for E-Commerce Engine',
      isRead: false
    });
    await Notification.create({
      userId: student1._id,
      type: 'Lecture',
      message: 'New Live Doubts Class scheduled: MERN Stack Weekly Mentorship & Doubt Coding Jam',
      isRead: true
    });
    console.log('Notifications seeded!');

    console.log('Seeding process fully completed!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
