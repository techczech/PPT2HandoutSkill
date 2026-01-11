import { sessionInfo } from '../../data/sessionInfo';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
          <p className="font-medium text-white">{sessionInfo.speaker.name}</p>
          <p className="text-sm opacity-80">{sessionInfo.speaker.affiliation}</p>
        </div>
        <div className="flex gap-6 text-sm">
          <a
            href={sessionInfo.speaker.links.website}
            target="_blank"
            rel="noopener noreferrer"
          >
            Website
          </a>
          <a
            href={sessionInfo.event.sessionLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            AULC 2026
          </a>
          <a
            href={`mailto:${sessionInfo.speaker.email}`}
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
