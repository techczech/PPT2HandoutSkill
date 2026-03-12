// Session information configuration
// Fill in details relevant to your presentation
// Optional fields can be left empty ("") or arrays empty ([])

interface FeaturedLink {
  name: string;
  url: string;
  description?: string;
}

export const sessionInfo = {
  // Main presentation title
  title: "Using Large Language Models to Support Hermeneutic Systematic Review",
  // Subtitle or tagline
  subtitle:
    "Mechanism-Informed Narrative Synthesis of Complex Evidence (MINSCE)",

  // Link to the talk/presentation page (optional)
  talkPageUrl: "https://events.teams.microsoft.com/event/e442eb07-6ad5-4a2e-b001-8a75bd421623@cc95de1b-97f5-4f93-b4ba-fe68b852cf91",
  talkPageLabel: "Event Page",

  speaker: {
    name: "Trish Greenhalgh",
    affiliation: "University of Oxford",
    email: "trish.greenhalgh@phc.ox.ac.uk",
    links: {
      website: "",
    },
    bio: `Professor Greenhalgh is a medical doctor and Professor of Primary Care Health Sciences, recognised internationally for her work at the intersection of medicine, social science and digital innovation. Her research spans evidence synthesis, innovation adoption in healthcare, and narrative and interpretive methods — including hermeneutic and meta-narrative reviews. She has authored almost 500 peer-reviewed publications and 16 textbooks, and received numerous honours, including an OBE and fellowship of the UK Academy of Medical Sciences.`,
  },

  // Event/conference details
  event: {
    name: "Methods in the Age of AI",
    date: "5 March 2025",
    time: "13:00–14:00 GMT",
    location: "Online (Teams Webinar)",
    type: "Webinar",
    sessionLink: "https://events.teams.microsoft.com/event/e442eb07-6ad5-4a2e-b001-8a75bd421623@cc95de1b-97f5-4f93-b4ba-fe68b852cf91",
  },

  // Multi-paragraph abstract
  abstract: `Previous scholars have used generative AI to speed up the process of 'PRISMA-compliant' systematic review (e.g. by automating the search and screening steps). This lecture will describe a novel use of generative AI (ChatGPT5.1 research mode) to support hermeneutic review, using mask efficacy in reducing transmission of respiratory diseases as an empirical example. Hermeneutic review, which requires detailed reading of texts and iterative refinement of an emerging account of the evidence, sits mainly in the humanities and social science traditions. Its aim is clarification and understanding, though the primary studies may be quantitative, qualitative or both.

Mechanism-Informed Narrative Synthesis of Complex Evidence (MINSCE) involves 5 steps: searching, preparing an initial explanatory account, developing bespoke tools (including constructing a Generative Pretrained Transformer), applying tools to individual studies, and synthesising. While AI supports each step, MINSCE remains a human process throughout.

While the performance of the large language model was impressive overall, examples will be given of errors and deficiencies, including misclassification of study design, appraising the wrong study (and mislabelling it), confabulation, failing to spot key information in a paper, and failing to suspect a study whose response rate and data completeness were probably too good to be true. These failures were, however, surprisingly rare and relatively easy to spot using a human-led close reading approach.`,

  // Key topics covered in the presentation
  keyTopics: [
    "The distinction between aggregative (PRISMA-compliant) and hermeneutic (narrative) systematic review",
    "Four paradigm shifts: review logic, evidence valuation, appraisal tools, and AI usage",
    "A 5-step method: Search, Explain, Develop Tools, Appraise, Synthesise",
    "Using AI as a conversational agent for evidence synthesis, not just a process accelerator",
    "Mechanisms-of-bias analysis as an alternative to traditional risk-of-bias tools",
    "Building custom GPTs for structured study appraisal with human oversight",
    "Practical demonstration using face mask efficacy evidence",
  ],

  // Featured links section
  featuredLinks: {
    title: "Key Tools & Resources",
    items: [
      {
        name: "ChatGPT",
        url: "https://chat.openai.com",
        description:
          "Used as a conversational agent for challenging, brainstorming, and refining explanatory accounts",
      },
      {
        name: "TERA (Evidence Review Accelerator)",
        url: "https://terasoftware.com.au",
        description:
          "Bond University tool for accelerating conventional PRISMA-compliant systematic reviews",
      },
    ] as FeaturedLink[],
  },
};
