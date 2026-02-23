import { storage } from "./storage";
import { db } from "./db";
import { books, chapterSummaries, mentalModels, commonMistakes, actionItems, infographics } from "@shared/schema";

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

  // ===================== BOOK 1: Atomic Habits =====================
  const book1 = await storage.createBook({
    title: "Atomic Habits",
    author: "James Clear",
    coverImage: "/images/book-atomic-habits.png",
    description: "An easy and proven way to build good habits and break bad ones. Tiny changes, remarkable results.",
    coreThesis: "You do not rise to the level of your goals. You fall to the level of your systems. Small habits compound into extraordinary results when you focus on becoming 1% better every day.",
    categoryId: catHabits.id,
    readTime: 12, listenTime: 10, audioUrl: "placeholder", featured: true,
    principleCount: 5, storyCount: 2, exerciseCount: 3,
  });

  // Chapter Summaries
  await storage.createChapterSummary({ bookId: book1.id, chapterNumber: 1, chapterTitle: "The Surprising Power of Atomic Habits", cards: [
    { text: "Habits are the compound interest of self-improvement. Getting 1% better every day seems small, but it adds up fast." },
    { text: "If you get 1% better each day for one year, you'll end up 37 times better. 1% worse each day, and you'll decline to nearly zero." },
    { text: "Your outcomes are a lagging measure of your habits. Your weight is a lagging measure of your eating. Your knowledge is a lagging measure of your learning." },
    { text: "Forget about goals. Focus on systems instead. Goals are about results. Systems are about the processes that lead to results." },
    { text: "You don't rise to the level of your goals. You fall to the level of your systems." },
  ]});
  await storage.createChapterSummary({ bookId: book1.id, chapterNumber: 2, chapterTitle: "How Your Habits Shape Your Identity", cards: [
    { text: "There are three layers of behavior change: outcomes (what you get), processes (what you do), and identity (what you believe)." },
    { text: "The most effective way to change isn't to focus on goals, but on who you wish to become." },
    { text: "Every action you take is a vote for the type of person you wish to become." },
    { text: "Instead of 'I want to run a marathon,' think 'I am a runner.' The behavior then becomes obvious." },
  ]});
  await storage.createChapterSummary({ bookId: book1.id, chapterNumber: 3, chapterTitle: "The Four Laws of Behavior Change", cards: [
    { text: "Every habit follows a 4-step loop: Cue, Craving, Response, Reward." },
    { text: "To build good habits, use the Four Laws: Make it Obvious, Make it Attractive, Make it Easy, Make it Satisfying." },
    { text: "To break bad habits, invert them: Make it Invisible, Make it Unattractive, Make it Difficult, Make it Unsatisfying." },
    { text: "This simple framework gives you a practical playbook for any behavior you want to change." },
  ]});

  // Mental Models
  await storage.createMentalModel({ bookId: book1.id, title: "The Habit Loop", description: "The four-step neurological pattern behind every habit.", orderIndex: 1, steps: [
    { label: "Cue", explanation: "A trigger that tells your brain to initiate a behavior. It predicts a reward." },
    { label: "Craving", explanation: "The motivational force. You don't crave the habit itself, but the change in state it delivers." },
    { label: "Response", explanation: "The actual habit you perform. It can be a thought or an action." },
    { label: "Reward", explanation: "The end goal. Rewards satisfy your craving and teach your brain which actions are worth remembering." },
  ]});
  await storage.createMentalModel({ bookId: book1.id, title: "The Plateau of Latent Potential", description: "Why results seem to take forever, then arrive all at once.", orderIndex: 2, steps: [
    { label: "The Valley of Disappointment", explanation: "In the early days, your efforts seem to produce no visible results. This is where most people give up." },
    { label: "The Breakthrough", explanation: "At a certain point, previous efforts unlock a breakthrough and results seem to arrive overnight." },
    { label: "The Ice Cube Analogy", explanation: "Imagine heating an ice cube from 25 to 31 degrees. Nothing visible happens. At 32 degrees, it begins to melt. The work wasn't wasted — it was being stored." },
  ]});

  // Principles (with stories nested)
  const p1_1 = await storage.createPrinciple({ bookId: book1.id, title: "The 1% Rule", content: "Habits are the compound interest of self-improvement. Getting 1% better every day counts for a lot in the long-run. If you get 1% better each day for one year, you'll end up 37 times better by the time you're done.", orderIndex: 1, icon: "trending_up" });
  await storage.createStory({ bookId: book1.id, principleId: p1_1.id, title: "The British Cycling Revolution", content: "In 2003, Dave Brailsford became the coach of the British Cycling team. They had nearly 100 years of mediocrity. Instead of pursuing massive improvement, Brailsford searched for tiny 1% improvements in everything: redesigned bike seats, tested different fabrics for racing suits, painted the inside of the team truck white to spot dust. Within 5 years, British cyclists dominated the road and track cycling events at the 2008 Olympic Games.", moral: "Aggregating marginal gains — searching for tiny improvements in every area — can lead to remarkable results over time.", orderIndex: 1 });

  const p1_2 = await storage.createPrinciple({ bookId: book1.id, title: "Identity-Based Habits", content: "The most effective way to change your habits is to focus not on what you want to achieve, but on who you wish to become. Your identity emerges from your habits. Every action is a vote for the type of person you wish to become.", orderIndex: 2, icon: "person" });

  const p1_3 = await storage.createPrinciple({ bookId: book1.id, title: "The Four Laws of Behavior Change", content: "Make it obvious. Make it attractive. Make it easy. Make it satisfying. These four laws are a simple set of rules for creating good habits and breaking bad ones.", orderIndex: 3, icon: "list" });

  const p1_4 = await storage.createPrinciple({ bookId: book1.id, title: "Environment Design", content: "Environment is the invisible hand that shapes human behavior. Many people think they lack motivation when they actually lack clarity. Make the cues of good habits obvious in your environment.", orderIndex: 4, icon: "home" });
  await storage.createStory({ bookId: book1.id, principleId: p1_4.id, title: "The Paper Clip Strategy", content: "A young stockbroker named Trent Dyrsmid began each morning with two jars on his desk. One was filled with 120 paper clips. The other was empty. As soon as he settled in each day, he would make a sales call. After each call, he would move one paper clip from the full jar to the empty jar and repeat. Within 18 months, Dyrsmid was bringing in $5 million to the firm.", moral: "Visual cues and tracking systems make habits obvious and satisfying. The paper clip strategy is a visual trigger that makes your progress concrete.", orderIndex: 2 });

  const p1_5 = await storage.createPrinciple({ bookId: book1.id, title: "The Two-Minute Rule", content: "When you start a new habit, it should take less than two minutes to do. A new habit should not feel like a challenge. The actions that follow can be challenging, but the first two minutes should be easy.", orderIndex: 5, icon: "timer" });

  // Common Mistakes
  await storage.createCommonMistake({ bookId: book1.id, mistake: "Setting ambitious goals without building systems to support them. 'I'll run a marathon this year' with no daily running habit.", correction: "Focus on the system, not the goal. Build a daily identity: 'I am a runner who shows up every day, even if it's just for 2 minutes.'", orderIndex: 1 });
  await storage.createCommonMistake({ bookId: book1.id, mistake: "Trying to make massive changes overnight. Going from zero exercise to an hour every day.", correction: "Use the Two-Minute Rule. Start so small it's impossible to fail: put on your running shoes, do 2 push-ups, meditate for 60 seconds.", orderIndex: 2 });
  await storage.createCommonMistake({ bookId: book1.id, mistake: "Relying on motivation and willpower instead of designing your environment.", correction: "Redesign your surroundings. Put the book on the pillow, the fruit on the counter, the gym clothes by the door. Make good cues obvious.", orderIndex: 3 });

  // Exercises (with impact)
  await storage.createExercise({ bookId: book1.id, title: "Habit Scorecard", description: "Create awareness of your daily habits by scoring each one.", type: "reflection", impact: "high", content: { prompt: "Write down your complete daily routine from waking up to going to bed. Next to each habit, write +, -, or = to rate whether it's positive, negative, or neutral for the person you want to become." }, orderIndex: 1 });
  await storage.createExercise({ bookId: book1.id, title: "The Four Laws Quiz", description: "Test your understanding of the four laws of behavior change.", type: "quiz", impact: "medium", content: { questions: [{ question: "What is the first law of behavior change?", options: ["Make it attractive", "Make it obvious", "Make it easy", "Make it satisfying"], correct: 1 }, { question: "According to James Clear, the best way to start a new habit is to:", options: ["Set a big goal", "Find an accountability partner", "Link it to a specific time and location", "Reward yourself immediately"], correct: 2 }, { question: "What is 'habit stacking'?", options: ["Doing many habits at once", "Linking a new habit to an existing one", "Building habits in sequence", "Removing bad habits one by one"], correct: 1 }] }, orderIndex: 2 });
  await storage.createExercise({ bookId: book1.id, title: "Implementation Intention", description: "Create a specific plan for when and where you will perform a new habit.", type: "action_plan", impact: "high", content: { steps: ["Choose one habit you want to build this week", "Decide the exact time you will do it", "Decide the exact location where you will do it", "Write it down: 'I will [BEHAVIOR] at [TIME] in [LOCATION]'", "Set a reminder on your phone for the chosen time", "Track your completion for 7 days straight"] }, orderIndex: 3 });

  // Action Items
  await storage.createActionItem({ bookId: book1.id, text: "Write down 3 habits you want to build and reframe each as an identity statement (e.g., 'I am a writer')", type: "immediate", orderIndex: 1 });
  await storage.createActionItem({ bookId: book1.id, text: "Pick one room and redesign it to make one good habit cue visible and one bad habit cue invisible", type: "immediate", orderIndex: 2 });
  await storage.createActionItem({ bookId: book1.id, text: "Create a Two-Minute version of a habit you've been procrastinating on and do it right now", type: "immediate", orderIndex: 3 });
  await storage.createActionItem({ bookId: book1.id, text: "Track one keystone habit daily for 30 days using a habit tracker (paper or app)", type: "long_term", orderIndex: 4 });
  await storage.createActionItem({ bookId: book1.id, text: "Conduct a monthly Habit Scorecard review: rate all habits and identify one to add and one to remove", type: "long_term", orderIndex: 5 });
  await storage.createActionItem({ bookId: book1.id, text: "Build a habit stack of 3 connected morning routines and practice for 60 days", type: "long_term", orderIndex: 6 });

  // Infographics
  await storage.createInfographic({ bookId: book1.id, title: "The Habit Loop", description: "How every habit works in 4 steps", steps: [
    { label: "1. Cue", explanation: "A trigger that tells your brain to initiate a behavior. It could be a time, location, emotion, or preceding action." },
    { label: "2. Craving", explanation: "The motivational force behind every habit. You don't crave the habit itself—you crave the change in state it delivers." },
    { label: "3. Response", explanation: "The actual habit you perform—a thought or action. It depends on how motivated you are and how much friction is involved." },
    { label: "4. Reward", explanation: "The end goal of every habit. Rewards satisfy your craving and teach your brain which actions are worth remembering." },
  ], orderIndex: 1 });
  await storage.createInfographic({ bookId: book1.id, title: "1% Better Every Day", description: "The power of tiny gains compounding over time", steps: [
    { label: "Day 1", explanation: "Start with a habit so small it takes less than 2 minutes. Read one page. Do one push-up." },
    { label: "Day 30", explanation: "Consistency builds identity. You've cast 30 votes for the person you want to become." },
    { label: "Day 180", explanation: "The plateau of latent potential is behind you. Results become visible as the compound effect kicks in." },
    { label: "Day 365", explanation: "1% daily improvement = 37x better in a year. Your system is now automatic and self-reinforcing." },
  ], orderIndex: 2 });

  // ===================== BOOK 2: Thinking, Fast and Slow =====================
  const book2 = await storage.createBook({
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    coverImage: "/images/book-thinking-fast-slow.png",
    description: "A groundbreaking tour of the mind that explains the two systems that drive the way we think and make choices.",
    coreThesis: "Human judgment is driven by two mental systems: fast, intuitive System 1 and slow, deliberate System 2. Most errors in thinking happen when System 1 hijacks decisions that require System 2's careful analysis.",
    categoryId: catMindset.id,
    readTime: 15, listenTime: 12, audioUrl: "placeholder", featured: true,
    principleCount: 4, storyCount: 2, exerciseCount: 2,
  });

  await storage.createChapterSummary({ bookId: book2.id, chapterNumber: 1, chapterTitle: "The Characters of the Story", cards: [
    { text: "Your brain uses two systems: System 1 (fast, automatic, emotional) and System 2 (slow, deliberate, logical)." },
    { text: "System 1 operates automatically with little effort. It's the voice that says 'that person looks angry' or solves 2+2 instantly." },
    { text: "System 2 allocates attention to effortful mental tasks. It's needed for complex math, comparing options, or checking your logic." },
    { text: "Most of the time, System 1 runs the show. System 2 is lazy and only kicks in when System 1 can't handle something." },
  ]});
  await storage.createChapterSummary({ bookId: book2.id, chapterNumber: 2, chapterTitle: "Heuristics and Biases", cards: [
    { text: "System 1 takes mental shortcuts called heuristics. They're usually helpful but sometimes create systematic errors (biases)." },
    { text: "The Anchoring Effect: the first number you see in a negotiation disproportionately influences where you end up." },
    { text: "The Availability Heuristic: you judge how likely something is based on how easily an example comes to mind, not actual statistics." },
    { text: "These biases aren't flaws — they're features of a brain designed for speed over accuracy in a dangerous world." },
  ]});

  await storage.createMentalModel({ bookId: book2.id, title: "System 1 vs System 2", description: "The dual-process model of human cognition.", orderIndex: 1, steps: [
    { label: "System 1: The Automatic Pilot", explanation: "Handles pattern recognition, emotional reactions, and well-practiced responses instantly without conscious effort." },
    { label: "System 2: The Careful Analyst", explanation: "Engages for complex reasoning, self-control, and deliberate choices. Requires attention and energy." },
    { label: "The Handoff Problem", explanation: "System 1 generates impressions and feelings that System 2 often endorses without checking. This is where biases slip in." },
    { label: "When System 2 Fails", explanation: "Under cognitive load, time pressure, or fatigue, System 2 can't override System 1's mistakes. This is when we make our worst decisions." },
  ]});

  const p2_1 = await storage.createPrinciple({ bookId: book2.id, title: "System 1 and System 2", content: "Your mind operates with two systems. System 1 is fast, automatic, and intuitive — it handles everyday decisions effortlessly. System 2 is slow, deliberate, and logical — it engages when you face complex problems. Most errors in judgment occur when System 1 takes over tasks that require System 2.", orderIndex: 1, icon: "brain" });
  await storage.createStory({ bookId: book2.id, principleId: p2_1.id, title: "The Invisible Gorilla", content: "In a famous experiment by Christopher Chabris and Daniel Simons, participants were asked to watch a video of people passing basketballs and count the number of passes made by the team wearing white. While focused on counting, about half the participants completely failed to notice a person in a gorilla suit walking through the scene, stopping to beat their chest, and walking off.", moral: "Our System 1 creates a coherent story from limited information. When we focus intensely on one thing, we can be blind to what is literally right in front of us.", orderIndex: 1 });

  const p2_2 = await storage.createPrinciple({ bookId: book2.id, title: "Anchoring Effect", content: "People's estimates are heavily influenced by initial values or 'anchors,' even when those anchors are random. When making judgments, the first piece of information we receive has an outsized effect on our final decision.", orderIndex: 2, icon: "anchor" });

  const p2_3 = await storage.createPrinciple({ bookId: book2.id, title: "Loss Aversion", content: "Losses loom larger than gains. The pain of losing $100 is about twice as powerful as the pleasure of gaining $100. This asymmetry between the power of positive and negative expectations explains many patterns of human behavior.", orderIndex: 3, icon: "shield" });
  await storage.createStory({ bookId: book2.id, principleId: p2_3.id, title: "The Halo Effect in Action", content: "Kahneman describes grading student essays. When he graded them sequentially, his impression of the first essay influenced his judgment of later essays. A brilliant first answer created a 'halo' that made subsequent mediocre answers seem better than they were.", moral: "First impressions create a halo that colors all subsequent judgments. To make better decisions, evaluate each piece of evidence independently.", orderIndex: 2 });

  const p2_4 = await storage.createPrinciple({ bookId: book2.id, title: "The Planning Fallacy", content: "People tend to underestimate the time, costs, and risks of future actions and overestimate their benefits. This bias explains why projects run over budget, why we're always late, and why optimism often defeats realism.", orderIndex: 4, icon: "calendar" });

  await storage.createCommonMistake({ bookId: book2.id, mistake: "Trusting your gut feeling for complex financial decisions, job changes, or relationship choices.", correction: "Slow down. Engage System 2 deliberately: write out pros and cons, assign probabilities, and ask 'what information am I missing?'", orderIndex: 1 });
  await storage.createCommonMistake({ bookId: book2.id, mistake: "Letting the first number in a negotiation (the anchor) dictate the entire outcome without questioning it.", correction: "Recognize the anchor and deliberately counter it. Research your own independent baseline before entering any negotiation.", orderIndex: 2 });

  await storage.createExercise({ bookId: book2.id, title: "Spot Your System 1 Biases", description: "Reflect on recent decisions where your fast-thinking System 1 may have led you astray.", type: "reflection", impact: "high", content: { prompt: "Think about the last important decision you made quickly. What assumptions did your 'gut feeling' make? Looking back, what information did you overlook? How might the outcome have been different if you had slowed down?" }, orderIndex: 1 });
  await storage.createExercise({ bookId: book2.id, title: "Cognitive Bias Quiz", description: "Test your understanding of common cognitive biases.", type: "quiz", impact: "medium", content: { questions: [{ question: "What is the anchoring effect?", options: ["Being stuck in one viewpoint", "Initial values disproportionately influencing estimates", "Fear of change", "Repeating past mistakes"], correct: 1 }, { question: "Why do losses feel more powerful than equivalent gains?", options: ["We're naturally pessimistic", "Evolution wired us to avoid threats more than seek rewards", "We have bad memory for gains", "Social conditioning"], correct: 1 }] }, orderIndex: 2 });

  await storage.createActionItem({ bookId: book2.id, text: "Before your next big decision, write down 3 assumptions your gut is making and fact-check each one", type: "immediate", orderIndex: 1 });
  await storage.createActionItem({ bookId: book2.id, text: "In your next negotiation, research your number independently before hearing any anchors", type: "immediate", orderIndex: 2 });
  await storage.createActionItem({ bookId: book2.id, text: "Keep a Decision Journal: log every major decision, your reasoning, and review outcomes monthly", type: "long_term", orderIndex: 3 });
  await storage.createActionItem({ bookId: book2.id, text: "Practice the 'pre-mortem' technique before starting any new project: imagine it failed and list why", type: "long_term", orderIndex: 4 });

  // Infographics
  await storage.createInfographic({ bookId: book2.id, title: "System 1 vs System 2", description: "Two modes of thinking that drive every decision", steps: [
    { label: "System 1: Fast", explanation: "Automatic, effortless, emotional. Handles routine decisions in milliseconds. Prone to biases and shortcuts." },
    { label: "System 2: Slow", explanation: "Deliberate, effortful, logical. Activated for complex problems. Requires focus and mental energy." },
    { label: "The Conflict", explanation: "System 1 makes quick judgments. System 2 is supposed to check them — but it's lazy and often just endorses System 1's answer." },
    { label: "The Fix", explanation: "Recognize when System 1 is driving. For important decisions, deliberately activate System 2 by slowing down and questioning assumptions." },
  ], orderIndex: 1 });

  // ===================== BOOK 3: The Power of Now =====================
  const book3 = await storage.createBook({
    title: "The Power of Now",
    author: "Eckhart Tolle",
    coverImage: "/images/book-power-of-now.png",
    description: "A guide to spiritual enlightenment that teaches you to live in the present moment and find inner peace.",
    coreThesis: "The present moment is all you ever have. Suffering is created by the mind's attachment to past and future. True peace comes when you stop identifying with your thoughts and become the awareness behind them.",
    categoryId: catMindfulness.id,
    readTime: 10, listenTime: 8, audioUrl: "placeholder", featured: true,
    principleCount: 3, storyCount: 1, exerciseCount: 2,
  });

  await storage.createChapterSummary({ bookId: book3.id, chapterNumber: 1, chapterTitle: "You Are Not Your Mind", cards: [
    { text: "The greatest obstacle to enlightenment is identification with the mind. You think you ARE your thoughts." },
    { text: "Start listening to the voice in your head as often as you can. Pay attention to repetitive thought patterns." },
    { text: "When you listen to a thought, you become the awareness behind the thought. The thought then loses its power over you." },
    { text: "The moment you realize you are not present, you ARE present. Awareness is the beginning of transformation." },
  ]});
  await storage.createChapterSummary({ bookId: book3.id, chapterNumber: 2, chapterTitle: "Consciousness: The Way Out of Pain", cards: [
    { text: "Emotional pain is created by resistance to what is. The more you resist the present moment, the more you suffer." },
    { text: "The 'pain-body' is an accumulation of old emotional pain. It feeds on negative thinking and drama." },
    { text: "When the pain-body is activated, observe it. Say: 'There is the pain-body.' This simple act of recognition weakens it." },
    { text: "Accept the present moment as if you had chosen it. Work with it, not against it. This removes suffering instantly." },
  ]});

  await storage.createMentalModel({ bookId: book3.id, title: "The Timeline of Suffering", description: "How the mind creates pain through time-based thinking.", orderIndex: 1, steps: [
    { label: "Past = Guilt & Regret", explanation: "The mind replays past events, creating guilt, resentment, and 'if only' stories that have no power to change anything." },
    { label: "Future = Anxiety & Fear", explanation: "The mind projects worst-case scenarios forward, generating anxiety about things that haven't happened and may never happen." },
    { label: "The Present = Peace", explanation: "In the actual present moment, stripped of mental stories, there is usually no problem. There is only what IS." },
    { label: "The Practice", explanation: "Ask yourself: 'Am I at ease in this moment?' If not, what are you resisting? Accept what is, then act from clarity, not fear." },
  ]});

  const p3_1 = await storage.createPrinciple({ bookId: book3.id, title: "The Present Moment Is All You Have", content: "Nothing has happened in the past; it happened in the Now. Nothing will ever happen in the future; it will happen in the Now. The present moment is the only thing you ever have.", orderIndex: 1, icon: "circle" });
  await storage.createStory({ bookId: book3.id, principleId: p3_1.id, title: "The Beggar on the Box", content: "Tolle tells the story of a beggar who sat on a box at the side of the road for years. One day a passerby asked what was in the box. 'Nothing,' said the beggar. The passerby insisted he look. The beggar pried open the lid and discovered the box was filled with gold.", moral: "Stop looking outside yourself for fulfillment. Everything you need is already within you, accessible through present-moment awareness.", orderIndex: 1 });

  await storage.createPrinciple({ bookId: book3.id, title: "You Are Not Your Mind", content: "The beginning of freedom is the realization that you are not the possessing entity — the thinker. The moment you start watching the thinker, a higher level of consciousness becomes activated.", orderIndex: 2, icon: "eye" });
  await storage.createPrinciple({ bookId: book3.id, title: "The Pain-Body", content: "The pain-body is a semi-autonomous energy form that lives within most human beings. It is the accumulated emotional pain from the past. It can be dormant or active.", orderIndex: 3, icon: "heart" });

  await storage.createCommonMistake({ bookId: book3.id, mistake: "Using meditation or mindfulness as another goal to achieve, another thing to 'get right.'", correction: "Presence isn't something you accomplish. It's what remains when you stop doing. Simply notice you're thinking — that IS the practice.", orderIndex: 1 });
  await storage.createCommonMistake({ bookId: book3.id, mistake: "Believing you need to stop all thoughts to be 'present.' Getting frustrated when thoughts keep coming.", correction: "You can't stop thoughts. But you can stop identifying with them. Watch them pass like clouds — you are the sky, not the weather.", orderIndex: 2 });

  await storage.createExercise({ bookId: book3.id, title: "One-Minute Presence", description: "Practice being fully present for 60 seconds.", type: "action_plan", impact: "high", content: { steps: ["Close your eyes and take three deep breaths", "Focus your attention on the sensations in your body", "Notice sounds around you without labeling them", "Feel the aliveness in your hands", "When thoughts arise, simply observe them without engaging", "Open your eyes and notice how you feel"] }, orderIndex: 1 });
  await storage.createExercise({ bookId: book3.id, title: "Watching the Thinker", description: "Practice observing your thoughts without attachment.", type: "reflection", impact: "high", content: { prompt: "Set a timer for 5 minutes. Sit quietly and observe the stream of thoughts that passes through your mind. Don't judge or try to stop any thoughts. After the exercise, write about what you noticed." }, orderIndex: 2 });

  await storage.createActionItem({ bookId: book3.id, text: "Right now, take 3 conscious breaths and feel the sensation of air entering your body", type: "immediate", orderIndex: 1 });
  await storage.createActionItem({ bookId: book3.id, text: "Choose one daily activity (washing dishes, walking) and do it with 100% attention today", type: "immediate", orderIndex: 2 });
  await storage.createActionItem({ bookId: book3.id, text: "Practice 5 minutes of 'watching the thinker' meditation every morning for 30 days", type: "long_term", orderIndex: 3 });
  await storage.createActionItem({ bookId: book3.id, text: "Set 3 random daily alarms labeled 'Am I present?' as mindfulness triggers for 60 days", type: "long_term", orderIndex: 4 });

  // Infographics
  await storage.createInfographic({ bookId: book3.id, title: "The Layers of Presence", description: "Moving from thought to awareness in 3 levels", steps: [
    { label: "Level 1: Thinking", explanation: "Lost in the stream of thoughts. Past regrets and future anxieties dominate. You identify completely with your mind." },
    { label: "Level 2: Observing", explanation: "You notice you're thinking. A gap opens between you and your thoughts. This is the beginning of presence." },
    { label: "Level 3: Being", explanation: "Pure awareness without labels. You experience life directly — sounds, sensations, aliveness — without the filter of mental commentary." },
  ], orderIndex: 1 });

  // ===================== BOOK 4: Emotional Intelligence =====================
  const book4 = await storage.createBook({
    title: "Emotional Intelligence",
    author: "Daniel Goleman",
    coverImage: "/images/book-emotional-intelligence.png",
    description: "Why emotional intelligence can matter more than IQ. A revolutionary framework for understanding human behavior.",
    coreThesis: "IQ accounts for only 20% of life success. The remaining 80% is determined by emotional intelligence — your ability to recognize, understand, and manage your own emotions and those of others.",
    categoryId: catEmotions.id,
    readTime: 14, listenTime: 11, audioUrl: "placeholder", featured: false,
    principleCount: 3, storyCount: 1, exerciseCount: 2,
  });

  await storage.createChapterSummary({ bookId: book4.id, chapterNumber: 1, chapterTitle: "What Are Emotions For?", cards: [
    { text: "Emotions evolved as survival signals. Fear triggers the fight-or-flight response. Anger prepares you to confront threats." },
    { text: "The problem: our emotional brain was designed for prehistoric threats, not modern stressors like emails and traffic." },
    { text: "The amygdala — our emotional alarm system — can hijack rational thinking in milliseconds, before the thinking brain even has a chance." },
    { text: "Understanding this hijack is the first step to emotional intelligence: creating space between stimulus and response." },
  ]});
  await storage.createChapterSummary({ bookId: book4.id, chapterNumber: 2, chapterTitle: "The Five Pillars of EQ", cards: [
    { text: "Pillar 1: Self-Awareness — knowing what you're feeling as you feel it." },
    { text: "Pillar 2: Self-Regulation — managing impulses and distressing emotions effectively." },
    { text: "Pillar 3: Motivation — using emotions to drive you toward goals despite setbacks." },
    { text: "Pillars 4 & 5: Empathy and Social Skills — reading others' emotions and managing relationships successfully." },
  ]});

  await storage.createMentalModel({ bookId: book4.id, title: "The EQ Framework", description: "Daniel Goleman's five components of emotional intelligence.", orderIndex: 1, steps: [
    { label: "Self-Awareness", explanation: "Recognizing your emotions in real-time. This is the foundation — you can't manage what you don't notice." },
    { label: "Self-Regulation", explanation: "The ability to pause before reacting. Managing impulses, anxiety, and anger constructively." },
    { label: "Motivation", explanation: "Using emotional energy to pursue goals with persistence. Delaying gratification for long-term rewards." },
    { label: "Empathy", explanation: "Sensing what others feel without them telling you. Reading body language, tone, and unspoken signals." },
    { label: "Social Skills", explanation: "Managing relationships effectively. Influence, conflict resolution, collaboration, and leadership." },
  ]});

  const p4_1 = await storage.createPrinciple({ bookId: book4.id, title: "Self-Awareness Is the Foundation", content: "Emotional intelligence begins with self-awareness — the ability to recognize and understand your own emotions as they occur.", orderIndex: 1, icon: "mirror" });
  const p4_2 = await storage.createPrinciple({ bookId: book4.id, title: "Emotional Hijacking", content: "The amygdala can trigger an emotional response before the rational brain has time to process the situation. This 'amygdala hijack' explains why we sometimes say or do things in anger that we later regret.", orderIndex: 2, icon: "zap" });
  await storage.createStory({ bookId: book4.id, principleId: p4_2.id, title: "The Road Rage Incident", content: "Goleman describes a man who cut off another driver in traffic. The offended driver chased him for miles, eventually forcing both cars to stop. In the confrontation, one man was shot. A trivial driving incident escalated to tragedy because the amygdala hijacked all rational thought — the emotional brain took the wheel.", moral: "An amygdala hijack can turn a minor irritation into a life-altering disaster. The pause between stimulus and response is where your power lives.", orderIndex: 1 });
  await storage.createPrinciple({ bookId: book4.id, title: "Empathy Drives Connection", content: "Empathy — the ability to sense other people's emotions — is the most important people skill. It is built on self-awareness; the more open we are to our own emotions, the more skilled we become at reading others.", orderIndex: 3, icon: "users" });

  await storage.createCommonMistake({ bookId: book4.id, mistake: "Suppressing emotions and pretending everything is fine. 'I don't get angry' is usually a red flag, not a strength.", correction: "Acknowledge the emotion without acting on it. Say 'I notice I'm feeling angry right now' — naming the emotion reduces its intensity by up to 50%.", orderIndex: 1 });
  await storage.createCommonMistake({ bookId: book4.id, mistake: "Confusing empathy with agreement. Thinking that understanding someone's perspective means you endorse their behavior.", correction: "Empathy is about understanding, not agreeing. You can fully understand why someone is angry AND still disagree with their actions.", orderIndex: 2 });

  await storage.createExercise({ bookId: book4.id, title: "Emotion Log", description: "Track your emotions throughout the day to build self-awareness.", type: "reflection", impact: "high", content: { prompt: "For the next 24 hours, pause three times and ask yourself: What am I feeling right now? What triggered this feeling? How is this emotion affecting my behavior?" }, orderIndex: 1 });
  await storage.createExercise({ bookId: book4.id, title: "EQ Fundamentals Quiz", description: "Test your understanding of emotional intelligence concepts.", type: "quiz", impact: "low", content: { questions: [{ question: "What is the foundation of emotional intelligence?", options: ["Social skills", "Self-awareness", "Motivation", "Empathy"], correct: 1 }, { question: "What is an 'amygdala hijack'?", options: ["A memory loss event", "An emotional response before rational processing", "A manipulation technique", "A learning disability"], correct: 1 }] }, orderIndex: 2 });

  await storage.createActionItem({ bookId: book4.id, text: "Name your current emotion right now. Say it out loud: 'I am feeling ___.'", type: "immediate", orderIndex: 1 });
  await storage.createActionItem({ bookId: book4.id, text: "In your next difficult conversation, pause for 6 seconds before responding (one full breath cycle)", type: "immediate", orderIndex: 2 });
  await storage.createActionItem({ bookId: book4.id, text: "Keep an Emotion Log for 30 days: 3 check-ins per day noting emotion, trigger, and behavior", type: "long_term", orderIndex: 3 });
  await storage.createActionItem({ bookId: book4.id, text: "Practice active listening in one conversation daily: reflect back what you heard before responding", type: "long_term", orderIndex: 4 });

  // Infographics
  await storage.createInfographic({ bookId: book4.id, title: "The 5 Pillars of EQ", description: "Five skills that define emotional intelligence", steps: [
    { label: "1. Self-Awareness", explanation: "Recognize your emotions as they happen. Know your strengths, weaknesses, and emotional triggers." },
    { label: "2. Self-Regulation", explanation: "Manage disruptive emotions. Pause before reacting. Choose your response instead of being controlled by impulse." },
    { label: "3. Motivation", explanation: "Drive yourself toward goals with optimism and resilience, even when facing setbacks." },
    { label: "4. Empathy", explanation: "Sense and understand other people's emotions. See situations from their perspective." },
    { label: "5. Social Skills", explanation: "Build relationships, manage conflict, inspire and influence others through effective communication." },
  ], orderIndex: 1 });

  // ===================== BOOK 5: Man's Search for Meaning =====================
  const book5 = await storage.createBook({
    title: "Man's Search for Meaning",
    author: "Viktor E. Frankl",
    coverImage: "/images/book-mans-search.png",
    description: "A psychiatrist's experience in Nazi death camps and its lessons for spiritual survival. Finding meaning in suffering.",
    coreThesis: "Everything can be taken from a person except the last human freedom — to choose one's attitude in any given set of circumstances. Those who find meaning in their suffering can endure almost anything.",
    categoryId: catMeaning.id,
    readTime: 8, listenTime: 7, audioUrl: "placeholder", featured: false,
    principleCount: 3, storyCount: 1, exerciseCount: 1,
  });

  await storage.createChapterSummary({ bookId: book5.id, chapterNumber: 1, chapterTitle: "Experiences in a Concentration Camp", cards: [
    { text: "Frankl observed three psychological phases among prisoners: shock on arrival, apathy during imprisonment, and disorientation after liberation." },
    { text: "Those who survived were not the physically strongest, but those who found something to live for — a loved one, a task, a purpose." },
    { text: "Even in the most degrading conditions, prisoners who maintained an inner life and sense of meaning were more resilient." },
    { text: "Frankl realized: suffering ceases to be suffering the moment it finds a meaning — such as a sacrifice for a loved one." },
  ]});
  await storage.createChapterSummary({ bookId: book5.id, chapterNumber: 2, chapterTitle: "Logotherapy in a Nutshell", cards: [
    { text: "Logotherapy is Frankl's therapeutic approach. 'Logos' means 'meaning.' The primary drive in humans is not pleasure or power, but meaning." },
    { text: "There are three ways to find meaning: through creative work, through experiencing beauty or love, and through the attitude we take toward unavoidable suffering." },
    { text: "The 'existential vacuum' — a feeling of inner emptiness and meaninglessness — is the mass neurosis of our time." },
    { text: "Freedom without responsibility is empty. True fulfillment comes when you take responsibility for creating meaning in your life." },
  ]});

  await storage.createMentalModel({ bookId: book5.id, title: "The Three Sources of Meaning", description: "Frankl's framework for finding purpose in any circumstance.", orderIndex: 1, steps: [
    { label: "Creative Values", explanation: "Meaning through what you give to the world: your work, your art, your contributions. Creating something larger than yourself." },
    { label: "Experiential Values", explanation: "Meaning through what you receive from the world: love, beauty, truth, nature. The richness of fully experiencing life." },
    { label: "Attitudinal Values", explanation: "Meaning through the stance you take toward unavoidable suffering. The highest form of meaning — turning tragedy into triumph." },
  ]});

  const p5_1 = await storage.createPrinciple({ bookId: book5.id, title: "The Last Human Freedom", content: "Everything can be taken from a man but one thing: the last of the human freedoms — to choose one's attitude in any given set of circumstances.", orderIndex: 1, icon: "key" });
  await storage.createStory({ bookId: book5.id, principleId: p5_1.id, title: "The Imagined Lecture", content: "During his time in the concentration camps, Frankl kept himself going by imagining himself giving a lecture after the war about the psychology of the concentration camp. This mental exercise gave him a sense of purpose — transforming his suffering into a subject for future teaching.", moral: "When you find a 'why' to live for, you can endure almost any 'how.' Projecting purpose into the future can sustain you through present suffering.", orderIndex: 1 });

  await storage.createPrinciple({ bookId: book5.id, title: "Meaning Through Suffering", content: "If there is meaning in life at all, then there must be meaning in suffering. The way in which a person takes up their cross gives them ample opportunity to add a deeper meaning to life.", orderIndex: 2, icon: "mountain" });
  await storage.createPrinciple({ bookId: book5.id, title: "Logotherapy: The Will to Meaning", content: "Frankl's therapeutic approach, logotherapy, is based on the premise that the primary motivational force of an individual is to find meaning in life.", orderIndex: 3, icon: "compass" });

  await storage.createCommonMistake({ bookId: book5.id, mistake: "Pursuing happiness directly. Making 'being happy' the goal of your life.", correction: "Happiness cannot be pursued; it must ensue. It comes as a side effect of dedicating yourself to a cause greater than yourself or loving another person.", orderIndex: 1 });
  await storage.createCommonMistake({ bookId: book5.id, mistake: "Believing suffering is always meaningless and should be avoided at all costs.", correction: "Unavoidable suffering can become meaningful when you choose your response to it. This doesn't mean seeking suffering — but when it comes, find the lesson.", orderIndex: 2 });

  await storage.createExercise({ bookId: book5.id, title: "Finding Your 'Why'", description: "Reflect on what gives your life meaning and purpose.", type: "reflection", impact: "high", content: { prompt: "Frankl believed there are three sources of meaning: (1) creating a work or doing a deed, (2) experiencing something or encountering someone, and (3) the attitude we take toward unavoidable suffering. Reflect on your life through these three lenses." }, orderIndex: 1 });

  await storage.createActionItem({ bookId: book5.id, text: "Write down one thing that gives your life meaning right now. Put it where you'll see it daily.", type: "immediate", orderIndex: 1 });
  await storage.createActionItem({ bookId: book5.id, text: "Think of a current struggle. Write down what lesson or growth it could be teaching you.", type: "immediate", orderIndex: 2 });
  await storage.createActionItem({ bookId: book5.id, text: "Create a personal mission statement using Frankl's three sources of meaning. Revisit it monthly.", type: "long_term", orderIndex: 3 });
  await storage.createActionItem({ bookId: book5.id, text: "Practice 'attitudinal values' by reframing one difficult situation each week as an opportunity for growth", type: "long_term", orderIndex: 4 });

  // Infographics
  await storage.createInfographic({ bookId: book5.id, title: "Three Sources of Meaning", description: "Frankl's framework for finding purpose in any circumstance", steps: [
    { label: "1. Creative Values", explanation: "Find meaning through what you give to the world — your work, art, ideas, or deeds. What can you create or contribute?" },
    { label: "2. Experiential Values", explanation: "Find meaning through what you receive from the world — love, beauty, truth, nature. What moments take your breath away?" },
    { label: "3. Attitudinal Values", explanation: "Find meaning through the stance you take toward unavoidable suffering. When you can't change the situation, you can still choose your response." },
  ], orderIndex: 1 });

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

  console.log("Database seeded successfully with new taxonomy!");
}
