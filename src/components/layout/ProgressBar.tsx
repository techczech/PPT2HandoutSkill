import { useNavigation } from '../../hooks/useNavigation';

export default function ProgressBar() {
  const { currentIndex, totalSlides } = useNavigation();
  const progress = ((currentIndex + 1) / totalSlides) * 100;

  return (
    <div className="progress-bar">
      <div
        className="progress-bar-fill"
        style={{ width: `${progress}%` }}
        role="progressbar"
        aria-valuenow={currentIndex + 1}
        aria-valuemin={1}
        aria-valuemax={totalSlides}
      />
    </div>
  );
}
