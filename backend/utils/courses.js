/**
 * Curated course recommendations mapped to skills.
 * Sources: Coursera, Udemy, freeCodeCamp, edX, YouTube.
 */
const courseDatabase = {
  // ── Programming Languages ──────────────────────────────
  "javascript": [
    { title: "JavaScript: The Complete Guide", platform: "Udemy", url: "https://www.udemy.com/course/javascript-the-complete-guide/", difficulty: "beginner", duration: "30h" },
    { title: "freeCodeCamp JavaScript Algorithms", platform: "freeCodeCamp", url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/", difficulty: "beginner", duration: "300h" },
  ],
  "typescript": [
    { title: "Understanding TypeScript", platform: "Udemy", url: "https://www.udemy.com/course/understanding-typescript/", difficulty: "intermediate", duration: "15h" },
    { title: "TypeScript Crash Course", platform: "freeCodeCamp", url: "https://www.youtube.com/watch?v=BCg4U1FzODs", difficulty: "beginner", duration: "2h" },
  ],
  "python": [
    { title: "Python for Everybody", platform: "Coursera", url: "https://www.coursera.org/specializations/python", difficulty: "beginner", duration: "40h" },
    { title: "100 Days of Code: Python", platform: "Udemy", url: "https://www.udemy.com/course/100-days-of-code/", difficulty: "beginner", duration: "60h" },
  ],
  "java": [
    { title: "Java Programming Masterclass", platform: "Udemy", url: "https://www.udemy.com/course/java-the-complete-java-developer-course/", difficulty: "beginner", duration: "80h" },
    { title: "CS106A - Programming Methodology", platform: "Stanford/edX", url: "https://www.edx.org/course/cs50s-introduction-to-computer-science", difficulty: "beginner", duration: "40h" },
  ],
  "go": [
    { title: "Go: The Complete Developer's Guide", platform: "Udemy", url: "https://www.udemy.com/course/go-the-complete-developers-guide/", difficulty: "beginner", duration: "10h" },
    { title: "Learn Go Programming", platform: "freeCodeCamp", url: "https://www.youtube.com/watch?v=un6ZyFkqFKo", difficulty: "beginner", duration: "4h" },
  ],
  "rust": [
    { title: "Rust Programming Course", platform: "freeCodeCamp", url: "https://www.youtube.com/watch?v=MsocPEZBd-M", difficulty: "intermediate", duration: "3h" },
    { title: "The Rust Programming Language Book", platform: "Rust Docs", url: "https://doc.rust-lang.org/book/", difficulty: "beginner", duration: "20h" },
  ],
  "c++": [
    { title: "C++ Nanodegree Program", platform: "Udacity", url: "https://www.udacity.com/course/c-plus-plus-nanodegree--nd213", difficulty: "intermediate", duration: "120h" },
    { title: "Beginning C++ Programming", platform: "Udemy", url: "https://www.udemy.com/course/beginning-c-plus-plus-programming/", difficulty: "beginner", duration: "30h" },
  ],
  "csharp": [
    { title: "C# Fundamentals", platform: "Microsoft Learn", url: "https://learn.microsoft.com/en-us/training/paths/csharp-first-steps/", difficulty: "beginner", duration: "10h" },
    { title: "C# .NET Core Masterclass", platform: "Udemy", url: "https://www.udemy.com/course/net-core-31-aspnet-core-31/", difficulty: "beginner", duration: "40h" },
  ],
  "sql": [
    { title: "SQL for Data Science", platform: "Coursera", url: "https://www.coursera.org/learn/sql-for-data-science", difficulty: "beginner", duration: "14h" },
    { title: "The Ultimate MySQL Bootcamp", platform: "Udemy", url: "https://www.udemy.com/course/the-ultimate-mysql-bootcamp-go-from-sql-beginner-to-expert/", difficulty: "beginner", duration: "20h" },
  ],
  "graphql": [
    { title: "GraphQL with React: The Complete Guide", platform: "Udemy", url: "https://www.udemy.com/course/graphql-with-react-course/", difficulty: "intermediate", duration: "15h" },
    { title: "Introduction to GraphQL", platform: "edX", url: "https://www.edx.org/course/graphql", difficulty: "beginner", duration: "6h" },
  ],

  // ── Frontend Frameworks ────────────────────────────────
  "react": [
    { title: "React - The Complete Guide", platform: "Udemy", url: "https://www.udemy.com/course/react-the-complete-guide-incl-redux/", difficulty: "beginner", duration: "50h" },
    { title: "Epic React", platform: "EpicReact.dev", url: "https://epicreact.dev/", difficulty: "intermediate", duration: "40h" },
    { title: "freeCodeCamp React Course", platform: "freeCodeCamp", url: "https://www.youtube.com/watch?v=bMknfKXIFA8", difficulty: "beginner", duration: "10h" },
  ],
  "angular": [
    { title: "Angular - The Complete Guide", platform: "Udemy", url: "https://www.udemy.com/course/the-complete-guide-to-angular-2/", difficulty: "beginner", duration: "35h" },
    { title: "Tour of Heroes Angular Tutorial", platform: "Angular.io", url: "https://angular.io/tutorial", difficulty: "beginner", duration: "5h" },
  ],
  "vue": [
    { title: "Vue - The Complete Guide", platform: "Udemy", url: "https://www.udemy.com/course/vuejs-2-the-complete-guide/", difficulty: "beginner", duration: "30h" },
    { title: "Intro to Vue 3", platform: "Vue School", url: "https://vueschool.io/courses/intro-to-vue-3", difficulty: "beginner", duration: "3h" },
  ],
  "nextjs": [
    { title: "Next.js 14 Crash Course", platform: "freeCodeCamp", url: "https://www.youtube.com/watch?v=KjY94sAKnWg", difficulty: "intermediate", duration: "3h" },
    { title: "Next.js & React - The Complete Guide", platform: "Udemy", url: "https://www.udemy.com/course/nextjs-react-the-complete-guide/", difficulty: "intermediate", duration: "30h" },
  ],
  "svelte": [
    { title: "Svelte.js - The Complete Guide", platform: "Udemy", url: "https://www.udemy.com/course/sveltejs-the-complete-guide/", difficulty: "beginner", duration: "15h" },
    { title: "Svelte Tutorial", platform: "Svelte.dev", url: "https://svelte.dev/tutorial/basics", difficulty: "beginner", duration: "3h" },
  ],
  "tailwind": [
    { title: "Tailwind CSS Course", platform: "freeCodeCamp", url: "https://www.youtube.com/watch?v=ft30zcMlFao", difficulty: "beginner", duration: "2h" },
    { title: "Tailwind CSS From Scratch", platform: "Udemy", url: "https://www.udemy.com/course/tailwind-css-from-scratch/", difficulty: "beginner", duration: "10h" },
  ],
  "redux": [
    { title: "Redux Toolkit Tutorial", platform: "freeCodeCamp", url: "https://www.youtube.com/watch?v=bbkBuqC1rU4", difficulty: "intermediate", duration: "2h" },
    { title: "Modern React with Redux", platform: "Udemy", url: "https://www.udemy.com/course/react-redux/", difficulty: "intermediate", duration: "30h" },
  ],

  // ── Backend ────────────────────────────────────────────
  "node": [
    { title: "Node.js Developer Course", platform: "Udemy", url: "https://www.udemy.com/course/the-complete-nodejs-developer-course-2/", difficulty: "beginner", duration: "35h" },
    { title: "Node.js and Express.js", platform: "freeCodeCamp", url: "https://www.youtube.com/watch?v=Oe421EPjeBE", difficulty: "beginner", duration: "8h" },
  ],
  "express": [
    { title: "Express.js Crash Course", platform: "freeCodeCamp", url: "https://www.youtube.com/watch?v=6R0H7RMkm14", difficulty: "beginner", duration: "2h" },
    { title: "REST APIs with Express", platform: "Udemy", url: "https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/", difficulty: "intermediate", duration: "25h" },
  ],
  "django": [
    { title: "Django for Everybody", platform: "Coursera", url: "https://www.coursera.org/specializations/django", difficulty: "beginner", duration: "20h" },
    { title: "Python Django Web Framework", platform: "freeCodeCamp", url: "https://www.youtube.com/watch?v=F5mRW0DJ-UQ", difficulty: "beginner", duration: "12h" },
  ],
  "flask": [
    { title: "Flask Web Development", platform: "freeCodeCamp", url: "https://www.youtube.com/watch?v=Z1RJmh_OqeA", difficulty: "beginner", duration: "3h" },
    { title: "REST APIs with Flask", platform: "Udemy", url: "https://www.udemy.com/course/rest-api-flask-and-python/", difficulty: "intermediate", duration: "10h" },
  ],
  "nestjs": [
    { title: "NestJS: The Complete Guide", platform: "Udemy", url: "https://www.udemy.com/course/nestjs-the-complete-developers-guide/", difficulty: "intermediate", duration: "20h" },
    { title: "NestJS Fundamentals", platform: "freeCodeCamp", url: "https://www.youtube.com/watch?v=2nS4Y1W2GF8", difficulty: "intermediate", duration: "4h" },
  ],

  // ── Databases ──────────────────────────────────────────
  "mongodb": [
    { title: "MongoDB University", platform: "MongoDB", url: "https://university.mongodb.com/", difficulty: "beginner", duration: "12h" },
    { title: "MongoDB - The Complete Guide", platform: "Udemy", url: "https://www.udemy.com/course/mongodb-the-complete-developers-guide/", difficulty: "beginner", duration: "15h" },
  ],
  "postgresql": [
    { title: "PostgreSQL for Everybody", platform: "Coursera", url: "https://www.coursera.org/specializations/postgresql-for-everybody", difficulty: "beginner", duration: "20h" },
    { title: "SQL & PostgreSQL for Beginners", platform: "freeCodeCamp", url: "https://www.youtube.com/watch?v=qw--VYLpxG4", difficulty: "beginner", duration: "4h" },
  ],
  "redis": [
    { title: "Redis University", platform: "Redis", url: "https://university.redis.com/", difficulty: "beginner", duration: "6h" },
    { title: "Redis Crash Course", platform: "freeCodeCamp", url: "https://www.youtube.com/watch?v=j8nZZMa_hjE", difficulty: "beginner", duration: "1h" },
  ],
  "elasticsearch": [
    { title: "Elasticsearch Engineer I", platform: "Elastic", url: "https://www.elastic.co/training/elasticsearch-engineer-i", difficulty: "intermediate", duration: "16h" },
    { title: "Elasticsearch Crash Course", platform: "freeCodeCamp", url: "https://www.youtube.com/watch?v=qa6i1KX7ceA", difficulty: "beginner", duration: "2h" },
  ],

  // ── Cloud ──────────────────────────────────────────────
  "aws": [
    { title: "AWS Cloud Practitioner Essentials", platform: "AWS", url: "https://aws.amazon.com/training/learn-about/cloud-practitioner/", difficulty: "beginner", duration: "6h" },
    { title: "AWS Solutions Architect Associate", platform: "Udemy", url: "https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/", difficulty: "intermediate", duration: "40h" },
  ],
  "azure": [
    { title: "Microsoft Azure Fundamentals (AZ-900)", platform: "Microsoft Learn", url: "https://learn.microsoft.com/en-us/training/paths/microsoft-azure-fundamentals/", difficulty: "beginner", duration: "10h" },
    { title: "Azure Administrator (AZ-104)", platform: "Udemy", url: "https://www.udemy.com/course/azure-administrator-az-104/", difficulty: "intermediate", duration: "30h" },
  ],
  "gcp": [
    { title: "Google Cloud Digital Leader", platform: "Google Cloud", url: "https://cloud.google.com/learn/certification/digital-leader", difficulty: "beginner", duration: "8h" },
    { title: "GCP Associate Cloud Engineer", platform: "Udemy", url: "https://www.udemy.com/course/google-cloud-certification-associate-cloud-engineer/", difficulty: "intermediate", duration: "25h" },
  ],

  // ── DevOps ─────────────────────────────────────────────
  "docker": [
    { title: "Docker Mastery", platform: "Udemy", url: "https://www.udemy.com/course/docker-mastery/", difficulty: "beginner", duration: "20h" },
    { title: "Docker for Beginners", platform: "freeCodeCamp", url: "https://www.youtube.com/watch?v=9zUHg7xjIqQ", difficulty: "beginner", duration: "2h" },
  ],
  "kubernetes": [
    { title: "Kubernetes for Developers (CKAD)", platform: "Udemy", url: "https://www.udemy.com/course/certified-kubernetes-application-developer/", difficulty: "intermediate", duration: "25h" },
    { title: "Kubernetes Crash Course", platform: "freeCodeCamp", url: "https://www.youtube.com/watch?v=s_o8dw9Rtw4", difficulty: "beginner", duration: "2h" },
  ],
  "terraform": [
    { title: "Terraform Associate (003)", platform: "Udemy", url: "https://www.udemy.com/course/terraform-beginner-to-advanced/", difficulty: "intermediate", duration: "20h" },
    { title: "Terraform Basics", platform: "HashiCorp Learn", url: "https://developer.hashicorp.com/terraform/tutorials/aws-get-started", difficulty: "beginner", duration: "4h" },
  ],
  "github actions": [
    { title: "GitHub Actions Deep Dive", platform: "Pluralsight", url: "https://www.pluralsight.com/courses/github-actions-deep-dive", difficulty: "intermediate", duration: "6h" },
    { title: "CI/CD with GitHub Actions", platform: "freeCodeCamp", url: "https://www.youtube.com/watch?v=R8_veQiYBjI", difficulty: "beginner", duration: "2h" },
  ],

  // ── Testing ────────────────────────────────────────────
  "jest": [
    { title: "Testing JavaScript with Jest", platform: "Udemy", url: "https://www.udemy.com/course/jest-testing-and-mocking/", difficulty: "beginner", duration: "6h" },
    { title: "Jest Crash Course", platform: "freeCodeCamp", url: "https://www.youtube.com/watch?v=7r4xVDI2vho", difficulty: "beginner", duration: "1h" },
  ],
  "cypress": [
    { title: "Cypress End-to-End Testing", platform: "Udemy", url: "https://www.udemy.com/course/cypress-end-to-end-testing/", difficulty: "intermediate", duration: "12h" },
    { title: "Cypress Crash Course", platform: "freeCodeCamp", url: "https://www.youtube.com/watch?v=7N63cMKosIE", difficulty: "beginner", duration: "2h" },
  ],
  "playwright": [
    { title: "Playwright Testing Tutorial", platform: "freeCodeCamp", url: "https://www.youtube.com/watch?v=zRcEf_rwC6s", difficulty: "beginner", duration: "3h" },
    { title: "Playwright: The Complete Guide", platform: "Udemy", url: "https://www.udemy.com/course/playwright-testing-mastery/", difficulty: "intermediate", duration: "15h" },
  ],

  // ── AI/ML ──────────────────────────────────────────────
  "machine learning": [
    { title: "Machine Learning Specialization", platform: "Coursera", url: "https://www.coursera.org/specializations/machine-learning-introduction", difficulty: "beginner", duration: "60h" },
    { title: "ML for Everybody", platform: "freeCodeCamp", url: "https://www.youtube.com/watch?v=i_LwzRVP7bg", difficulty: "beginner", duration: "5h" },
  ],
  "deep learning": [
    { title: "Deep Learning Specialization", platform: "Coursera", url: "https://www.coursera.org/specializations/deep-learning", difficulty: "intermediate", duration: "80h" },
    { title: "Neural Networks from Scratch", platform: "freeCodeCamp", url: "https://www.youtube.com/watch?v=w8yWXqWQYmU", difficulty: "intermediate", duration: "3h" },
  ],
  "nlp": [
    { title: "Natural Language Processing with Python", platform: "Coursera", url: "https://www.coursera.org/specializations/natural-language-processing", difficulty: "intermediate", duration: "30h" },
    { title: "NLP Crash Course", platform: "freeCodeCamp", url: "https://www.youtube.com/watch?v=fQf2qUqY0qc", difficulty: "intermediate", duration: "4h" },
  ],
  "tensorflow": [
    { title: "TensorFlow Developer Certificate", platform: "Udemy", url: "https://www.udemy.com/course/tensorflow-developer-certificate/", difficulty: "intermediate", duration: "30h" },
    { title: "TensorFlow 2.0 Complete Course", platform: "freeCodeCamp", url: "https://www.youtube.com/watch?v=tPYj3fFJGjk", difficulty: "beginner", duration: "7h" },
  ],
  "pytorch": [
    { title: "PyTorch for Deep Learning", platform: "freeCodeCamp", url: "https://www.youtube.com/watch?v=V_xro1bcAuA", difficulty: "intermediate", duration: "25h" },
    { title: "PyTorch Zero to GANs", platform: "freeCodeCamp", url: "https://www.freecodecamp.org/news/pytorch-zero-to-gans/", difficulty: "intermediate", duration: "20h" },
  ],

  // ── Mobile ─────────────────────────────────────────────
  "react native": [
    { title: "React Native - The Complete Guide", platform: "Udemy", url: "https://www.udemy.com/course/react-native-the-practical-guide/", difficulty: "intermediate", duration: "40h" },
    { title: "Learn React Native", platform: "freeCodeCamp", url: "https://www.youtube.com/watch?v=0-S5a0eXPoc", difficulty: "beginner", duration: "2h" },
  ],
  "flutter": [
    { title: "Flutter & Dart - The Complete Guide", platform: "Udemy", url: "https://www.udemy.com/course/learn-flutter-dart-to-build-ios-android-apps/", difficulty: "beginner", duration: "40h" },
    { title: "Flutter Crash Course", platform: "freeCodeCamp", url: "https://www.youtube.com/watch?v=VPvVD8t02U8", difficulty: "beginner", duration: "2h" },
  ],

  // ── Auth & Security ────────────────────────────────────
  "jwt": [
    { title: "JWT Authentication Tutorial", platform: "freeCodeCamp", url: "https://www.youtube.com/watch?v=7nafaH9jDDk", difficulty: "intermediate", duration: "1h" },
    { title: "Node.js Authentication with JWT", platform: "Udemy", url: "https://www.udemy.com/course/nodejs-authentication-with-jwt/", difficulty: "intermediate", duration: "5h" },
  ],
  "oauth": [
    { title: "OAuth 2.0 in Depth", platform: "Udemy", url: "https://www.udemy.com/course/oauth-2-0-in-depth/", difficulty: "intermediate", duration: "6h" },
    { title: "OAuth 2.0 & OpenID Connect", platform: "Coursera", url: "https://www.coursera.org/learn/oauth-2-0", difficulty: "intermediate", duration: "8h" },
  ],

  // ── Tools & Concepts ───────────────────────────────────
  "git": [
    { title: "Git & GitHub Crash Course", platform: "freeCodeCamp", url: "https://www.youtube.com/watch?v=RGOj5yH7evk", difficulty: "beginner", duration: "1h" },
    { title: "The Git & Github Bootcamp", platform: "Udemy", url: "https://www.udemy.com/course/git-and-github-bootcamp/", difficulty: "beginner", duration: "12h" },
  ],
  "microservices": [
    { title: "Microservices Architecture", platform: "freeCodeCamp", url: "https://www.youtube.com/watch?v=lh_jxSgP4iE", difficulty: "intermediate", duration: "3h" },
    { title: "Microservices with Node.js & Docker", platform: "Udemy", url: "https://www.udemy.com/course/microservices-with-node-js-and-docker/", difficulty: "advanced", duration: "25h" },
  ],
  "system design": [
    { title: "System Design Interview Course", platform: "freeCodeCamp", url: "https://www.youtube.com/watch?v=o7khfYPvFJk", difficulty: "intermediate", duration: "2h" },
    { title: "Grokking the System Design Interview", platform: "DesignGurus", url: "https://www.designgurus.org/course/grokking-the-system-design-interview", difficulty: "intermediate", duration: "20h" },
  ],
  "docker": [
    { title: "Docker Mastery", platform: "Udemy", url: "https://www.udemy.com/course/docker-mastery/", difficulty: "beginner", duration: "20h" },
    { title: "Docker for Beginners", platform: "freeCodeCamp", url: "https://www.youtube.com/watch?v=9zUHg7xjIqQ", difficulty: "beginner", duration: "2h" },
  ],
  "kubernetes": [
    { title: "Kubernetes for Developers (CKAD)", platform: "Udemy", url: "https://www.udemy.com/course/certified-kubernetes-application-developer/", difficulty: "intermediate", duration: "25h" },
    { title: "Kubernetes Crash Course", platform: "freeCodeCamp", url: "https://www.youtube.com/watch?v=s_o8dw9Rtw4", difficulty: "beginner", duration: "2h" },
  ],
  "ci/cd": [
    { title: "CI/CD Pipeline with Jenkins", platform: "freeCodeCamp", url: "https://www.youtube.com/watch?v=5JXx8X5Vz9E", difficulty: "intermediate", duration: "3h" },
    { title: "DevOps CI/CD Masterclass", platform: "Udemy", url: "https://www.udemy.com/course/devops-ci-cd-masterclass/", difficulty: "intermediate", duration: "20h" },
  ],
  "agile": [
    { title: "Agile & Scrum Fundamentals", platform: "Coursera", url: "https://www.coursera.org/learn/agile-and-scrum-fundamentals", difficulty: "beginner", duration: "6h" },
    { title: "Scrum Master Certification", platform: "Udemy", url: "https://www.udemy.com/course/scrum-master-certification/", difficulty: "beginner", duration: "8h" },
  ],

  // ── General / Soft Skills ──────────────────────────────
  "problem solving": [
    { title: "Problem Solving with Algorithms", platform: "freeCodeCamp", url: "https://www.youtube.com/watch?v=9TlHvipP5yA", difficulty: "intermediate", duration: "3h" },
    { title: "LeetCode Problem Solving", platform: "LeetCode", url: "https://leetcode.com/", difficulty: "beginner", duration: "self-paced" },
  ],
  "leadership": [
    { title: "Leadership Principles", platform: "Coursera", url: "https://www.coursera.org/learn/leadership-principles", difficulty: "beginner", duration: "10h" },
    { title: "Engineering Leadership", platform: "Pluralsight", url: "https://www.pluralsight.com/courses/engineering-leadership", difficulty: "intermediate", duration: "4h" },
  ],
};

/**
 * Get course recommendations for one or more missing skills.
 * @param {string[]} skills - Array of missing skill names
 * @returns {object[]} Array of { skill, title, platform, url, difficulty, duration }
 */
function getCourseRecommendations(skills) {
  const normalizedSkills = skills.map((s) =>
    s.toLowerCase().replace(/\./g, "").replace(/\s+/g, " ").trim()
  );

  const recommendations = [];
  const seen = new Set();

  for (const skill of normalizedSkills) {
    // Try exact match first
    if (courseDatabase[skill]) {
      for (const course of courseDatabase[skill]) {
        const key = `${course.title}|${course.platform}`;
        if (!seen.has(key)) {
          seen.add(key);
          recommendations.push({ skill, ...course });
        }
      }
      continue;
    }

    // Try partial match (e.g., "react.js" -> "react", "next.js" -> "nextjs")
    const partialMatch = Object.keys(courseDatabase).find(
      (key) => skill.includes(key) || key.includes(skill)
    );
    if (partialMatch) {
      for (const course of courseDatabase[partialMatch]) {
        const key = `${course.title}|${course.platform}`;
        if (!seen.has(key)) {
          seen.add(key);
          recommendations.push({ skill, ...course });
        }
      }
    }
  }

  return recommendations;
}

module.exports = { courseDatabase, getCourseRecommendations };