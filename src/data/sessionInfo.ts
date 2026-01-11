// Template for session information
// Copy this file to sessionInfo.ts and fill in your details

export const sessionInfo = {
  // Main presentation title
  title: "{{TITLE}}",
  // Subtitle or tagline
  subtitle: "{{SUBTITLE}}",

  speaker: {
    name: "{{SPEAKER_NAME}}",
    affiliation: "{{AFFILIATION}}",
    email: "{{EMAIL}}",
    links: {
      website: "{{WEBSITE_URL}}",
    },
    bio: `{{SPEAKER_BIO}}`,
  },

  event: {
    name: "{{EVENT_NAME}}",
    date: "{{EVENT_DATE}}", // e.g., "Friday, 9 January 2026"
    time: "{{EVENT_TIME}}", // e.g., "14:00 - 15:15"
    location: "{{LOCATION}}",
    type: "{{SESSION_TYPE}}", // e.g., "Workshop", "Talk", "Seminar"
    sessionLink: "{{SESSION_URL}}", // Link to conference program page
  },

  // Multi-paragraph abstract (use \n\n for paragraph breaks)
  abstract: `{{ABSTRACT}}`,

  // Example apps or resources to showcase (optional, can be empty array)
  exampleApps: [
    // {
    //   name: "Example App",
    //   url: "https://example.com",
    //   description: "Brief description of the app",
    // },
  ],
};
