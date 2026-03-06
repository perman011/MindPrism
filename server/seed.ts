import { storage } from "./storage";
import { db } from "./db";
import { books, shorts } from "@shared/schema";
import { users } from "@shared/models/auth";
import { eq } from "drizzle-orm";

async function ensureAdminRole() {
  const adminIds = (process.env.ADMIN_USER_IDS || "35323958").split(",").map(s => s.trim()).filter(Boolean);
  for (const adminId of adminIds) {
    const [existing] = await db.select().from(users).where(eq(users.id, adminId));
    if (existing && existing.role !== "super_admin") {
      await db.update(users).set({ role: "super_admin", updatedAt: new Date() }).where(eq(users.id, adminId));
      console.log(`Promoted user ${adminId} to super_admin`);
    }
  }
}

export async function seedDatabase() {
  await ensureAdminRole();

  const existingBooks = await db.select().from(books).limit(1);
  if (existingBooks.length > 0) {
    const existingShorts = await db.select().from(shorts).limit(1);
    if (existingShorts.length === 0) {
      console.log("Books exist but shorts missing, seeding shorts...");
      await seedShortsForExistingBooks();
    } else {
      console.log("Database already seeded, skipping...");
    }
    return;
  }

  console.log("Seeding database with psychology book content...");

  const catHabits = await storage.createCategory({ name: "Habits", slug: "habits", icon: "target", color: "amber" });
  const catMindset = await storage.createCategory({ name: "Mindset", slug: "mindset", icon: "brain", color: "purple" });
  const catMindfulness = await storage.createCategory({ name: "Mindfulness", slug: "mindfulness", icon: "eye", color: "teal" });
  const catEmotions = await storage.createCategory({ name: "Emotions", slug: "emotions", icon: "lightbulb", color: "rose" });
  const catMeaning = await storage.createCategory({ name: "Purpose", slug: "meaning", icon: "sparkles", color: "indigo" });

  // Expanded categories for all book types
  const catBusiness = await storage.createCategory({ name: "Business", slug: "business", icon: "briefcase", color: "blue" });
  const catLeadership = await storage.createCategory({ name: "Leadership", slug: "leadership", icon: "crown", color: "gold" });
  const catProductivity = await storage.createCategory({ name: "Productivity", slug: "productivity", icon: "zap", color: "orange" });
  const catScience = await storage.createCategory({ name: "Science", slug: "science", icon: "flask", color: "cyan" });
  const catHistory = await storage.createCategory({ name: "History", slug: "history", icon: "scroll", color: "brown" });
  const catHealth = await storage.createCategory({ name: "Health & Fitness", slug: "health-fitness", icon: "heart-pulse", color: "red" });
  const catRelationships = await storage.createCategory({ name: "Relationships", slug: "relationships", icon: "users", color: "pink" });
  const catFinance = await storage.createCategory({ name: "Money & Finance", slug: "money-finance", icon: "wallet", color: "emerald" });
  const catCreativity = await storage.createCategory({ name: "Creativity", slug: "creativity", icon: "palette", color: "violet" });
  const catPhilosophy = await storage.createCategory({ name: "Philosophy", slug: "philosophy", icon: "book-open", color: "slate" });
  const catParenting = await storage.createCategory({ name: "Parenting", slug: "parenting", icon: "baby", color: "sky" });
  const catSpirituality = await storage.createCategory({ name: "Spirituality", slug: "spirituality", icon: "sun", color: "yellow" });
  const catCommunication = await storage.createCategory({ name: "Communication", slug: "communication", icon: "message-circle", color: "lime" });
  const catTechnology = await storage.createCategory({ name: "Technology", slug: "technology", icon: "cpu", color: "zinc" });
  const catBiography = await storage.createCategory({ name: "Biography", slug: "biography", icon: "user", color: "stone" });

  const book1 = await storage.createBook({
    title: "Atomic Habits",
    author: "James Clear",
    coverImage: "/images/book-atomic-habits.png",
    description: "An easy and proven way to build good habits and break bad ones. Tiny changes, remarkable results.",
    coreThesis: "You do not rise to the level of your goals. You fall to the level of your systems. Small habits compound into extraordinary results when you focus on becoming 1% better every day.",
    categoryId: catHabits.id,
    readTime: 12, listenTime: 10, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", audioDuration: 600, featured: true,
    primaryChakra: "solar_plexus", secondaryChakra: "sacral",
  });

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

  const book2 = await storage.createBook({
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    coverImage: "/images/book-thinking-fast-slow.png",
    description: "A groundbreaking tour of the mind that explains the two systems that drive the way we think and make choices.",
    coreThesis: "Our minds operate through two systems: fast intuitive thinking and slow deliberate reasoning. Understanding both helps us make better decisions.",
    categoryId: catMindset.id,
    readTime: 15, listenTime: 12, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", audioDuration: 720, featured: true,
    primaryChakra: "third_eye", secondaryChakra: "crown",
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

  const book3 = await storage.createBook({
    title: "The Power of Now",
    author: "Eckhart Tolle",
    coverImage: "/images/book-power-of-now.png",
    description: "A guide to spiritual enlightenment. Tolle takes readers on an inspiring spiritual journey to find their true and deepest self and reach the ultimate in personal growth and spirituality.",
    coreThesis: "True freedom and enlightenment come from living fully in the present moment, free from the dominance of the thinking mind and ego.",
    categoryId: catMindfulness.id,
    readTime: 10, listenTime: 8, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", audioDuration: 480, featured: false,
    primaryChakra: "third_eye", secondaryChakra: "crown",
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

  const book4 = await storage.createBook({
    title: "Emotional Intelligence",
    author: "Daniel Goleman",
    coverImage: "/images/book-emotional-intelligence.png",
    description: "Why emotional intelligence can matter more than IQ. A revolutionary framework for understanding human behavior.",
    coreThesis: "Emotional intelligence — the ability to recognize, understand, and manage emotions — is as important as IQ for success in life.",
    categoryId: catEmotions.id,
    readTime: 14, listenTime: 11, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", audioDuration: 660, featured: false,
    primaryChakra: "heart", secondaryChakra: "throat",
  });

  await storage.createChapterSummary({ bookId: book4.id, chapterNumber: 1, chapterTitle: "What Are Emotions For?", cards: [
    { text: "Emotions are action signals. Fear prepares you to flee, anger prepares you to fight, joy signals safety and opportunity." },
    { text: "The emotional brain (amygdala) can react before the rational brain (prefrontal cortex) even processes the situation." },
    { text: "This 'amygdala hijack' explains why we sometimes say things in anger that we later deeply regret." },
    { text: "Emotional intelligence is not about suppressing emotions — it's about understanding and channeling them wisely." },
  ]});
  await storage.createChapterSummary({ bookId: book4.id, chapterNumber: 2, chapterTitle: "The Five Domains of EQ", cards: [
    { text: "Self-Awareness: recognizing your emotions as they happen. This is the foundation of all emotional intelligence." },
    { text: "Self-Regulation: managing disruptive emotions. The ability to pause between stimulus and response." },
    { text: "Motivation: using emotions to drive toward goals. Resilience in the face of setbacks." },
    { text: "Empathy and Social Skills: reading others' emotions and managing relationships — the interpersonal dimensions of EQ." },
  ]});

  await storage.createMentalModel({ bookId: book4.id, title: "The Five Pillars of EQ", description: "Goleman's framework for emotional intelligence mastery.", orderIndex: 1, steps: [
    { label: "Self-Awareness", explanation: "Recognizing your own emotions in real-time. Knowing your strengths, weaknesses, and emotional triggers." },
    { label: "Self-Regulation", explanation: "Managing disruptive impulses and moods. Thinking before acting. Choosing your response instead of reacting." },
    { label: "Motivation", explanation: "Being driven to achieve for the sake of achievement. Optimism and commitment even when facing setbacks." },
    { label: "Empathy", explanation: "Sensing what others feel without them telling you. Reading body language, tone, and unspoken signals." },
    { label: "Social Skills", explanation: "Managing relationships effectively. Influence, conflict resolution, collaboration, and leadership." },
  ]});

  const book5 = await storage.createBook({
    title: "Man's Search for Meaning",
    author: "Viktor E. Frankl",
    coverImage: "/images/book-mans-search.png",
    description: "A psychiatrist's experience in Nazi death camps and its lessons for spiritual survival. Finding meaning in suffering.",
    coreThesis: "Those who have a 'why' to live can bear with almost any 'how.' Meaning can be found even in the worst suffering.",
    categoryId: catMeaning.id,
    readTime: 8, listenTime: 7, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", audioDuration: 420, featured: false,
    primaryChakra: "crown", secondaryChakra: "heart",
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

  await storage.createShort({
    bookId: book1.id, title: "The 1% Rule That Changes Everything",
    content: "If you get just 1% better each day, you'll be 37 times better in one year. The secret isn't massive action — it's tiny, consistent improvements that compound over time. Your habits are the compound interest of self-improvement.",
    mediaType: "text", backgroundGradient: "linear-gradient(135deg, #6B21A8, #9333EA, #A855F7)", duration: 15, orderIndex: 1, status: "published",
  });
  await storage.createShort({
    bookId: book1.id, title: "You Don't Rise to Your Goals",
    content: "You don't rise to the level of your goals. You fall to the level of your systems. Every Olympic athlete wants to win gold — the difference is in the daily systems they build. Stop obsessing over outcomes. Build better systems instead.",
    mediaType: "text", backgroundGradient: "linear-gradient(135deg, #7C3AED, #8B5CF6, #C084FC)", duration: 15, orderIndex: 2, status: "published",
  });
  await storage.createShort({
    bookId: book2.id, title: "Your Brain Has Two Pilots",
    content: "System 1 is your autopilot — fast, intuitive, and often wrong. System 2 is your co-pilot — slow, deliberate, and lazy. Most of your 'decisions' are actually System 1 reflexes that System 2 never bothered to check. The key? Know which system is flying.",
    mediaType: "text", backgroundGradient: "linear-gradient(135deg, #1E3A5F, #2563EB, #60A5FA)", duration: 15, orderIndex: 3, status: "published",
  });
  await storage.createShort({
    bookId: book2.id, title: "The Anchoring Trap",
    content: "The first number you hear in any negotiation becomes your anchor — and it silently controls the entire outcome. Even random numbers influence your estimates. Next time someone throws out a number first, pause. Ask yourself: is this anchor real, or is it manipulating me?",
    mediaType: "text", backgroundGradient: "linear-gradient(135deg, #0F766E, #14B8A6, #5EEAD4)", duration: 15, orderIndex: 4, status: "published",
  });
  await storage.createShort({
    bookId: book3.id, title: "The Only Moment That Exists",
    content: "Nothing has ever happened in the past. It happened in the Now. Nothing will ever happen in the future. It will happen in the Now. The present moment is literally all you ever have. Yet most people spend their entire lives lost in memories and projections.",
    mediaType: "text", backgroundGradient: "linear-gradient(135deg, #581C87, #7E22CE, #D8B4FE)", duration: 15, orderIndex: 5, status: "published",
  });
  await storage.createShort({
    bookId: book3.id, title: "You Are Not Your Thoughts",
    content: "The moment you realize you are not present, you ARE present. You can't observe the thinker if you ARE the thinker. This gap — between the thought and the awareness of the thought — is where freedom lives. Watch your mind like you'd watch clouds passing.",
    mediaType: "text", backgroundGradient: "linear-gradient(135deg, #4C1D95, #6D28D9, #A78BFA)", duration: 15, orderIndex: 6, status: "published",
  });
  await storage.createShort({
    bookId: book4.id, title: "The 6-Second Rule",
    content: "Your amygdala can hijack your brain in milliseconds — triggering anger, fear, or panic before your rational mind even wakes up. The antidote? Six seconds. One full breath cycle. That's all it takes to let your prefrontal cortex catch up and choose a better response.",
    mediaType: "text", backgroundGradient: "linear-gradient(135deg, #9F1239, #E11D48, #FB7185)", duration: 15, orderIndex: 7, status: "published",
  });
  await storage.createShort({
    bookId: book4.id, title: "Name It to Tame It",
    content: "When you name an emotion — 'I notice I'm feeling anxious right now' — brain scans show the amygdala's activity drops by up to 50%. Labeling emotions engages your prefrontal cortex, which calms the emotional brain. Awareness is not weakness. It's your superpower.",
    mediaType: "text", backgroundGradient: "linear-gradient(135deg, #B91C1C, #DC2626, #F87171)", duration: 15, orderIndex: 8, status: "published",
  });
  await storage.createShort({
    bookId: book5.id, title: "The Last Human Freedom",
    content: "Everything can be taken from a person except one thing: the freedom to choose your attitude in any circumstance. Viktor Frankl discovered this in Auschwitz. The guards could control his body, but never his mind. Between stimulus and response, there is a space. In that space is your power.",
    mediaType: "text", backgroundGradient: "linear-gradient(135deg, #1E40AF, #3B82F6, #93C5FD)", duration: 15, orderIndex: 9, status: "published",
  });
  await storage.createShort({
    bookId: book5.id, title: "Why Happiness Can't Be Chased",
    content: "Happiness cannot be pursued — it must ensue. The more you chase happiness directly, the more it eludes you. It comes as a side effect of dedicating yourself to a cause greater than yourself, or loving another person deeply. Stop chasing. Start meaning.",
    mediaType: "text", backgroundGradient: "linear-gradient(135deg, #312E81, #4338CA, #818CF8)", duration: 15, orderIndex: 10, status: "published",
  });
  await storage.createShort({
    bookId: book1.id, title: "Identity Beats Motivation",
    content: "Don't say 'I want to read more.' Say 'I am a reader.' Every action you take is a vote for the type of person you wish to become. No single vote is decisive, but as the votes build up, the evidence of your new identity builds up too. Become the person, then the habits follow.",
    mediaType: "text", backgroundGradient: "linear-gradient(135deg, #92400E, #D97706, #FCD34D)", duration: 15, orderIndex: 11, status: "published",
  });
  await storage.createShort({
    bookId: book2.id, title: "Losses Hit Twice as Hard",
    content: "Losing $100 feels about twice as painful as gaining $100 feels good. This asymmetry — loss aversion — shapes almost every decision you make. It's why you hold losing stocks too long, stay in bad relationships, and fear change even when the odds favor it.",
    mediaType: "text", backgroundGradient: "linear-gradient(135deg, #065F46, #059669, #6EE7B7)", duration: 15, orderIndex: 12, status: "published",
  });

  console.log("Database seeded successfully!");
}

async function seedShortsForExistingBooks() {
  const allBooks = await db.select().from(books);
  const bookByTitle = (title: string) => allBooks.find(b => b.title === title);

  const book1 = bookByTitle("Atomic Habits");
  const book2 = bookByTitle("Thinking, Fast and Slow");
  const book3 = bookByTitle("The Power of Now");
  const book4 = bookByTitle("Emotional Intelligence");
  const book5 = bookByTitle("Man's Search for Meaning");

  if (!book1 || !book2 || !book3 || !book4 || !book5) {
    console.log("Not all books found, skipping shorts seeding");
    return;
  }

  const shortsData = [
    { bookId: book1.id, title: "The 1% Rule That Changes Everything", content: "If you get just 1% better each day, you'll be 37 times better in one year.", mediaType: "text", backgroundGradient: "linear-gradient(135deg, #6B21A8, #9333EA, #A855F7)", duration: 15, orderIndex: 1, status: "published" },
    { bookId: book1.id, title: "You Don't Rise to Your Goals", content: "You don't rise to the level of your goals. You fall to the level of your systems.", mediaType: "text", backgroundGradient: "linear-gradient(135deg, #7C3AED, #8B5CF6, #C084FC)", duration: 15, orderIndex: 2, status: "published" },
    { bookId: book2.id, title: "Your Brain Has Two Pilots", content: "System 1 is your autopilot — fast, intuitive, and often wrong. System 2 is your co-pilot — slow, deliberate, and lazy.", mediaType: "text", backgroundGradient: "linear-gradient(135deg, #1E3A5F, #2563EB, #60A5FA)", duration: 15, orderIndex: 3, status: "published" },
    { bookId: book2.id, title: "The Anchoring Trap", content: "The first number you hear in any negotiation becomes your anchor — and it silently controls the entire outcome.", mediaType: "text", backgroundGradient: "linear-gradient(135deg, #0F766E, #14B8A6, #5EEAD4)", duration: 15, orderIndex: 4, status: "published" },
    { bookId: book3.id, title: "The Only Moment That Exists", content: "Nothing has ever happened in the past. It happened in the Now. The present moment is literally all you ever have.", mediaType: "text", backgroundGradient: "linear-gradient(135deg, #581C87, #7E22CE, #D8B4FE)", duration: 15, orderIndex: 5, status: "published" },
    { bookId: book3.id, title: "You Are Not Your Thoughts", content: "The moment you realize you are not present, you ARE present. This gap is where freedom lives.", mediaType: "text", backgroundGradient: "linear-gradient(135deg, #4C1D95, #6D28D9, #A78BFA)", duration: 15, orderIndex: 6, status: "published" },
    { bookId: book4.id, title: "The 6-Second Rule", content: "Your amygdala can hijack your brain in milliseconds. The antidote? Six seconds. One full breath cycle.", mediaType: "text", backgroundGradient: "linear-gradient(135deg, #9F1239, #E11D48, #FB7185)", duration: 15, orderIndex: 7, status: "published" },
    { bookId: book4.id, title: "Name It to Tame It", content: "When you name an emotion, brain scans show the amygdala's activity drops by up to 50%. Awareness is your superpower.", mediaType: "text", backgroundGradient: "linear-gradient(135deg, #B91C1C, #DC2626, #F87171)", duration: 15, orderIndex: 8, status: "published" },
    { bookId: book5.id, title: "The Last Human Freedom", content: "Everything can be taken from a person except the freedom to choose your attitude in any circumstance.", mediaType: "text", backgroundGradient: "linear-gradient(135deg, #1E40AF, #3B82F6, #93C5FD)", duration: 15, orderIndex: 9, status: "published" },
    { bookId: book5.id, title: "Why Happiness Can't Be Chased", content: "Happiness cannot be pursued — it must ensue. It comes as a side effect of dedicating yourself to a cause greater than yourself.", mediaType: "text", backgroundGradient: "linear-gradient(135deg, #312E81, #4338CA, #818CF8)", duration: 15, orderIndex: 10, status: "published" },
    { bookId: book1.id, title: "Identity Beats Motivation", content: "Don't say 'I want to read more.' Say 'I am a reader.' Every action is a vote for the type of person you wish to become.", mediaType: "text", backgroundGradient: "linear-gradient(135deg, #92400E, #D97706, #FCD34D)", duration: 15, orderIndex: 11, status: "published" },
    { bookId: book2.id, title: "Losses Hit Twice as Hard", content: "Losing $100 feels about twice as painful as gaining $100 feels good. This asymmetry shapes almost every decision you make.", mediaType: "text", backgroundGradient: "linear-gradient(135deg, #065F46, #059669, #6EE7B7)", duration: 15, orderIndex: 12, status: "published" },
  ];

  for (const shortData of shortsData) {
    await storage.createShort(shortData as any);
  }

  console.log(`Seeded ${shortsData.length} shorts successfully!`);
}
