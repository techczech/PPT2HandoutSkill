// Session information configuration
// Fill in details relevant to your presentation
// Optional fields can be left empty ("") or arrays empty ([])

export const sessionInfo = {
  // Main presentation title
  title: "{{TITLE}}",
  // Subtitle or tagline
  subtitle: "{{SUBTITLE}}",

  // Link to the talk/presentation page (optional)
  talkPageUrl: "",
  talkPageLabel: "Talk Page", // e.g., "Talk Page", "Webinar Recording", "Session Info"

  speaker: {
    name: "{{SPEAKER_NAME}}",
    affiliation: "{{AFFILIATION}}",
    email: "{{EMAIL}}",
    links: {
      website: "{{WEBSITE_URL}}",
    },
    bio: `{{SPEAKER_BIO}}`,
  },

  // Event/conference details (optional - leave empty if standalone presentation)
  event: {
    name: "", // e.g., "AULC 2026" - leave empty if no conference
    date: "{{EVENT_DATE}}", // e.g., "Friday, 9 January 2026"
    time: "", // e.g., "14:00 - 15:15"
    location: "", // e.g., "Room 301"
    type: "{{SESSION_TYPE}}", // e.g., "Workshop", "Talk", "Seminar", "Webinar"
    sessionLink: "", // Link to conference program page (optional)
  },

  // Multi-paragraph abstract (use \n\n for paragraph breaks)
  abstract: `{{ABSTRACT}}`,

  // Key topics covered in the presentation (optional)
  // These will be displayed as highlights on the home page
  keyTopics: [
    // "Topic 1: Brief description",
    // "Topic 2: Brief description",
  ],

  // Featured links section (optional)
  // Use for related resources, example apps, tools, etc.
  featuredLinks: {
    title: "", // e.g., "Related Resources", "Example Apps", "Tools Mentioned"
    items: [
      // {
      //   name: "Resource Name",
      //   url: "https://example.com",
      //   description: "Brief description",
      // },
    ],
  },
};
