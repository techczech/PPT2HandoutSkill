export interface LectureSection {
  sectionTitle: string;
  slideRange: string;
  narrative: string;
}

export const lectureNotes: LectureSection[] = [
  {
    sectionTitle: "Introduction",
    slideRange: "1",
    narrative: `**Key points:**

- Dominik Lukes introduced the first in a series on methodological approaches in the age of AI, featuring Trish Greenhalgh on **hermeneutic approaches to systematic review**
- Greenhalgh combines social sciences and clinical medicine backgrounds, and began experimenting with AI in review only four months prior

Dominik Lukes, consultant at Oxford's AI Competency Centre, welcomed participants to the first session in a series on methodological innovations in AI, with Hazem Zohny scheduled for late April ([slide 1](/slides/1)). He introduced Trish Greenhalgh as a world-renowned expert in evidence-based medicine whose earlier presentation had inspired the series. Greenhalgh had begun experimenting with AI only four months prior and explicitly rejected positioning herself as an expert—yet her pragmatic approach had already yielded promising results, suggesting the methodology's robustness transcends technical sophistication.`
  },
  {
    sectionTitle: "Philosophy & Framing",
    slideRange: "2-8",
    narrative: `**Key points:**

- Greenhalgh contrasts two reviewer types: the **PRISMA-compliant systematic reviewer** who aggregates data via meta-analysis, and the **narrative (hermeneutic) reviewer** who synthesizes understanding across diverse evidence
- Most current AI tools for systematic review accelerate the PRISMA workflow; Greenhalgh's approach uses AI as a **conversational agent** for a fundamentally different kind of review
- Wittgenstein's distinction between problems requiring new data and problems requiring clarification maps onto these two approaches
- The face mask efficacy question sparked MINS development—hundreds of studies, multiple designs, multi-level causality made traditional methods inadequate
- MINS involves four shifts: review logic (aggregate to clarify), evidence valuation (hierarchy to diversity), appraisal tools (risk of bias to domain-sensitive), and AI usage (accelerator to conversational agent)

### The PRISMA-Compliant Systematic Reviewer

Greenhalgh opened the substantive content by introducing the figure of the **PRISMA-compliant systematic reviewer** ([slide 2](/slides/2))—a character who follows a highly formalized, mathematical approach to evidence synthesis. This reviewer starts with a narrow **PICO question**, searches databases systematically, applies a **risk of bias table** to assess study quality, produces a **forest plot** via meta-analysis, and arrives at an average effect estimate with confidence intervals. The approach prizes rigor, transparency, and statistical logic, and is the dominant paradigm in evidence-based medicine.

### Current State of AI-Supported Systematic Review

Greenhalgh situated her work against the broader landscape of AI in systematic review ([slide 3](/slides/3)). She highlighted tools like Paul Glasziou's **TERA (Evidence Review Accelerator)** at Bond University, which uses AI to speed up the conventional PRISMA workflow—automating screening, deduplication, and data extraction. Greenhalgh's approach diverges from this: rather than using AI to make the existing process faster, she uses it as a **conversational agent** for a fundamentally different kind of review.

### The Narrative (Hermeneutic) Reviewer

Greenhalgh then introduced a contrasting figure: the **narrative reviewer** ([slide 4](/slides/4)). This reviewer takes a different path—searching, analyzing, interpreting, and progressively refocusing to build understanding of a body of literature without formal statistical aggregation. Where the systematic reviewer prizes statistical logic, the narrative reviewer produces rich, nuanced understanding. Greenhalgh positioned these not as competing methods but as suited to fundamentally different intellectual purposes.

### Wittgenstein's Philosophical Foundation

Greenhalgh grounded this distinction philosophically through Wittgenstein ([slide 5](/slides/5)). The philosopher distinguished two kinds of problems: those requiring new data (typically addressed by scientific inquiry and aggregative reviews) and those requiring **clarification and insight** by reinterpreting existing knowledge. These map directly onto the two review types—the PRISMA approach for new knowledge generation, the hermeneutic approach for sense-making. This framework legitimizes the narrative method not as an inferior variant but as fundamentally suited to different intellectual purposes.

### The Face Mask Question and Evidence Overload

Greenhalgh's investigation of face mask efficacy ([slide 6](/slides/6)) exemplified the problem MINS addresses. The question was urgent and practical—should London implement mask mandates?—but the evidence was staggeringly complex ([slide 7](/slides/7)). Hundreds of studies used multiple designs, spanned disciplines, involved multi-level causality (material science, immunology, behavioral factors), and exhibited dynamic interactions. Many papers proved difficult to understand even after six years of study. This overwhelmingness demanded a fundamentally different approach than either conventional aggregative or narrative methods alone could provide.

### Four Shifts in Review Logic

MINS involves **four critical shifts** ([slide 8](/slides/8)) that reshape how Greenhalgh conducts synthesis. First, a shift in review logic from extracting and aggregating data toward explaining and clarifying meaning. Second, a shift in evidence valuation away from a rigid hierarchy (RCTs at top) toward **diversity of evidence**, using different designs for different insights. Third, a shift in appraisal tools—rejecting the universally worshipped risk of bias tables in favor of domain-sensitive quality assessment. Finally, the most novel shift: using AI not merely as a process accelerator (making the same work faster) but as a **conversational agent** capable of analyses impossible within human time and cognitive constraints.`
  },
  {
    sectionTitle: "Step 1: Search",
    slideRange: "9-10",
    narrative: `**Key points:**

- Greenhalgh employed traditional review search methods: database searching, reference tracking, and expert consultation
- Three distinct paper sets were identified: background science reviews (Set A), previous systematic reviews on masks (Set B), and primary studies (Set C)
- AI was used **post hoc** as a supplementary tool to validate and extend existing searches, not as the primary search engine
- The team pursued **hypothesis space saturation**—continuing searches until no new explanations or theoretical frameworks emerged
- Quality-based curation replaced quantity, removing lower-value reviews when superior alternatives were found

### Traditional Search Foundation

In ([slide 9](/slides/9)), Greenhalgh outlined the foundational approach to the search step. The team did not rely primarily on AI; instead, they used established systematic review methodology. Greenhalgh searched academic databases using prepared search strings, tracked citations through tools like Google Scholar, and consulted subject matter experts—a comprehensive approach she noted was familiar from her experience teaching research methods.

### Three Distinct Literature Sets

[Slide 10](/slides/10) details the outcome: three stratified literature sets. Set A comprised **background science reviews**—narrative reviews published in high-impact journals including *Nature*, *Science*, and *Annual Review* publications. Set B yielded 66 previous systematic reviews on mask efficacy, though Greenhalgh noted these were evenly split in conclusions, limiting their utility. Set C captured primary empirical studies, which the team pursued until complete saturation.

### Hypothesis Space Saturation Strategy

For Set A, Greenhalgh pursued a deliberate strategy: continuing searches until no new hypotheses or explanatory frameworks emerged. This **hypothesis space saturation** ensured comprehensive theoretical coverage rather than simple quantitative completeness. When higher-quality reviews appeared, the team removed lower-quality ones, prioritizing depth over breadth. For Sets B and C, Greenhalgh expressed confidence that the team had identified all available literature within their scope, reflecting exhaustive rather than selective searching.

### Judicious AI Application

Greenhalgh used AI sparingly in Step 1, deploying it after establishing her search strategy rather than as the primary search engine. She prompted AI to identify papers superior to her initial finds and to surface contradictory evidence, treating it as a **validation and extension tool** rather than the core discovery mechanism. This measured approach reflected her domain expertise and confidence in traditional search methodology.`
  },
  {
    sectionTitle: "Step 2: Explain & Clarify",
    slideRange: "11-14",
    narrative: `**Key points:**

- The explain-and-clarify phase synthesizes findings into a draft interpretation refined iteratively
- Greenhalgh produced three outputs: a narrative account, a temporal causal map, and a threats-to-validity list
- AI tools enable iterative refinement through REVISE, CHALLENGE, and BRAINSTORM interactions
- The 3,000-word essay integrates disease contagiousness, particle physics, mask material science, disease pathophysiology, and epidemiological mathematics
- The temporal causal map structures causality around intervention (green), antecedent conditions (brown), and outcomes (blue)

### Draft Explanation Through Synthesis

[Slide 11](/slides/11) presents the explain-and-clarify step as the next phase following the systematic search. Greenhalgh explained that hermeneutic review requires drafting a preliminary interpretation, which is then refined as deeper analysis of key papers proceeds. Rather than viewing this as a final product, she treated it as a foundation for iterative improvement, eventually generating three distinct outputs to capture different dimensions of understanding.

The first output was a **narrative account**—a 3,000-word essay synthesizing the set of 30 papers identified in the search phase. This essay drew on background reviews to trace causal pathways linking mask use to respiratory disease transmission outcomes. The second output was a **temporal causal map**, a diagram resembling a directed acyclic graph but incorporating embedded mechanisms. The third was a comprehensive threats-to-validity inventory cataloguing potential biases, confounders, and other validity threats.

### Iterative Refinement with AI

[Slide 12](/slides/12) illustrates how AI augments this phase. Rather than accepting her initial summary as complete, Greenhalgh uploaded the papers and requested three types of interaction: **REVISE** (improve the summary), **CHALLENGE** (identify gaps and logical flaws, and locate papers supporting alternative perspectives), and **BRAINSTORM** (explore how specific biases would affect study results and shift estimates toward or away from the null). This back-and-forth dialogue with **ChatGPT** allowed her to systematically stress-test her emerging understanding.

### Key Content Elements

[Slide 13](/slides/13) details the essay's substantive scope. Understanding mask effectiveness requires integrating disease contagiousness (measles versus less transmissible pathogens), **droplet ballistics** (particle spread distance and velocity during coughing or sneezing), **material science** of mask composition, pathophysiology governing infection outcomes, and **epidemiological mathematics** explaining epidemic growth, plateau, and decline. Each element shapes the causal question differently.

### Temporal Causal Structure

[Slide 14](/slides/14) presents the temporal causal map, where green marks the **intervention** (mask wearing by infected or exposed individuals), brown denotes antecedent conditions preceding mask adoption, and blue represents downstream effects. Greenhalgh emphasized that **temporality** is fundamental to causality—causes must precede effects. This visual structure extracted and organized the complex mechanistic pathways essential to understanding mask-transmission relationships.`
  },
  {
    sectionTitle: "Step 3: Develop Tools",
    slideRange: "15-25",
    narrative: `**Key points:**

- Step 3 develops **bespoke appraisal tools** tailored to mask efficacy research, rejecting generic off-the-shelf risk-of-bias checklists
- AI assists by **organizing threats to validity** by causal direction (toward/away from null) and removing epidemiological jargon
- Greenhalgh produced three complementary tools: a **mechanisms-of-bias table**, **target study designs**, and **quality assessment templates**
- Tools are design-specific (RCTs, cohort, case-control, cross-sectional, outbreak investigations) recognizing that study design requirements vary
- The mechanisms-of-bias table visualizes how different biases influence findings across study designs

### Rejecting Generic Tools

In [slide 15](/slides/15), Greenhalgh shifted focus to tool development, emphasizing that most narrative reviews forgo appraisal tools entirely. She rejected generic **risk-of-bias checklists** and the GRADE framework, arguing that supposedly topic-agnostic tools fail to address mask-specific epidemiological questions. Instead, she constructed three bespoke tools grounded in her focal causal relationship diagram, explanatory account, and identified threats to validity.

### AI-Assisted Tool Generation

On [slide 16](/slides/16), Greenhalgh described how AI streamlines tool development through two key functions: **ORGANISE** tasks sort threats to validity by whether they bias results toward or away from the null hypothesis—a classification that varies by study design—and **TRANSLATE** tasks remove specialized epidemiological jargon, making content accessible to reviewers without advanced statistical expertise. This human-AI collaboration proved decisive; when the AI-generated mechanisms-of-bias table emerged, Greenhalgh printed it and taped it to her wall, recognizing she had finally grasped the theoretical landscape.

### Mechanisms-of-Bias Table

The first appraisal tool, shown in [slides 17–18](/slides/17), presents bias effects systematically by study design (RCTs, case-control, cohort, cross-sectional). Columns stratify biases acting toward the null, away from the null, or bidirectionally, with a final column indicating the typical net effect. This tabular format, generated initially by AI and requiring human verification, offers superior clarity compared to unstructured checklists.

### Target Study Designs and Quality Templates

[Slides 19–21](/slides/19) introduce **target study designs**, which specify what excellence looks like for each design type. Greenhalgh illustrated why this matters: a generic RCT template mandates participant blinding, yet mask studies cannot blind participants to wearing masks. Target designs reframe standards contextually. [Slides 22–25](/slides/22) present three **quality assessment templates** (for RCTs, cohort studies, case-control studies) plus a specialized checklist for **outbreak investigations**—pandemic-era studies examining clusters following events like cruise ship outbreaks. Each template extracts qualitative features and quantitative data necessary to judge trustworthiness and study contribution.`
  },
  {
    sectionTitle: "Step 4: Appraise",
    slideRange: "26-30",
    narrative: `**Key points:**

- Greenhalgh emphasizes individual, careful study appraisal rather than bulk AI processing—studies must be reviewed one by one
- A custom GPT combines background science and bespoke tools to identify study designs, match appropriate appraisal templates, and assess biases
- The AI generates structured appraisal outputs including plain language summaries to aid interpretation
- **Quantitative bias analysis** addresses limitations in observational studies through sensitivity analyses and missing data adjustments
- Human verification is critical at every stage; Greenhalgh reviews all AI-generated appraisals to ensure accuracy

### Building a Custom GPT for Study Appraisal

[Slide 26](/slides/26) and [slide 27](/slides/27) outline the appraisal phase of the MINS method. Rather than uploading hundreds of studies for automated processing, Greenhalgh described a methodical approach using a custom **generative pre-trained transformer (GPT)**. She built this tool by combining all the background science and bespoke appraisal criteria discussed earlier, then taught the GPT how to apply them consistently. The process proved surprisingly accessible—the system responds to conversational prompts, allowing iterative refinement of instructions.

### Automated Study Classification and Template Matching

When a study is uploaded to the custom GPT, [slide 28](/slides/28) shows the comprehensive instructions Greenhalgh developed to guide the analysis. The AI first determines the study design, then automatically routes it to the appropriate **appraisal template** tailored to that design. [Slide 29](/slides/29) demonstrates this in action through a completed appraisal of a household transmission study. The output is cleanly formatted with all key data points extracted—adherence rates, exposure windows, and confounding factors. Notably, Greenhalgh asked the AI to generate a plain language summary, a practical addition that makes findings intelligible even to readers without epidemiological expertise.

### Handling Bias in Observational Studies

A critical advantage of AI-assisted appraisal emerges when addressing observational studies, which carry inherent biases and confounders unlike randomized trials. [Slide 30](/slides/30) displays examples of **quantitative bias analysis**, where the GPT performs sensitivity analyses to quantify how missing data or unmeasured confounding might affect conclusions. For instance, it can calculate that if 10% of data is missing, the effect size might vary within a specified range—allowing Greenhalgh to determine whether a significant finding remains robust despite these limitations. This mathematical transparency strengthens evidence synthesis by acknowledging rather than ignoring uncertainty.

### Verification and Quality Control

Throughout, Greenhalgh stressed that human oversight is non-negotiable. Every AI-generated appraisal is reviewed and verified before acceptance. This hybrid approach—leveraging AI efficiency while maintaining critical judgment—ensures both speed and reliability in processing large numbers of studies for systematic synthesis.`
  },
  {
    sectionTitle: "Step 5: Synthesise",
    slideRange: "31-34",
    narrative: `**Key points:**

- The **synthesis** step involves arranging similar studies into **cognate groups** for thematic analysis
- Studies are **prioritized by quality and relevance** rather than processed indiscriminately
- Seven cognate groups were identified: household, mass gathering, community, workplace, healthcare, and others
- **Cognate grouping** enables comparison of evidence within similar study contexts

### Arranging Studies into Cognate Groups

Greenhalgh explained that Step 5, **synthesis**, requires organizing identified studies into meaningful categories based on shared characteristics. Rather than treating all studies equally, researchers group cognate studies—those examining similar phenomena in comparable settings—to facilitate systematic comparison. This approach mirrors the logic of traditional systematic reviews but operates more flexibly within the MINS framework. [Slide 32](/slides/32) shows how synthesis prioritizes studies by quality and relevance, ensuring that higher-grade evidence shapes conclusions more heavily than weaker studies.

### Cognate Grouping in Practice

The practical application of cognate grouping in the face mask research resulted in seven distinct groups reflecting transmission settings: household contacts, mass gatherings and pilgrimages, community spread, workplace clusters, healthcare settings, and others. [Slide 33](/slides/33) visualizes these groupings, demonstrating how contextual factors—population density, ventilation, behavior patterns—determine which studies inform which evidence syntheses. Studies of transmission in crowded indoor spaces, for instance, group separately from household contact studies, allowing nuanced conclusions tailored to specific epidemiological contexts.

### Integration within the MINS Framework

Synthesis represents the fifth and culminating step in the five-step MINS method shown on [slide 31](/slides/31). The full methodological sequence—problem formulation, systematic searching, critical appraisal, synthesis, and application—creates a coherent pipeline where each stage builds on prior work. [Slide 34](/slides/34) presents the complete MINS diagram, illustrating how synthesis feeds into actionable guidance. Greenhalgh noted an example where both human reviewers initially missed critical methodological bias in a study but the AI tool detected it—underscoring that synthesis demands rigorous, systematic evaluation of study quality before findings are integrated into broader conclusions.`
  },
  {
    sectionTitle: "Evaluation & Questions",
    slideRange: "35-40",
    narrative: `**Key points:**

- ChatGPT performed well at synthesizing complex evidence and producing literature summaries, but missed context-dependent nuances and hallucinated details in isolated cases
- The tool requires domain expertise to verify outputs; it failed to spot clinically obvious errors without explicit guidance
- **Narrative reviewing** with AI differs fundamentally from **PRISMA-compliant systematic reviews**, using conversational prompt engineering to explore mechanisms
- Large language models excel at hypothesis-generating work across disciplines, not just speed improvement
- Research ethics, reproducibility versus validity, and epistemic justice in AI-mediated evidence synthesis remain open questions

### Evaluation of ChatGPT's Performance

[Slide 35](/slides/35) summarized ChatGPT's strengths: it synthesized evidence effectively and generated high-quality literature summaries. However, [slide 36](/slides/36) revealed significant weaknesses. Greenhalgh documented specific failures, including a case where the AI missed a clinically critical finding—a patient with SARS whose virus was present only in stool, making respiratory masks medically irrelevant. The tool also hallucinated entirely different papers, confabulated data, and over-applied rules rigidly without clinical judgment. When tested on a low-income country study with implausibly perfect data (100% participation, zero missing values), ChatGPT initially rated it favourably until prompted to reconsider. Despite these flaws, Greenhalgh was "amazed" at the relatively low hallucination rate across approximately 100 studies reviewed.

### Two Approaches to AI-Assisted Evidence Synthesis

[Slide 37](/slides/37) distinguished between **PRISMA-compliant systematic reviewers**—targeting two-week turnarounds through structured automation—and **narrative reviewing**, where Greenhalgh applied what she termed **sophisticated prompt engineering**. Rather than speed alone, this conversational approach leverages large language models for **hypothesis generation** across unfamiliar disciplines, identifying mechanisms and directions of bias in non-RCT evidence. The technique proved qualitatively transformative: Greenhalgh trained AI systems to extract data and design appraisal checklists for mathematical modelling studies she could not personally evaluate, yet the modelling expert affirmed results surpassed his own prior work.

### Open Questions and Future Directions

[Slide 38](/slides/38) posed four critical research questions: **replicability** (would another team produce equivalent results?), **transferability** across topics, **safety in naive hands** (PRISMA tools themselves are already misused), and **comparative performance** against other LLMs like Claude. Greenhalgh expressed enthusiasm for next-generation models to elevate performance.

### Q&A Highlights

The discussion surfaced tensions central to evidence synthesis. Badran Elshenawy advocated **Claude skills and agents** for reproducible workflows, arguing consistent instruction sets prevent hallucinations better than manual verification. Greenhalgh countered that **validity matters more than reproducibility**—a valid answer done once beats a reproducible wrong answer. Alasdair Churchard raised concerns about whether deep paper reading remains necessary, prompting Greenhalgh to clarify she read all mask papers but could not have evaluated mathematical modelling studies without AI assistance; checking outputs requires disciplinary expertise. Questions about **epistemic justice** and stereotype bias in training data resonated—Greenhalgh acknowledged the risk theoretically but found no concrete examples in her work. Further questions about uploading paywalled articles and unpublished data highlighted unresolved copyright and research ethics ambiguities. Greenhalgh noted her journal submission explicitly departed from AI guidance for PRISMA reviews, proposing to co-develop guidance specific to narrative AI-assisted synthesis.

[Slide 40](/slides/40) concluded with Greenhalgh's key finding: masks work if worn—a practical, evidence-backed message grounding months of methodological innovation.`
  },
];
