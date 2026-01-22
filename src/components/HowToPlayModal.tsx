import { useTranslation } from '../hooks/useTranslation';

interface HowToPlayModalProps {
  onClose: () => void;
}

// Model triangle coordinates (light colors)
// Blue -> Red -> Green forms a specific shape
const MODEL = {
  blue: { x: 50, y: 80 },
  red: { x: 130, y: 60 },
  green: { x: 110, y: 140 },
};

// Dark triangle: same shape as model, but scaled 1.2x and rotated 20 degrees
// Calculated to maintain exact proportions
const DARK = {
  blue: { x: 180, y: 90 },
  red: { x: 278, y: 100 },
  green: { x: 223, y: 182 },
};

// SVG illustration for Example 1 (the exercise - without answer)
function ExampleExercise() {
  return (
    <svg viewBox="0 0 300 200" className="how-to-play-illustration">
      {/* Model triangle (light colors) with connecting lines */}
      <line x1={MODEL.blue.x} y1={MODEL.blue.y} x2={MODEL.red.x} y2={MODEL.red.y} stroke="var(--color-clear-blue)" strokeWidth="2" />
      <line x1={MODEL.red.x} y1={MODEL.red.y} x2={MODEL.green.x} y2={MODEL.green.y} stroke="var(--color-clear-red)" strokeWidth="2" />
      <line x1={MODEL.green.x} y1={MODEL.green.y} x2={MODEL.blue.x} y2={MODEL.blue.y} stroke="var(--color-clear-green)" strokeWidth="2" />
      <circle cx={MODEL.blue.x} cy={MODEL.blue.y} r="8" fill="var(--color-clear-blue)" />
      <circle cx={MODEL.red.x} cy={MODEL.red.y} r="8" fill="var(--color-clear-red)" />
      <circle cx={MODEL.green.x} cy={MODEL.green.y} r="8" fill="var(--color-clear-green)" />

      {/* Dark triangle (incomplete - only blue and red with their connecting line) */}
      <line x1={DARK.blue.x} y1={DARK.blue.y} x2={DARK.red.x} y2={DARK.red.y} stroke="var(--color-dark-blue)" strokeWidth="2" />
      <circle cx={DARK.blue.x} cy={DARK.blue.y} r="8" fill="var(--color-dark-blue)" />
      <circle cx={DARK.red.x} cy={DARK.red.y} r="8" fill="var(--color-dark-red)" />

      {/* Question mark where green should be */}
      <text x={DARK.green.x} y={DARK.green.y + 6} fontSize="20" fill="var(--color-dark-green)" textAnchor="middle" fontWeight="bold">?</text>
    </svg>
  );
}

// SVG illustration for Example 2 (the solution - with correct green position)
function ExampleSolution() {
  return (
    <svg viewBox="0 0 300 200" className="how-to-play-illustration">
      {/* Model triangle (light colors) with connecting lines */}
      <line x1={MODEL.blue.x} y1={MODEL.blue.y} x2={MODEL.red.x} y2={MODEL.red.y} stroke="var(--color-clear-blue)" strokeWidth="2" />
      <line x1={MODEL.red.x} y1={MODEL.red.y} x2={MODEL.green.x} y2={MODEL.green.y} stroke="var(--color-clear-red)" strokeWidth="2" />
      <line x1={MODEL.green.x} y1={MODEL.green.y} x2={MODEL.blue.x} y2={MODEL.blue.y} stroke="var(--color-clear-green)" strokeWidth="2" />
      <circle cx={MODEL.blue.x} cy={MODEL.blue.y} r="8" fill="var(--color-clear-blue)" />
      <circle cx={MODEL.red.x} cy={MODEL.red.y} r="8" fill="var(--color-clear-red)" />
      <circle cx={MODEL.green.x} cy={MODEL.green.y} r="8" fill="var(--color-clear-green)" />

      {/* Dark triangle (complete with all lines and green point) */}
      <line x1={DARK.blue.x} y1={DARK.blue.y} x2={DARK.red.x} y2={DARK.red.y} stroke="var(--color-dark-blue)" strokeWidth="2" />
      <line x1={DARK.red.x} y1={DARK.red.y} x2={DARK.green.x} y2={DARK.green.y} stroke="var(--color-dark-red)" strokeWidth="2" />
      <line x1={DARK.green.x} y1={DARK.green.y} x2={DARK.blue.x} y2={DARK.blue.y} stroke="var(--color-dark-green)" strokeWidth="2" />
      <circle cx={DARK.blue.x} cy={DARK.blue.y} r="8" fill="var(--color-dark-blue)" />
      <circle cx={DARK.red.x} cy={DARK.red.y} r="8" fill="var(--color-dark-red)" />
      <circle cx={DARK.green.x} cy={DARK.green.y} r="8" fill="var(--color-dark-green)" />
    </svg>
  );
}

export function HowToPlayModal({ onClose }: HowToPlayModalProps) {
  const { t } = useTranslation();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content how-to-play-modal" onClick={e => e.stopPropagation()}>
        <h2 className="how-to-play-title">{t.howToPlay}</h2>

        <p className="how-to-play-intro">{t.howToPlayIntro}</p>

        <p className="how-to-play-rule">{t.howToPlayRule}</p>

        <div className="how-to-play-examples">
          <div className="how-to-play-example">
            <ExampleExercise />
            <p className="how-to-play-caption">{t.howToPlayExample1Caption}</p>
          </div>

          <div className="how-to-play-example">
            <ExampleSolution />
            <p className="how-to-play-caption">{t.howToPlayExample2Caption}</p>
          </div>
        </div>

        <p className="how-to-play-tip">{t.howToPlayTip}</p>

        <button className="btn btn-primary how-to-play-button" onClick={onClose}>
          {t.howToPlayGotIt}
        </button>
      </div>
    </div>
  );
}
