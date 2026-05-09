export const mockInterviews = {
  tech: [
    {
      question: "Explain the difference between Virtual DOM and Shadow DOM.",
      options: ["Virtual DOM is a copy of real DOM, Shadow DOM is for scoping styles", "No difference", "Virtual DOM is faster", "Shadow DOM is older"],
      correctAnswer: "Virtual DOM is a copy of real DOM, Shadow DOM is for scoping styles",
      explanation: "V-DOM handles efficient renders; Shadow DOM provides CSS/DOM isolation for web components."
    },
    {
       question: "What is a deadlock in Operating Systems?",
       options: ["System crash", "Process waiting for a resource held by another waiting process", "Slow internet", "Memory leak"],
       correctAnswer: "Process waiting for a resource held by another waiting process",
       explanation: "A circular dependency where no process can proceed."
    },
    {
      question: "What is the purpose of 'useMemo' in React?",
      options: ["To fetch data", "To memoize expensive calculations", "To manage state", "To create a ref"],
      correctAnswer: "To memoize expensive calculations",
      explanation: "Prevents unnecessary recalculations on every render unless dependencies change."
    },
    {
      question: "What is the difference between TCP and UDP?",
      options: ["TCP is connection-oriented, UDP is connectionless", "UDP is slower", "TCP is for video streaming", "No difference"],
      correctAnswer: "TCP is connection-oriented, UDP is connectionless",
      explanation: "TCP ensures reliability and order; UDP is prioritized for speed/latency."
    },
    {
      question: "What is a closure in JavaScript?",
      options: ["A function with its lexical environment", "Closing a tab", "A private variable", "A loop"],
      correctAnswer: "A function with its lexical environment",
      explanation: "Allows a function to access variables from its outer scope even after that scope has closed."
    },
    {
      question: "What does ACID stand for in Database Transactions?",
      options: ["Atomicity, Consistency, Isolation, Durability", "Action, Code, Input, Data", "All-in-one, Clear, Integrated, Detailed", "None"],
      correctAnswer: "Atomicity, Consistency, Isolation, Durability",
      explanation: "Guarantees transaction reliability in database systems."
    },
    {
      question: "What is an Index in a Database?",
      options: ["A list of tables", "A structure that improves data retrieval speed", "A primary key", "The first row"],
      correctAnswer: "A structure that improves data retrieval speed",
      explanation: "Like a book index, it helps locate data without scanning the entire table."
    },
    {
      question: "What is the Big O complexity of searching in a sorted array using Binary Search?",
      options: ["O(n)", "O(log n)", "O(1)", "O(n^2)"],
      correctAnswer: "O(log n)",
      explanation: "Each step halves the search space, leading to logarithmic time."
    },
    {
      question: "What is 'Dependency Injection'?",
      options: ["Injecting CSS", "A pattern where objects receive their dependencies from outside", "Updating npm", "A virus"],
      correctAnswer: "A pattern where objects receive their dependencies from outside",
      explanation: "Enhances modularity and makes code easier to test."
    },
    {
      question: "What is the role of a 'Load Balancer'?",
      options: ["To speed up memory", "To distribute traffic across multiple servers", "To backup data", "To encrypt traffic"],
      correctAnswer: "To distribute traffic across multiple servers",
      explanation: "Prevents any single server from becoming a bottleneck, ensuring high availability."
    }
  ],
  finance: [
    {
      question: "What is the 'Time Value of Money'?",
      options: ["Money is worth more now than in the future", "Money loses value every day", "Saving takes time", "Investing is slow"],
      correctAnswer: "Money is worth more now than in the future",
      explanation: "Due to its potential earning capacity (interest/investments)."
    },
    {
      question: "What is a 'Balance Sheet'?",
      options: ["List of transactions", "Snapshot of Assets, Liabilities, and Equity", "Profit report", "Tax document"],
      correctAnswer: "Snapshot of Assets, Liabilities, and Equity",
      explanation: "Shows a company's financial position at a specific point in time."
    },
    {
      question: "What is 'Working Capital'?",
      options: ["Current Assets - Current Liabilities", "Total Revenue", "Company profit", "Cash in bank"],
      correctAnswer: "Current Assets - Current Liabilities",
      explanation: "Measures a company's short-term financial health and operational efficiency."
    },
    {
      question: "What does WACC stand for?",
      options: ["Weighted Average Cost of Capital", "Worldwide Asset Credit Code", "Weekly Asset Compliance Check", "None"],
      correctAnswer: "Weighted Average Cost of Capital",
      explanation: "Represents the average rate a company pays to finance its assets."
    },
    {
      question: "What is a 'P/E Ratio'?",
      options: ["Price to Earnings ratio", "Profit to Expense ratio", "Payroll to Equity ratio", "None"],
      correctAnswer: "Price to Earnings ratio",
      explanation: "Valuation metric comparing current share price to per-share earnings."
    }
  ],
  behavioral: [
    {
      question: "What is the STAR method?",
      options: ["Situation, Task, Action, Result", "Stop, Talk, Act, Review", "Strategy, Team, Aim, Report", "None"],
      correctAnswer: "Situation, Task, Action, Result",
      explanation: "A structured way to answer behavioral interview questions."
    },
    {
      question: "How do you handle conflict with a colleague?",
      options: ["Avoid them", "Communicate directly and professionally", "Complain to HR immediately", "Ignore the issue"],
      correctAnswer: "Communicate directly and professionally",
      explanation: "Focus on facts and shared goals to find a constructive resolution."
    },
    {
      question: "What is your biggest weakness?",
      options: ["I'm a perfectionist", "I mention a real skill I'm improving with a plan", "I have none", "I am lazy"],
      correctAnswer: "I mention a real skill I'm improving with a plan",
      explanation: "Shows self-awareness and a proactive growth mindset."
    },
    {
      question: "Why should we hire you?",
      options: ["I need a job", "I align with your goals and bring unique value", "I am the best", "I have 10 degrees"],
      correctAnswer: "I align with your goals and bring unique value",
      explanation: "Summarizes relevant skills and cultural fit."
    },
    {
      question: "Describe a time you failed.",
      options: ["I never fail", "I discuss a genuine setback, my response, and what I learned", "I blame my boss", "It was small"],
      correctAnswer: "I discuss a genuine setback, my response, and what I learned",
      explanation: "Demonstrates resilience and the ability to learn from mistakes."
    }
  ]
};

// Map industries.js IDs to mock categories
export const industryMap = {
  tech: "tech",
  finance: "finance",
  healthcare: "healthcare", // Will add specific ones if needed, otherwise uses behavioral
  manufacturing: "behavioral",
  retail: "behavioral",
  media: "behavioral",
  education: "behavioral",
  energy: "behavioral",
  consulting: "behavioral",
  telecom: "tech",
  transportation: "behavioral",
  agriculture: "behavioral",
  construction: "behavioral",
  hospitality: "behavioral",
  nonprofit: "behavioral"
};
