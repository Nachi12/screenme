export const SKILL_TAXONOMY = [
    // Languages
    { canonical: 'JavaScript', category: 'language', aliases: ['js', 'javascript', 'ecmascript', 'es6', 'es2015+'] },
    { canonical: 'TypeScript', category: 'language', aliases: ['ts', 'typescript'] },
    { canonical: 'Python', category: 'language', aliases: ['python', 'python3', 'py'] },
    { canonical: 'Java', category: 'language', aliases: ['java', 'java 8', 'java 11', 'java 17', 'java 21', 'core java'] },
    { canonical: 'C++', category: 'language', aliases: ['c++', 'cpp', 'c/c++'] },
    { canonical: 'C', category: 'language', aliases: ['c language', 'ansi c'] },
    { canonical: 'C#', category: 'language', aliases: ['c#', 'csharp', 'c-sharp'] },
    { canonical: 'Go', category: 'language', aliases: ['golang', 'go language'] },
    { canonical: 'SQL', category: 'language', aliases: ['sql', 'structured query language', 't-sql', 'pl/sql'] },
    { canonical: 'HTML', category: 'language', aliases: ['html', 'html5'] },
    { canonical: 'CSS', category: 'language', aliases: ['css', 'css3'] },
    // Frameworks & Libraries
    { canonical: 'React', category: 'framework', aliases: ['react', 'react.js', 'reactjs', 'react 18', 'react 19'] },
    { canonical: 'React Native', category: 'framework', aliases: ['react native', 'react-native', 'rn'] },
    { canonical: 'Next.js', category: 'framework', aliases: ['next', 'next.js', 'nextjs'] },
    { canonical: 'Node.js', category: 'framework', aliases: ['node', 'node.js', 'nodejs'] },
    { canonical: 'Express', category: 'framework', aliases: ['express', 'express.js', 'expressjs'] },
    { canonical: 'NestJS', category: 'framework', aliases: ['nestjs', 'nest.js'] },
    { canonical: 'Spring Boot', category: 'framework', aliases: ['spring boot', 'springboot', 'spring'] },
    { canonical: 'Django', category: 'framework', aliases: ['django'] },
    { canonical: 'FastAPI', category: 'framework', aliases: ['fastapi', 'fast api'] },
    { canonical: 'Flask', category: 'framework', aliases: ['flask'] },
    { canonical: 'Angular', category: 'framework', aliases: ['angular', 'angularjs'] },
    { canonical: 'Vue.js', category: 'framework', aliases: ['vue', 'vue.js', 'vuejs'] },
    { canonical: 'Tailwind CSS', category: 'framework', aliases: ['tailwind', 'tailwindcss', 'tailwind css'] },
    { canonical: 'Redux', category: 'framework', aliases: ['redux', 'redux toolkit', 'rtk'] },
    // Databases
    { canonical: 'PostgreSQL', category: 'database', aliases: ['postgres', 'postgresql', 'psql'] },
    { canonical: 'MySQL', category: 'database', aliases: ['mysql'] },
    { canonical: 'MongoDB', category: 'database', aliases: ['mongo', 'mongodb', 'mongoose'] },
    { canonical: 'Redis', category: 'database', aliases: ['redis'] },
    { canonical: 'SQLite', category: 'database', aliases: ['sqlite', 'sqlite3'] },
    { canonical: 'Firebase', category: 'database', aliases: ['firebase', 'firestore'] },
    // Cloud & DevOps
    { canonical: 'AWS', category: 'cloud', aliases: ['aws', 'amazon web services', 'ec2', 's3', 'lambda'] },
    { canonical: 'GCP', category: 'cloud', aliases: ['gcp', 'google cloud', 'google cloud platform'] },
    { canonical: 'Azure', category: 'cloud', aliases: ['azure', 'microsoft azure'] },
    { canonical: 'Docker', category: 'cloud', aliases: ['docker', 'containerization'] },
    { canonical: 'Kubernetes', category: 'cloud', aliases: ['kubernetes', 'k8s'] },
    { canonical: 'CI/CD', category: 'cloud', aliases: ['ci/cd', 'cicd', 'github actions', 'jenkins'] },
    // Tools
    { canonical: 'Git', category: 'tool', aliases: ['git', 'version control'] },
    { canonical: 'GitHub', category: 'tool', aliases: ['github'] },
    { canonical: 'Postman', category: 'tool', aliases: ['postman'] },
    { canonical: 'Jira', category: 'tool', aliases: ['jira'] },
    { canonical: 'Linux', category: 'tool', aliases: ['linux', 'ubuntu', 'bash', 'shell scripting'] },
    { canonical: 'Prisma', category: 'tool', aliases: ['prisma', 'prisma orm'] },
    // Concepts
    { canonical: 'REST APIs', category: 'concept', aliases: ['rest', 'rest api', 'rest apis', 'restful api', 'restful apis', 'restful services'] },
    { canonical: 'GraphQL', category: 'concept', aliases: ['graphql'] },
    { canonical: 'Authentication', category: 'concept', aliases: ['auth', 'authentication', 'jwt', 'oauth', 'oauth2', 'rbac'] },
    { canonical: 'Data Structures & Algorithms', category: 'concept', aliases: ['dsa', 'data structures', 'algorithms', 'data structures and algorithms', 'data structures & algorithms'] },
    { canonical: 'System Design', category: 'concept', aliases: ['system design', 'lld', 'hld', 'distributed systems'] },
    { canonical: 'Object-Oriented Programming', category: 'concept', aliases: ['oop', 'oops', 'object oriented programming', 'object-oriented programming'] },
    { canonical: 'Unit Testing', category: 'concept', aliases: ['unit testing', 'jest', 'vitest', 'pytest', 'junit', 'mocha', 'testing'] },
    { canonical: 'Microservices', category: 'concept', aliases: ['microservices', 'microservice architecture'] },
    { canonical: 'Agile', category: 'concept', aliases: ['agile', 'scrum', 'kanban'] },
    // Soft Skills
    { canonical: 'Communication', category: 'soft_skill', aliases: ['communication', 'written communication', 'verbal communication'] },
    { canonical: 'Problem Solving', category: 'soft_skill', aliases: ['problem solving', 'problem-solving', 'analytical thinking'] },
    { canonical: 'Team Collaboration', category: 'soft_skill', aliases: ['teamwork', 'collaboration', 'cross-functional collaboration'] },
];
/**
 * Explicit non-equivalent pairs that must NEVER be conflated.
 */
export const NON_EQUIVALENT_SKILL_PAIRS = [
    ['Java', 'JavaScript'],
    ['React', 'React Native'],
    ['MongoDB', 'SQL'],
    ['Git', 'GitHub'],
    ['C', 'C++'],
    ['C++', 'C#'],
];
//# sourceMappingURL=skills.js.map