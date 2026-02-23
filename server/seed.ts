import { storage } from "./storage";
import { db } from "./db";
import { books } from "@shared/schema";

export async function seedDatabase() {
  const existingBooks = await db.select().from(books).limit(1);
  if (existingBooks.length > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }

  console.log("Seeding database with psychology book content...");

  const catHabits = await storage.createCategory({ name: "Habits & Productivity", slug: "habits", icon: "target", color: "amber" });
  const catMindset = await storage.createCategory({ name: "Mindset & Thinking", slug: "mindset", icon: "brain", color: "purple" });
  const catMindfulness = await storage.createCategory({ name: "Mindfulness & Presence", slug: "mindfulness", icon: "eye", color: "teal" });
  const catEmotions = await storage.createCategory({ name: "Emotional Intelligence", slug: "emotions", icon: "lightbulb", color: "rose" });
  const catMeaning = await storage.createCategory({ name: "Purpose & Meaning", slug: "meaning", icon: "sparkles", color: "indigo" });

  const book1 = await storage.createBook({
    title: "Atomic Habits",
    author: "James Clear",
    coverImage: "/images/book-atomic-habits.png",
    description: "An easy and proven way to build good habits and break bad ones. Tiny changes, remarkable results.",
    categoryId: catHabits.id,
    readTime: 12,
    listenTime: 10,
    audioUrl: "placeholder",
    featured: true,
    principleCount: 5,
    storyCount: 2,
    exerciseCount: 3,
  });

  const book2 = await storage.createBook({
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    coverImage: "/images/book-thinking-fast-slow.png",
    description: "A groundbreaking tour of the mind that explains the two systems that drive the way we think and make choices.",
    categoryId: catMindset.id,
    readTime: 15,
    listenTime: 12,
    audioUrl: "placeholder",
    featured: true,
    principleCount: 4,
    storyCount: 2,
    exerciseCount: 2,
  });

  const book3 = await storage.createBook({
    title: "The Power of Now",
    author: "Eckhart Tolle",
    coverImage: "/images/book-power-of-now.png",
    description: "A guide to spiritual enlightenment that teaches you to live in the present moment and find inner peace.",
    categoryId: catMindfulness.id,
    readTime: 10,
    listenTime: 8,
    audioUrl: "placeholder",
    featured: true,
    principleCount: 3,
    storyCount: 1,
    exerciseCount: 2,
  });

  const book4 = await storage.createBook({
    title: "Emotional Intelligence",
    author: "Daniel Goleman",
    coverImage: "/images/book-emotional-intelligence.png",
    description: "Why emotional intelligence can matter more than IQ. A revolutionary framework for understanding human behavior.",
    categoryId: catEmotions.id,
    readTime: 14,
    listenTime: 11,
    audioUrl: "placeholder",
    featured: false,
    principleCount: 3,
    storyCount: 0,
    exerciseCount: 2,
  });

  const book5 = await storage.createBook({
    title: "Man's Search for Meaning",
    author: "Viktor E. Frankl",
    coverImage: "/images/book-mans-search.png",
    description: "A psychiatrist's experience in Nazi death camps and its lessons for spiritual survival. Finding meaning in suffering.",
    categoryId: catMeaning.id,
    readTime: 8,
    listenTime: 7,
    audioUrl: "placeholder",
    featured: false,
    principleCount: 3,
    storyCount: 1,
    exerciseCount: 1,
  });

  // --- Atomic Habits Principles ---
  await storage.createPrinciple({ bookId: book1.id, title: "The 1% Rule", content: "Habits are the compound interest of self-improvement. Getting 1% better every day counts for a lot in the long-run. If you get 1% better each day for one year, you'll end up 37 times better by the time you're done.", orderIndex: 1, icon: "trending_up" });
  await storage.createPrinciple({ bookId: book1.id, title: "Identity-Based Habits", content: "The most effective way to change your habits is to focus not on what you want to achieve, but on who you wish to become. Your identity emerges from your habits. Every action is a vote for the type of person you wish to become.", orderIndex: 2, icon: "person" });
  await storage.createPrinciple({ bookId: book1.id, title: "The Four Laws of Behavior Change", content: "Make it obvious. Make it attractive. Make it easy. Make it satisfying. These four laws are a simple set of rules for creating good habits and breaking bad ones.", orderIndex: 3, icon: "list" });
  await storage.createPrinciple({ bookId: book1.id, title: "Environment Design", content: "Environment is the invisible hand that shapes human behavior. Many people think they lack motivation when they actually lack clarity. Make the cues of good habits obvious in your environment.", orderIndex: 4, icon: "home" });
  await storage.createPrinciple({ bookId: book1.id, title: "The Two-Minute Rule", content: "When you start a new habit, it should take less than two minutes to do. A new habit should not feel like a challenge. The actions that follow can be challenging, but the first two minutes should be easy.", orderIndex: 5, icon: "timer" });

  // --- Atomic Habits Stories ---
  await storage.createStory({ bookId: book1.id, title: "The British Cycling Revolution", content: "In 2003, Dave Brailsford became the coach of the British Cycling team. They had nearly 100 years of mediocrity. Instead of pursuing massive improvement, Brailsford searched for tiny 1% improvements in everything: redesigned bike seats, tested different fabrics for racing suits, painted the inside of the team truck white to spot dust. Within 5 years, British cyclists dominated the road and track cycling events at the 2008 Olympic Games.", moral: "Aggregating marginal gains — searching for tiny improvements in every area — can lead to remarkable results over time.", orderIndex: 1 });
  await storage.createStory({ bookId: book1.id, title: "The Paper Clip Strategy", content: "A young stockbroker named Trent Dyrsmid began each morning with two jars on his desk. One was filled with 120 paper clips. The other was empty. As soon as he settled in each day, he would make a sales call. After each call, he would move one paper clip from the full jar to the empty jar and repeat. Within 18 months, Dyrsmid was bringing in $5 million to the firm.", moral: "Visual cues and tracking systems make habits obvious and satisfying. The paper clip strategy is a visual trigger that makes your progress concrete.", orderIndex: 2 });

  // --- Atomic Habits Exercises ---
  await storage.createExercise({ bookId: book1.id, title: "Habit Scorecard", description: "Create awareness of your daily habits by scoring each one.", type: "reflection", content: { prompt: "Write down your complete daily routine from waking up to going to bed. Next to each habit, write +, -, or = to rate whether it's positive, negative, or neutral for the person you want to become." }, orderIndex: 1 });
  await storage.createExercise({ bookId: book1.id, title: "The Four Laws Quiz", description: "Test your understanding of the four laws of behavior change.", type: "quiz", content: { questions: [{ question: "What is the first law of behavior change?", options: ["Make it attractive", "Make it obvious", "Make it easy", "Make it satisfying"], correct: 1 }, { question: "According to James Clear, the best way to start a new habit is to:", options: ["Set a big goal", "Find an accountability partner", "Link it to a specific time and location", "Reward yourself immediately"], correct: 2 }, { question: "What is 'habit stacking'?", options: ["Doing many habits at once", "Linking a new habit to an existing one", "Building habits in sequence", "Removing bad habits one by one"], correct: 1 }] }, orderIndex: 2 });
  await storage.createExercise({ bookId: book1.id, title: "Implementation Intention", description: "Create a specific plan for when and where you will perform a new habit.", type: "action_plan", content: { steps: ["Choose one habit you want to build this week", "Decide the exact time you will do it", "Decide the exact location where you will do it", "Write it down: 'I will [BEHAVIOR] at [TIME] in [LOCATION]'", "Set a reminder on your phone for the chosen time", "Track your completion for 7 days straight"] }, orderIndex: 3 });

  // --- Thinking, Fast and Slow Principles ---
  await storage.createPrinciple({ bookId: book2.id, title: "System 1 and System 2", content: "Your mind operates with two systems. System 1 is fast, automatic, and intuitive — it handles everyday decisions effortlessly. System 2 is slow, deliberate, and logical — it engages when you face complex problems. Most errors in judgment occur when System 1 takes over tasks that require System 2.", orderIndex: 1, icon: "brain" });
  await storage.createPrinciple({ bookId: book2.id, title: "Anchoring Effect", content: "People's estimates are heavily influenced by initial values or 'anchors,' even when those anchors are random. When making judgments, the first piece of information we receive has an outsized effect on our final decision.", orderIndex: 2, icon: "anchor" });
  await storage.createPrinciple({ bookId: book2.id, title: "Loss Aversion", content: "Losses loom larger than gains. The pain of losing $100 is about twice as powerful as the pleasure of gaining $100. This asymmetry between the power of positive and negative expectations explains many patterns of human behavior.", orderIndex: 3, icon: "shield" });
  await storage.createPrinciple({ bookId: book2.id, title: "The Planning Fallacy", content: "People tend to underestimate the time, costs, and risks of future actions and overestimate their benefits. This bias explains why projects run over budget, why we're always late, and why optimism often defeats realism.", orderIndex: 4, icon: "calendar" });

  // --- Thinking, Fast and Slow Stories ---
  await storage.createStory({ bookId: book2.id, title: "The Invisible Gorilla", content: "In a famous experiment by Christopher Chabris and Daniel Simons, participants were asked to watch a video of people passing basketballs and count the number of passes made by the team wearing white. While focused on counting, about half the participants completely failed to notice a person in a gorilla suit walking through the scene, stopping to beat their chest, and walking off.", moral: "Our System 1 creates a coherent story from limited information. When we focus intensely on one thing, we can be blind to what is literally right in front of us.", orderIndex: 1 });
  await storage.createStory({ bookId: book2.id, title: "The Halo Effect in Action", content: "Kahneman describes grading student essays. When he graded them sequentially, his impression of the first essay influenced his judgment of later essays. A brilliant first answer created a 'halo' that made subsequent mediocre answers seem better than they were.", moral: "First impressions create a halo that colors all subsequent judgments. To make better decisions, evaluate each piece of evidence independently.", orderIndex: 2 });

  // --- Thinking, Fast and Slow Exercises ---
  await storage.createExercise({ bookId: book2.id, title: "Spot Your System 1 Biases", description: "Reflect on recent decisions where your fast-thinking System 1 may have led you astray.", type: "reflection", content: { prompt: "Think about the last important decision you made quickly. What assumptions did your 'gut feeling' make? Looking back, what information did you overlook? How might the outcome have been different if you had slowed down?" }, orderIndex: 1 });
  await storage.createExercise({ bookId: book2.id, title: "Cognitive Bias Quiz", description: "Test your understanding of common cognitive biases.", type: "quiz", content: { questions: [{ question: "What is the anchoring effect?", options: ["Being stuck in one viewpoint", "Initial values disproportionately influencing estimates", "Fear of change", "Repeating past mistakes"], correct: 1 }, { question: "Why do losses feel more powerful than equivalent gains?", options: ["We're naturally pessimistic", "Evolution wired us to avoid threats more than seek rewards", "We have bad memory for gains", "Social conditioning"], correct: 1 }] }, orderIndex: 2 });

  // --- The Power of Now Principles ---
  await storage.createPrinciple({ bookId: book3.id, title: "The Present Moment Is All You Have", content: "Nothing has happened in the past; it happened in the Now. Nothing will ever happen in the future; it will happen in the Now. The present moment is the only thing you ever have.", orderIndex: 1, icon: "circle" });
  await storage.createPrinciple({ bookId: book3.id, title: "You Are Not Your Mind", content: "The beginning of freedom is the realization that you are not the possessing entity — the thinker. The moment you start watching the thinker, a higher level of consciousness becomes activated.", orderIndex: 2, icon: "eye" });
  await storage.createPrinciple({ bookId: book3.id, title: "The Pain-Body", content: "The pain-body is a semi-autonomous energy form that lives within most human beings. It is the accumulated emotional pain from the past. It can be dormant or active.", orderIndex: 3, icon: "heart" });

  // --- The Power of Now Stories ---
  await storage.createStory({ bookId: book3.id, title: "The Beggar on the Box", content: "Tolle tells the story of a beggar who sat on a box at the side of the road for years. One day a passerby asked what was in the box. 'Nothing,' said the beggar. The passerby insisted he look. The beggar pried open the lid and discovered the box was filled with gold.", moral: "Stop looking outside yourself for fulfillment. Everything you need is already within you, accessible through present-moment awareness.", orderIndex: 1 });

  // --- The Power of Now Exercises ---
  await storage.createExercise({ bookId: book3.id, title: "One-Minute Presence", description: "Practice being fully present for 60 seconds.", type: "action_plan", content: { steps: ["Close your eyes and take three deep breaths", "Focus your attention on the sensations in your body", "Notice sounds around you without labeling them", "Feel the aliveness in your hands", "When thoughts arise, simply observe them without engaging", "Open your eyes and notice how you feel"] }, orderIndex: 1 });
  await storage.createExercise({ bookId: book3.id, title: "Watching the Thinker", description: "Practice observing your thoughts without attachment.", type: "reflection", content: { prompt: "Set a timer for 5 minutes. Sit quietly and observe the stream of thoughts that passes through your mind. Don't judge or try to stop any thoughts. After the exercise, write about what you noticed." }, orderIndex: 2 });

  // --- Emotional Intelligence Principles ---
  await storage.createPrinciple({ bookId: book4.id, title: "Self-Awareness Is the Foundation", content: "Emotional intelligence begins with self-awareness — the ability to recognize and understand your own emotions as they occur.", orderIndex: 1, icon: "mirror" });
  await storage.createPrinciple({ bookId: book4.id, title: "Emotional Hijacking", content: "The amygdala can trigger an emotional response before the rational brain has time to process the situation. This 'amygdala hijack' explains why we sometimes say or do things in anger that we later regret.", orderIndex: 2, icon: "zap" });
  await storage.createPrinciple({ bookId: book4.id, title: "Empathy Drives Connection", content: "Empathy — the ability to sense other people's emotions — is the most important people skill. It is built on self-awareness; the more open we are to our own emotions, the more skilled we become at reading others.", orderIndex: 3, icon: "users" });

  // --- Emotional Intelligence Exercises ---
  await storage.createExercise({ bookId: book4.id, title: "Emotion Log", description: "Track your emotions throughout the day to build self-awareness.", type: "reflection", content: { prompt: "For the next 24 hours, pause three times and ask yourself: What am I feeling right now? What triggered this feeling? How is this emotion affecting my behavior?" }, orderIndex: 1 });
  await storage.createExercise({ bookId: book4.id, title: "EQ Fundamentals Quiz", description: "Test your understanding of emotional intelligence concepts.", type: "quiz", content: { questions: [{ question: "What is the foundation of emotional intelligence?", options: ["Social skills", "Self-awareness", "Motivation", "Empathy"], correct: 1 }, { question: "What is an 'amygdala hijack'?", options: ["A memory loss event", "An emotional response before rational processing", "A manipulation technique", "A learning disability"], correct: 1 }] }, orderIndex: 2 });

  // --- Man's Search for Meaning Principles ---
  await storage.createPrinciple({ bookId: book5.id, title: "The Last Human Freedom", content: "Everything can be taken from a man but one thing: the last of the human freedoms — to choose one's attitude in any given set of circumstances.", orderIndex: 1, icon: "key" });
  await storage.createPrinciple({ bookId: book5.id, title: "Meaning Through Suffering", content: "If there is meaning in life at all, then there must be meaning in suffering. The way in which a person takes up their cross gives them ample opportunity to add a deeper meaning to life.", orderIndex: 2, icon: "mountain" });
  await storage.createPrinciple({ bookId: book5.id, title: "Logotherapy: The Will to Meaning", content: "Frankl's therapeutic approach, logotherapy, is based on the premise that the primary motivational force of an individual is to find meaning in life.", orderIndex: 3, icon: "compass" });

  // --- Man's Search for Meaning Stories ---
  await storage.createStory({ bookId: book5.id, title: "The Imagined Lecture", content: "During his time in the concentration camps, Frankl kept himself going by imagining himself giving a lecture after the war about the psychology of the concentration camp. This mental exercise gave him a sense of purpose — transforming his suffering into a subject for future teaching.", moral: "When you find a 'why' to live for, you can endure almost any 'how.' Projecting purpose into the future can sustain you through present suffering.", orderIndex: 1 });

  // --- Man's Search for Meaning Exercises ---
  await storage.createExercise({ bookId: book5.id, title: "Finding Your 'Why'", description: "Reflect on what gives your life meaning and purpose.", type: "reflection", content: { prompt: "Frankl believed there are three sources of meaning: (1) creating a work or doing a deed, (2) experiencing something or encountering someone, and (3) the attitude we take toward unavoidable suffering. Reflect on your life through these three lenses." }, orderIndex: 1 });

  // --- Daily Sparks ---
  await storage.createDailySpark({ quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle", bookId: book1.id, category: "habits" });
  await storage.createDailySpark({ quote: "The happiness of your life depends upon the quality of your thoughts.", author: "Marcus Aurelius", bookId: book2.id, category: "mindset" });
  await storage.createDailySpark({ quote: "Realize deeply that the present moment is all you have.", author: "Eckhart Tolle", bookId: book3.id, category: "mindfulness" });
  await storage.createDailySpark({ quote: "In a very real sense we have two minds, one that thinks and one that feels.", author: "Daniel Goleman", bookId: book4.id, category: "emotions" });
  await storage.createDailySpark({ quote: "When we are no longer able to change a situation, we are challenged to change ourselves.", author: "Viktor E. Frankl", bookId: book5.id, category: "meaning" });
  await storage.createDailySpark({ quote: "Between stimulus and response there is a space. In that space is our power to choose our response.", author: "Viktor E. Frankl", bookId: book5.id, category: "meaning" });
  await storage.createDailySpark({ quote: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear", bookId: book1.id, category: "habits" });
  await storage.createDailySpark({ quote: "Nothing in life is as important as you think it is, while you are thinking about it.", author: "Daniel Kahneman", bookId: book2.id, category: "mindset" });
  await storage.createDailySpark({ quote: "Life is not primarily a quest for pleasure or a quest for power, but a quest for meaning.", author: "Viktor E. Frankl", bookId: book5.id, category: "meaning" });
  await storage.createDailySpark({ quote: "The mind is everything. What you think you become.", author: "Buddha", category: "mindfulness" });
  await storage.createDailySpark({ quote: "Every action you take is a vote for the type of person you wish to become.", author: "James Clear", bookId: book1.id, category: "habits" });
  await storage.createDailySpark({ quote: "The ability to observe without evaluating is the highest form of intelligence.", author: "Jiddu Krishnamurti", category: "mindfulness" });

  console.log("Database seeded successfully!");
}
