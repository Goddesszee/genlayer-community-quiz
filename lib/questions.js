// Question bank for the GenLayer community quiz.
// Each question: { id, category, question, options[4], correctIndex }
// category is one of: "genlayer" | "ai" | "web3"

export const QUESTIONS = [
  // ---------- GenLayer ----------
  {
    id: "gl-1",
    category: "genlayer",
    question: "What does GenLayer call its AI-enabled smart contracts?",
    options: ["Smart Agents", "Intelligent Contracts", "Cognitive Modules", "Neural Contracts"],
    correctIndex: 1,
  },
  {
    id: "gl-2",
    category: "genlayer",
    question: "What is GenLayer's consensus mechanism called?",
    options: ["Proof of Inference", "Optimistic Democracy", "Delegated Reasoning", "Consensus Court"],
    correctIndex: 1,
  },
  {
    id: "gl-3",
    category: "genlayer",
    question: "What is the name of GenLayer's Python-based execution environment?",
    options: ["GenVM", "IntelliChain", "PyChain", "CortexVM"],
    correctIndex: 0,
  },
  {
    id: "gl-4",
    category: "genlayer",
    question: "GenLayer's validators reach agreement on non-deterministic (AI) outputs using which principle?",
    options: ["The Consensus Principle", "The Equivalence Principle", "The Majority Principle", "The Oracle Principle"],
    correctIndex: 1,
  },
  {
    id: "gl-5",
    category: "genlayer",
    question: "What was the name of GenLayer's first incentivized testnet?",
    options: ["Bradbury", "Clark", "Asimov", "Newton"],
    correctIndex: 2,
  },
  {
    id: "gl-6",
    category: "genlayer",
    question: "GenLayer often describes itself as building a decentralized version of what?",
    options: ["A stock exchange", "A synthetic jurisdiction / Court of the Internet", "A search engine", "A social network"],
    correctIndex: 1,
  },
  {
    id: "gl-7",
    category: "genlayer",
    question: "What can GenLayer's Intelligent Oracles do that traditional oracles can't?",
    options: [
      "Only relay price feeds",
      "Read, interpret, and reason over live web data trustlessly",
      "Mine new blocks faster",
      "Store files off-chain",
    ],
    correctIndex: 1,
  },
  {
    id: "gl-8",
    category: "genlayer",
    question: "In GenLayer's Optimistic Democracy, who first proposes a result for a transaction?",
    options: ["Every validator at once", "A randomly chosen leader validator", "The contract deployer", "An off-chain relayer"],
    correctIndex: 1,
  },
  {
    id: "gl-9",
    category: "genlayer",
    question: "What language are GenLayer Intelligent Contracts primarily written in?",
    options: ["Solidity", "Rust", "Python", "Move"],
    correctIndex: 2,
  },
  {
    id: "gl-10",
    category: "genlayer",
    question: "On GenLayer, what role does a 'Neurohost' play in the community?",
    options: [
      "A validator node operator",
      "A community member who organizes and leads events",
      "A core protocol developer",
      "An AI model reviewer",
    ],
    correctIndex: 1,
  },

  // ---------- AI ----------
  {
    id: "ai-1",
    category: "ai",
    question: "What does LLM stand for?",
    options: ["Large Language Model", "Linear Logic Machine", "Layered Learning Method", "Long-form Language Module"],
    correctIndex: 0,
  },
  {
    id: "ai-2",
    category: "ai",
    question: "What is 'fine-tuning' in machine learning?",
    options: [
      "Deleting a model's training data",
      "Further training a pretrained model on a smaller, specific dataset",
      "Compressing a model to run faster",
      "Randomizing a model's weights",
    ],
    correctIndex: 1,
  },
  {
    id: "ai-3",
    category: "ai",
    question: "What architecture underlies most modern large language models?",
    options: ["Convolutional Neural Network", "Transformer", "Decision Tree", "Support Vector Machine"],
    correctIndex: 1,
  },
  {
    id: "ai-4",
    category: "ai",
    question: "In AI, what does RAG (Retrieval-Augmented Generation) primarily help a model do?",
    options: [
      "Generate images faster",
      "Ground its answers with information fetched from an external source",
      "Reduce its parameter count",
      "Train without any data",
    ],
    correctIndex: 1,
  },
  {
    id: "ai-5",
    category: "ai",
    question: "What is a 'hallucination' in the context of an AI model?",
    options: [
      "When a model refuses to answer",
      "When a model generates confident but false or fabricated information",
      "When a model runs out of memory",
      "When a model's output is encrypted",
    ],
    correctIndex: 1,
  },
  {
    id: "ai-6",
    category: "ai",
    question: "What does 'AI agent' generally refer to?",
    options: [
      "A static chatbot script",
      "A system that can autonomously plan and take actions to achieve a goal",
      "A GPU used for training",
      "A dataset labeling tool",
    ],
    correctIndex: 1,
  },
  {
    id: "ai-7",
    category: "ai",
    question: "What is 'prompt engineering'?",
    options: [
      "Writing code to train a model from scratch",
      "Designing inputs to get better, more reliable outputs from an AI model",
      "Building GPU chips for AI",
      "Compressing model weights",
    ],
    correctIndex: 1,
  },
  {
    id: "ai-8",
    category: "ai",
    question: "What does 'context window' refer to for a language model?",
    options: [
      "Its training budget",
      "The amount of text it can consider at once when generating a response",
      "Its release date",
      "The number of GPUs used",
    ],
    correctIndex: 1,
  },

  // ---------- Web3 ----------
  {
    id: "w3-1",
    category: "web3",
    question: "What is a 'smart contract'?",
    options: [
      "A legal PDF stored on a server",
      "Self-executing code deployed on a blockchain",
      "A centralized database entry",
      "A type of crypto wallet",
    ],
    correctIndex: 1,
  },
  {
    id: "w3-2",
    category: "web3",
    question: "What does 'gas' refer to in blockchain networks like Ethereum?",
    options: [
      "The fee paid to execute a transaction or contract",
      "A type of NFT",
      "A consensus algorithm",
      "The native token's ticker symbol",
    ],
    correctIndex: 0,
  },
  {
    id: "w3-3",
    category: "web3",
    question: "What does 'DeFi' stand for?",
    options: ["Decentralized Finance", "Defined Finance", "Digital Fiat", "Deferred Fintech"],
    correctIndex: 0,
  },
  {
    id: "w3-4",
    category: "web3",
    question: "What is the main purpose of a blockchain 'testnet'?",
    options: [
      "To store real user funds permanently",
      "To let developers test apps and contracts without real-value risk",
      "To replace mainnet entirely",
      "To mine the genesis block",
    ],
    correctIndex: 1,
  },
  {
    id: "w3-5",
    category: "web3",
    question: "What is an 'oracle' in the blockchain context?",
    options: [
      "A validator with special voting power",
      "A service that feeds external, real-world data into a blockchain",
      "A type of stablecoin",
      "A Layer 2 scaling solution",
    ],
    correctIndex: 1,
  },
  {
    id: "w3-6",
    category: "web3",
    question: "What does 'DAO' stand for?",
    options: [
      "Decentralized Autonomous Organization",
      "Digital Asset Offering",
      "Distributed Application Object",
      "Direct Asset Ownership",
    ],
    correctIndex: 0,
  },
  {
    id: "w3-7",
    category: "web3",
    question: "What is a 'validator' responsible for on a proof-of-stake network?",
    options: [
      "Designing the token's logo",
      "Proposing and verifying new blocks/transactions to secure the network",
      "Setting exchange listing prices",
      "Writing the whitepaper",
    ],
    correctIndex: 1,
  },
  {
    id: "w3-8",
    category: "web3",
    question: "What does 'on-chain' mean?",
    options: [
      "Data or logic that is off a company's private server",
      "Data or actions recorded directly on a blockchain",
      "A physical chain used for mining hardware",
      "A type of centralized exchange order",
    ],
    correctIndex: 1,
  },
  {
    id: "w3-9",
    category: "web3",
    question: "What is a 'Layer 2' in blockchain terms?",
    options: [
      "A second, separate mainnet with no connection to Layer 1",
      "A scaling solution built on top of an existing blockchain (Layer 1)",
      "A wallet backup system",
      "A type of NFT marketplace",
    ],
    correctIndex: 1,
  },
];

export function getRandomQuestions(count = 10) {
  const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
