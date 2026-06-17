/**
 * Comprehensive skills database for ATS matching.
 * Organized by category for detailed analysis.
 */
const skillsDatabase = [
  // ── Programming Languages ──────────────────────────────
  "javascript", "js", "typescript", "ts", "python", "java",
  "c++", "c#", "csharp", "ruby", "go", "golang", "rust",
  "swift", "kotlin", "php", "scala", "perl", "lua", "r",
  "dart", "elixir", "clojure", "haskell", "bash", "shell",
  "powershell", "sql", "graphql",

  // ── Frontend Frameworks & Libraries ────────────────────
  "react", "react.js", "reactjs", "angular", "vue", "vue.js",
  "vuejs", "svelte", "next.js", "nextjs", "nuxt", "nuxt.js",
  "gatsby", "jquery", "ember", "backbone", "htmx", "alpine.js",
  "solidjs", "solid", "qwik",

  // ── Frontend Tools & Styling ───────────────────────────
  "html", "html5", "css", "css3", "sass", "scss", "less",
  "tailwind", "tailwindcss", "bootstrap", "material ui", "mui",
  "chakra ui", "styled components", "css modules", "postcss",
  "webpack", "vite", "babel", "esbuild", "rollup", "parcel",

  // ── State Management ─────────────────────────────────
  "redux", "redux toolkit", "mobx", "zustand", "recoil",
  "context api", "pinia", "vuex", "ngrx",

  // ── Backend Frameworks ────────────────────────────────
  "node.js", "node", "express", "express.js", "nestjs", "nest",
  "django", "flask", "fastapi", "spring boot", "spring",
  "rails", "ruby on rails", "laravel", "asp.net", "dotnet",
  "koajs", "koa", "fastify", "hapi", "phoenix",

  // ── Databases ─────────────────────────────────────────
  "mongodb", "mongo", "mongoose", "postgresql", "postgres",
  "mysql", "sqlite", "redis", "elasticsearch", "cassandra",
  "dynamodb", "firestore", "firebase", "supabase", "mariadb",
  "oracle", "sql server", "cockroachdb", "neo4j",

  // ─── ORMs / ODMs ───────────────────────────────────────
  "prisma", "typeorm", "sequelize", "knex", "drizzle",
  "sqlalchemy", "django orm", "entity framework", "mongoose",

  // ── Cloud & Infrastructure ─────────────────────────────
  "aws", "amazon web services", "ec2", "s3", "lambda",
  "ecs", "eks", "cloudformation", "azure", "microsoft azure",
  "gcp", "google cloud", "cloud run", "firebase", "heroku",
  "digital ocean", "vercel", "netlify", "render", "railway",

  // ── DevOps & CI/CD ─────────────────────────────────────
  "docker", "kubernetes", "k8s", "jenkins", "github actions",
  "gitlab ci", "circleci", "travis ci", "terraform", "ansible",
  "puppet", "chef", "argo", "helm", "prometheus", "grafana",

  // ── Testing ────────────────────────────────────────────
  "jest", "mocha", "chai", "cypress", "playwright", "selenium",
  "puppeteer", "vitest", "testing library", "react testing library",
  "junit", "pytest", "unittest", "jasmine", "karma",

  // ── API & Integration ──────────────────────────────────
  "rest", "rest api", "restful", "graphql", "apollo", "relay",
  "grpc", "websocket", "webhook", "kafka", "rabbitmq", "mqtt",
  "swagger", "openapi", "postman", "insomnia",

  // ── Auth & Security ────────────────────────────────────
  "jwt", "oauth", "oauth2", "saml", "sso", "auth0",
  "firebase auth", "passport", "bcrypt", "helmet",
  "cors", "csrf", "xss", "encryption",

  // ── AI / ML / Data ────────────────────────────────────
  "machine learning", "ml", "deep learning", "dl",
  "natural language processing", "nlp", "computer vision",
  "tensorflow", "pytorch", "keras", "scikit learn", "sklearn",
  "pandas", "numpy", "matplotlib", "seaborn", "jupyter",
  "langchain", "openai", "llm", "rag", "vector database",
  "fine tuning", "transfer learning", "neural networks",

  // ── Mobile Development ─────────────────────────────────
  "react native", "flutter", "swiftui", "uikit", "jetpack compose",
  "android studio", "xcode", "kotlin multiplatform",

  // ── Version Control ────────────────────────────────────
  "git", "github", "gitlab", "bitbucket", "svn", "mercurial",

  // ── Project Management & Methodologies ─────────────────
  "agile", "scrum", "kanban", "jira", "confluence", "trello",
  "notion", "asana", "monday.com", "clickup",

  // ── Soft Skills ────────────────────────────────────────
  "problem solving", "critical thinking", "communication",
  "teamwork", "collaboration", "leadership", "mentoring",
  "project management", "time management", "adaptability",
  "creativity", "analytical", "detail oriented",

  // ── Concepts & Architecture ────────────────────────────
  "microservices", "micro services", "monolith",
  "serverless", "event driven", "event sourcing", "cqrs",
  "solid", "design patterns", "clean code",
  "tdd", "test driven development", "bdd",
  "ci/cd", "continuous integration", "continuous delivery",
  "api design", "system design", "distributed systems",
  "waterfall", "monitoring", "logging", "observability",

  // ── Tools & Platforms ──────────────────────────────────
  "vs code", "intellij", "webstorm", "vim", "neovim",
  "figma", "sketch", "adobe xd", "photoshop",
  "linux", "unix", "windows", "macos",
  "nginx", "apache", "haproxy", "cloudflare",

  // ── Domains & Industries ───────────────────────────────
  "fintech", "healthtech", "edtech", "ecommerce",
  "saas", "enterprise", "startup", "b2b", "b2c",
];

module.exports = skillsDatabase;