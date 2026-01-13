import { sessionInfo } from '../../data/sessionInfo';

export default function Footer() {
  const hasWebsite = sessionInfo.speaker?.links?.website;
  const hasEvent = sessionInfo.event?.name && sessionInfo.event?.sessionLink;
  const hasEmail = sessionInfo.speaker?.email;

  return (
    <footer className="site-footer">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
          <p className="font-medium text-white">{sessionInfo.speaker?.name}</p>
          {sessionInfo.speaker?.affiliation && (
            <p className="text-sm opacity-80">{sessionInfo.speaker.affiliation}</p>
          )}
        </div>
        <div className="flex gap-6 text-sm">
          {hasWebsite && (
            <a
              href={sessionInfo.speaker.links.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              Website
            </a>
          )}
          {hasEvent && (
            <a
              href={sessionInfo.event.sessionLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              {sessionInfo.event.name}
            </a>
          )}
          {hasEmail && (
            <a
              href={`mailto:${sessionInfo.speaker.email}`}
            >
              Contact
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
