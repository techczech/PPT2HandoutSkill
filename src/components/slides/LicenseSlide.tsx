import type { FlatSlide } from '../../data/types';

interface LicenseSlideProps {
  slide: FlatSlide;
}

export default function LicenseSlide({ slide }: LicenseSlideProps) {
  // Parse the title to extract license info
  // The title contains: "This presentation is licensed under Creative Commons By Attribution license..."
  const titleText = slide.title;

  // Split into main license text and additional notes
  const parts = titleText.split(/\u000b+/).filter(Boolean); // Split on vertical tabs
  const mainText = parts[0] || titleText;
  const additionalNotes = parts.slice(1);

  return (
    <div
      className="h-full flex flex-col items-center justify-center p-8 md:p-12 lg:p-16"
      style={{ background: 'var(--color-card)' }}
    >
      <div className="max-w-3xl text-center">
        {/* CC BY License Icon */}
        <div className="flex justify-center mb-8">
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity"
          >
            <img
              src="https://licensebuttons.net/l/by/4.0/88x31.png"
              alt="Creative Commons Attribution 4.0 International License"
              className="h-10 md:h-12"
            />
          </a>
        </div>

        {/* Main license text */}
        <p
          className="text-lg md:text-xl lg:text-2xl leading-relaxed mb-6"
          style={{ color: 'var(--color-primary)' }}
        >
          {mainText}
        </p>

        {/* Additional notes in smaller text */}
        {additionalNotes.map((note, index) => (
          <p
            key={index}
            className="text-base md:text-lg text-gray-600 leading-relaxed mt-4"
          >
            {note}
          </p>
        ))}

        {/* License link */}
        <p className="mt-8 text-sm text-gray-500">
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            style={{ color: 'var(--color-primary)' }}
          >
            View full license terms
          </a>
        </p>
      </div>
    </div>
  );
}
