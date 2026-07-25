const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Course = require('./models/Course');
const Module = require('./models/Module');
const Lecture = require('./models/Lecture');

// Load env vars
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lms-university';

const categories = ['Web Development', 'Database', 'Computer Science', 'Business'];
const levels = ['Beginner', 'Intermediate', 'Advanced'];

const webDevTitles = [
  'HTML5 & CSS3 Masterclass',
  'JavaScript: Under the Hood',
  'React 19 Deep Dive',
  'Next.js for Production Apps',
  'Node.js & Express REST API Design',
  'MERN Stack Architecture from Scratch',
  'TypeScript Essentials for OOP Developers',
  'Vue.js & Pinia State Management',
  'Angular Core Architecture',
  'Tailwind CSS Styling & Micro-animations',
  'GraphQL API Engineering with Apollo',
  'Fullstack Web Sockets & Socket.io',
  'Chrome DevTools Performance Profiling',
  'Jamstack & Static Site Generators',
  'Redux Toolkit & Sagas State Hub',
  'Svelte Kit: Fullstack Web Apps',
  'Modern Web Performance Optimization',
  'Docker & CI/CD for Frontend Engineers',
  'Tailwind CSS 4.0 Advanced Techniques',
  'Jamstack Architectures & Headless CMS'
];

const dbTitles = [
  'SQL Essentials & Database Normalization',
  'MongoDB Architecture & Indexing Tuning',
  'PostgreSQL Administration & JSONB',
  'Redis Caching & Key-Value Engineering',
  'Cassandra Distributed Databases',
  'Neo4j Graph Database Fundamentals',
  'Elasticsearch Cluster Setup & Scaling',
  'Database Sharding & Replication Strategies',
  'SQLite Embedded System Data Storage',
  'DynamoDB Serverless NoSQL Blueprint',
  'MySQL Stored Procedures & Triggers',
  'Firebase Real-time Store Setup',
  'Oracle SQL PL/SQL Administration',
  'InfluxDB Time-series Data Analytics',
  'DB Query Optimization & Execution Plans',
  'SQL Query Tuning & Execution Plans',
  'CockroachDB: Distributed SQL Architecture',
  'Memcached: High Performance Memory Object Caching',
  'Real-time Data Streams with Apache Kafka',
  'ScyllaDB: Real-Time Big Data Engine'
];

const csTitles = [
  'Data Structures & Algorithms in JS',
  'Design Patterns & Refactoring Code',
  'Object-Oriented Programming Patterns',
  'Operating Systems Core Concepts',
  'Compilers & Lexical Parsing in Node',
  'Functional Programming in Modern JS',
  'Distributed Systems & Consistency Models',
  'Computer Networks & TCP/IP Layering',
  'Docker Containers & Kubernetes Pods',
  'Git Workflows & Collaborative Branching',
  'Cryptography: TLS & Hashing Algorithms',
  'Linux Command Line & Shell Scripting',
  'Software Testing: Unit, Integration, E2E',
  'System Design for Scale & Availability',
  'Regex (Regular Expressions) Complete Guide',
  'Assembly Language & Architecture Basics',
  'Graph Theory & Network Flows',
  'Compiler Design: AST and Code Generation',
  'Cryptography & Blockchain Mechanics',
  'Computer Vision Foundations with JS'
];

const businessTitles = [
  'Introduction to Digital Product Design',
  'Agile Project Management with Scrum',
  'Freelance Web Developer Business Guide',
  'Marketing for Tech Startups & SaaS',
  'Financial Accounting for Entrepreneurs',
  'UI/UX Design Strategy & User Research',
  'Negotiation Skills for Software Contracts',
  'Product Roadmap & Feature Prioritization',
  'Scrum Master Certification Guide',
  'SEO Essentials for Web Developers',
  'Data-Driven Decision Making & KPI Charts',
  'Corporate Communication & Team Leadership',
  'Time Management & Personal Productivity',
  'Public Speaking for Engineering Leaders',
  'Venture Capital Pitching & SaaS Metrics',
  'Product Management: Metrics & Analytics',
  'Effective Tech Leadership & Mentorship',
  'SaaS Financial Modeling & Cashflow',
  'Design Systems: Figma to React Code',
  'Digital Marketing & Growth Hacking'
];

const courseDescriptions = [
  'Learn core foundational elements, advanced design patterns, and deployment pipelines.',
  'Master intermediate and advanced concepts with hands-on practice labs and detailed code reviews.',
  'A rigorous technical course targeting production-grade design methodologies and execution structures.'
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected!');

    // Get or create evaluator user
    let instructor = await User.findOne({ role: 'evaluator' });
    if (!instructor) {
      console.log('No evaluator found. Creating a default test evaluator...');
      instructor = await User.create({
        name: 'Test Evaluator',
        email: 'evaluator@lms.com',
        password: 'password123',
        role: 'evaluator',
        bio: 'MERN Software Engineer Seeding Account'
      });
    }

    console.log('Clearing existing courses, modules, and lectures...');
    await Course.deleteMany({ instructor: instructor._id });
    await Module.deleteMany({});
    await Lecture.deleteMany({});
    console.log('Collections cleared!');

    const allCourses = [];

    // Category 1: Web Development
    webDevTitles.forEach((title, idx) => {
      allCourses.push({
        title,
        description: courseDescriptions[idx % courseDescriptions.length],
        category: 'Web Development',
        instructor: instructor._id,
        duration: 15 + (idx * 3) % 40,
        level: levels[idx % levels.length],
        language: 'English'
      });
    });

    // Category 2: Database
    dbTitles.forEach((title, idx) => {
      allCourses.push({
        title,
        description: courseDescriptions[idx % courseDescriptions.length],
        category: 'Database',
        instructor: instructor._id,
        duration: 10 + (idx * 4) % 35,
        level: levels[(idx + 1) % levels.length],
        language: 'English'
      });
    });

    // Category 3: Computer Science
    csTitles.forEach((title, idx) => {
      allCourses.push({
        title,
        description: courseDescriptions[idx % courseDescriptions.length],
        category: 'Computer Science',
        instructor: instructor._id,
        duration: 20 + (idx * 5) % 45,
        level: levels[(idx + 2) % levels.length],
        language: 'English'
      });
    });

    // Category 4: Business
    businessTitles.forEach((title, idx) => {
      allCourses.push({
        title,
        description: courseDescriptions[idx % courseDescriptions.length],
        category: 'Business',
        instructor: instructor._id,
        duration: 8 + (idx * 2) % 25,
        level: levels[idx % levels.length],
        language: 'English'
      });
    });

    console.log(`Inserting ${allCourses.length} courses...`);
    const createdCourses = await Course.insertMany(allCourses);
    console.log('Courses inserted successfully!');

    console.log('Populating modules and lectures for courses...');
    for (let i = 0; i < createdCourses.length; i++) {
      const course = createdCourses[i];

      // Add Module 1
      const mod1 = await Module.create({
        courseId: course._id,
        title: 'Module 1: Getting Started & Setup',
        order: 1
      });

      await Lecture.create({
        moduleId: mod1._id,
        title: '1.1 Course Introduction',
        description: 'Welcome and overview of the course requirements.',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: 10,
        order: 1
      });

      await Lecture.create({
        moduleId: mod1._id,
        title: '1.2 Setting Up Your Workspace',
        description: 'Configuring compilation environment parameters.',
        videoUrl: 'https://www.w3schools.com/html/movie.mp4',
        duration: 15,
        order: 2
      });

      // Add Module 2
      const mod2 = await Module.create({
        courseId: course._id,
        title: 'Module 2: Core Concepts & Practice',
        order: 2
      });

      await Lecture.create({
        moduleId: mod2._id,
        title: '2.1 Core Implementation Mechanics',
        description: 'Interactive execution guidelines and practice models.',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: 20,
        order: 1
      });
    }

    console.log('Seeding process fully completed!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
