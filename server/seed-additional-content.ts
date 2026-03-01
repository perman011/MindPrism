import { db, pool } from "./db";
import { books, chapterSummaries, mentalModels, exercises } from "@shared/schema";
import { eq } from "drizzle-orm";

async function seedAdditionalContent() {
  console.log("Seeding additional psychology content...");

  const allBooks = await db.select().from(books);

  const findBook = (titleFragment: string) => {
    const book = allBooks.find(b => b.title.toLowerCase().includes(titleFragment.toLowerCase()));
    if (!book) throw new Error(`Book not found: ${titleFragment}`);
    return book;
  };

  const thinkingFastSlow = findBook("Thinking, Fast and Slow");
  const powerOfNow = findBook("Power of Now");
  const emotionalIntelligence = findBook("Emotional Intelligence");
  const mansSearch = findBook("Man's Search");

  await db.insert(chapterSummaries).values({
    bookId: thinkingFastSlow.id,
    chapterNumber: 3,
    chapterTitle: "Overconfidence and the Illusion of Validity",
    cards: [
      { text: "We are often confident even when we are wrong. Overconfidence is fed by the illusion that we understand the past, which implies we can predict the future." },
      { text: "The 'illusion of validity' makes experts feel certain about predictions that are no better than chance — especially in complex, unpredictable domains." },
      { text: "Kahneman distinguishes between skilled intuition (firefighters, chess players) and overconfident intuition (stock pickers, political pundits)." },
      { text: "To calibrate confidence: ask yourself 'What is the base rate?' and 'How much does this specific evidence actually change the probability?'" },
    ],
  });

  await db.insert(mentalModels).values({
    bookId: thinkingFastSlow.id,
    title: "Prospect Theory",
    description: "How people actually evaluate gains and losses, replacing classical expected utility theory.",
    orderIndex: 2,
    steps: [
      { label: "Reference Point", explanation: "People evaluate outcomes relative to a reference point (usually their current state), not in absolute terms." },
      { label: "Loss Aversion", explanation: "Losses feel roughly twice as painful as equivalent gains feel good. Losing $100 hurts more than gaining $100 pleases." },
      { label: "Diminishing Sensitivity", explanation: "The difference between $100 and $200 feels larger than the difference between $1,100 and $1,200, even though both are $100." },
      { label: "Probability Weighting", explanation: "People overweight small probabilities (why we buy lottery tickets) and underweight large probabilities (why we buy insurance for unlikely events)." },
    ],
  });

  await db.insert(chapterSummaries).values({
    bookId: powerOfNow.id,
    chapterNumber: 3,
    chapterTitle: "Moving Deeply into the Now",
    cards: [
      { text: "Don't seek yourself in the mind. The mind is not who you are. Presence is the key — and it is always available." },
      { text: "Use your senses as a portal to the Now. Feel the aliveness in your hands, the air on your skin, the sounds around you." },
      { text: "The Now is the only point that can take you beyond the limited confines of the mind. It is your only point of access into the timeless realm of Being." },
      { text: "Whenever you deeply accept this moment as it is — whatever form it takes — you are still, you are at peace." },
    ],
  });

  await db.insert(mentalModels).values({
    bookId: powerOfNow.id,
    title: "The Pain-Body",
    description: "Tolle's concept of accumulated emotional pain that lives in the body and feeds on negative thinking.",
    orderIndex: 2,
    steps: [
      { label: "Accumulation", explanation: "Every emotional pain that is not fully faced and accepted leaves behind a residue of pain that merges with pain from the past." },
      { label: "Activation", explanation: "The pain-body can be triggered by situations that resonate with past pain. It then takes over your thinking and creates more suffering." },
      { label: "Recognition", explanation: "The moment you recognize the pain-body in yourself — 'This is the pain-body' — you break its identification with your sense of self." },
      { label: "Dissolution", explanation: "By staying present and witnessing the pain-body without reacting, you transmute it. Presence is the antidote to accumulated pain." },
    ],
  });

  await db.insert(chapterSummaries).values({
    bookId: emotionalIntelligence.id,
    chapterNumber: 3,
    chapterTitle: "The Emotionally Intelligent Brain",
    cards: [
      { text: "The amygdala acts as the brain's emotional sentinel, triggering fight-or-flight responses before the rational cortex can assess the situation." },
      { text: "Emotional hijacking occurs when the amygdala commandeers the brain, causing us to react before we think. Goleman calls this an 'amygdala hijack.'" },
      { text: "The prefrontal cortex can override the amygdala's alarm — but only if we develop the neural pathways through practice." },
      { text: "Emotional intelligence is not fixed at birth. The brain's neuroplasticity means we can strengthen emotional regulation throughout our entire lives." },
    ],
  });

  await db.insert(mentalModels).values({
    bookId: emotionalIntelligence.id,
    title: "The Amygdala Hijack",
    description: "How the emotional brain can override rational thinking, and how to regain control.",
    orderIndex: 2,
    steps: [
      { label: "Trigger", explanation: "A perceived threat activates the amygdala, which sends an emergency signal faster than the rational brain can process." },
      { label: "Hijack", explanation: "The amygdala floods the body with stress hormones, narrowing focus and preparing for fight or flight. Rational thinking is temporarily offline." },
      { label: "The 6-Second Rule", explanation: "Stress hormones take about 6 seconds to dissipate. Pausing, breathing, and counting to 6 gives the prefrontal cortex time to re-engage." },
      { label: "Reappraisal", explanation: "Once the rational brain is back online, you can reframe the situation: 'Is this truly dangerous, or am I overreacting?'" },
    ],
  });

  await db.insert(chapterSummaries).values({
    bookId: mansSearch.id,
    chapterNumber: 3,
    chapterTitle: "Logotherapy in a Nutshell",
    cards: [
      { text: "Logotherapy focuses on the meaning of human existence and on the search for such meaning as the primary motivation in life." },
      { text: "Frankl identifies three main sources of meaning: purposeful work (creating or doing something), love (experiencing something or encountering someone), and courage in suffering." },
      { text: "The 'existential vacuum' — a widespread phenomenon of the 20th century — manifests as boredom, apathy, and a feeling of inner emptiness." },
      { text: "Meaning must be found, not invented. It is unique and specific to each person and each situation — no one else can fulfill it for you." },
    ],
  });

  await db.insert(mentalModels).values({
    bookId: mansSearch.id,
    title: "The Three Sources of Meaning",
    description: "Frankl's framework for finding meaning in any circumstance, even unavoidable suffering.",
    orderIndex: 2,
    steps: [
      { label: "Creative Values", explanation: "Meaning through what we give to the world — through work, art, service, or any act of creation." },
      { label: "Experiential Values", explanation: "Meaning through what we receive from the world — through love, beauty, truth, nature, or encounter with another human being." },
      { label: "Attitudinal Values", explanation: "Meaning through the stance we take toward unavoidable suffering. When we can no longer change a situation, we are challenged to change ourselves." },
      { label: "The Defiant Human Spirit", explanation: "Even in the worst conditions, humans retain the freedom to choose their attitude. This is the last of human freedoms that cannot be taken away." },
    ],
  });

  await db.insert(exercises).values({
    bookId: mansSearch.id,
    title: "Finding Your Why",
    description: "Discover your personal sources of meaning using Frankl's three pathways.",
    type: "reflection",
    impact: "high",
    content: {
      prompt: "Reflect on Frankl's three sources of meaning. Write one example from your own life for each: (1) Creative — something you have created or contributed. (2) Experiential — a moment of deep connection, beauty, or love. (3) Attitudinal — a hardship you faced where you chose your response. Which source of meaning feels strongest for you right now? How could you deepen it this week?"
    },
    orderIndex: 3,
  });

  console.log("Additional content seeded successfully!");
  console.log("- Thinking Fast and Slow: +1 chapter, +1 mental model");
  console.log("- Power of Now: +1 chapter, +1 mental model");
  console.log("- Emotional Intelligence: +1 chapter, +1 mental model");
  console.log("- Man's Search for Meaning: +1 chapter, +1 mental model, +1 exercise");

  await pool.end();
  process.exit(0);
}

seedAdditionalContent().catch((err) => {
  console.error("Error seeding additional content:", err);
  pool.end().then(() => process.exit(1));
});
