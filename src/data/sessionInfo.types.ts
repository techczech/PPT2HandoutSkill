export interface FeaturedLink {
  name: string;
  url: string;
  description?: string;
}

export interface SessionInfo {
  title: string;
  subtitle: string;
  talkPageUrl: string;
  talkPageLabel: string;
  speaker: {
    name: string;
    affiliation: string;
    email: string;
    links: { website: string };
    bio: string;
  };
  event: {
    name: string;
    date: string;
    time: string;
    location: string;
    type: string;
    sessionLink: string;
  };
  abstract: string;
  keyTopics: string[];
  featuredLinks: {
    title: string;
    items: FeaturedLink[];
  };
}
