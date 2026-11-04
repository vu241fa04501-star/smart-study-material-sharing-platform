const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('../models/User');
const Subject = require('../models/Subject');
const Material = require('../models/Material');
const Review = require('../models/Review');
const Favorite = require('../models/Favorite');

const sampleSubjects = [
  {
    subjectName: 'Data Structures & Algorithms',
    description: 'Arrays, Linked Lists, Stacks, Queues, Trees, Graphs, Sorting & Dynamic Programming',
  },
  {
    subjectName: 'Database Management Systems',
    description: 'Relational Model, SQL, Normalization, ER Diagrams, Transactions, ACID Properties',
  },
  {
    subjectName: 'Operating Systems',
    description: 'Process Management, CPU Scheduling, Deadlocks, Memory Management, Virtual Memory',
  },
  {
    subjectName: 'Computer Networks',
    description: 'OSI Model, TCP/IP, Routing Algorithms, IP Addressing, Network Security',
  },
  {
    subjectName: 'Web Technologies (Full Stack)',
    description: 'HTML5, CSS3, JavaScript, React.js, Node.js, Express, MongoDB, REST APIs',
  },
  {
    subjectName: 'Software Engineering & Agile',
    description: 'SDLC, Agile Methodologies, Scrum, Testing, UML Modeling, System Architecture',
  },
  {
    subjectName: 'Artificial Intelligence & ML',
    description: 'Search Algorithms, Supervised & Unsupervised Learning, Neural Networks',
  },
  {
    subjectName: 'Object-Oriented Programming (Java/C++)',
    description: 'Encapsulation, Inheritance, Polymorphism, Abstraction, Design Patterns',
  },
];

const seedDatabase = async () => {
  try {
    const mongoUri =
      process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_study_db';
    console.log(`[Seeder] Connecting to MongoDB at: ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('[Seeder] Connected to MongoDB.');

    // 1. Seed Admin Account if it doesn't exist
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@smartstudy.edu';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        name: 'System Administrator',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
      });
      console.log(`[Seeder] Admin created: ${adminEmail} (password: ${adminPassword})`);
    } else {
      console.log(`[Seeder] Admin already exists: ${adminEmail}`);
    }

    // 2. Seed Sample Student Account
    const studentEmail = 'student@smartstudy.edu';
    let student = await User.findOne({ email: studentEmail });
    if (!student) {
      student = await User.create({
        name: 'Rahul Sharma',
        email: studentEmail,
        password: 'Student@123',
        role: 'student',
      });
      console.log(`[Seeder] Student created: ${studentEmail} (password: Student@123)`);
    } else {
      console.log(`[Seeder] Student already exists: ${studentEmail}`);
    }

    // 3. Seed Subjects
    const createdSubjects = [];
    for (const subj of sampleSubjects) {
      let existing = await Subject.findOne({ subjectName: subj.subjectName });
      if (!existing) {
        existing = await Subject.create(subj);
        console.log(`[Seeder] Subject created: ${subj.subjectName}`);
      }
      createdSubjects.push(existing);
    }

    // 4. Seed Sample Materials if collection is empty
    const materialsCount = await Material.countDocuments();
    if (materialsCount === 0 && createdSubjects.length > 0) {
      const sampleMaterials = [
        {
          title: 'Complete DSA Handwritten Notes & Interview Prep',
          description:
            'Comprehensive handwritten notes covering Trees, Graphs, Heap, Recursion, and 50+ Top LeetCode algorithmic problems with explanations.',
          subject: createdSubjects[0]._id,
          uploadedBy: student._id,
          fileUrl:
            'https://res.cloudinary.com/demo/image/upload/sample.jpg',
          fileName: 'DSA_Comprehensive_Notes.pdf',
          fileType: 'pdf',
          fileSize: 4200000,
          status: 'approved',
          downloadCount: 142,
          averageRating: 4.8,
          totalReviews: 2,
        },
        {
          title: 'DBMS SQL Cheat Sheet & Normalization Guide',
          description:
            'Quick revision guide for 1NF, 2NF, 3NF, BCNF with practical SQL queries, triggers, joins, and indexing strategies.',
          subject: createdSubjects[1]._id,
          uploadedBy: admin._id,
          fileUrl:
            'https://res.cloudinary.com/demo/image/upload/sample.jpg',
          fileName: 'DBMS_SQL_CheatSheet.pdf',
          fileType: 'pdf',
          fileSize: 2850000,
          status: 'approved',
          downloadCount: 98,
          averageRating: 4.6,
          totalReviews: 1,
        },
        {
          title: 'Operating Systems Process Scheduling & Deadlock Cheatsheet',
          description:
            'Concise illustrated formulas and diagrams for FCFS, SJF, Round Robin scheduling algorithms and Banker algorithm for deadlock avoidance.',
          subject: createdSubjects[2]._id,
          uploadedBy: student._id,
          fileUrl:
            'https://res.cloudinary.com/demo/image/upload/sample.jpg',
          fileName: 'OS_Scheduling_Deadlocks.jpg',
          fileType: 'image',
          fileSize: 1540000,
          status: 'approved',
          downloadCount: 67,
          averageRating: 4.5,
          totalReviews: 1,
        },
        {
          title: 'Full Stack MERN Architecture & REST API Guide',
          description:
            'Step-by-step structural architecture guide for building scalable MERN web applications with JWT authentication and Mongoose models.',
          subject: createdSubjects[4]._id,
          uploadedBy: admin._id,
          fileUrl:
            'https://res.cloudinary.com/demo/image/upload/sample.jpg',
          fileName: 'MERN_Architecture_Guide.pdf',
          fileType: 'pdf',
          fileSize: 3100000,
          status: 'approved',
          downloadCount: 215,
          averageRating: 5.0,
          totalReviews: 1,
        },
      ];

      for (const mat of sampleMaterials) {
        const createdMat = await Material.create(mat);
        console.log(`[Seeder] Sample material created: ${createdMat.title}`);

        // Add a sample review
        await Review.create({
          userId: admin._id,
          materialId: createdMat._id,
          rating: 5,
          comment: 'Outstanding notes! Clear explanations and diagrams.',
        });
      }
      console.log('[Seeder] Sample materials and reviews seeded.');
    }

    console.log('\n=========================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('=========================================');
    console.log('Admin Account:');
    console.log(`  Email:    ${adminEmail}`);
    console.log(`  Password: ${adminPassword}`);
    console.log('Student Account:');
    console.log(`  Email:    ${studentEmail}`);
    console.log(`  Password: Student@123`);
    console.log('=========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error]:', error.message);
    process.exit(1);
  }
};

seedDatabase();
