import { useState, useCallback, useEffect, useRef } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useGameTimer } from '../../hooks/useGameTimer';
import { GameCanvas } from '../game/GameCanvas';
import { ProgressBar } from '../game/ProgressBar';
import { Point, Exercise, GamePhase } from '../../types';
import { randomPoint, isWithinBounds, calculateThirdPoint, distance } from '../../utils/geometry';
import {
  samplePositionWithExploration,
  sampleRatioWithExploration,
  sampleAngleWithExploration,
  calculateTemperature,
  getRecentScores,
} from '../../utils/sampling';
import { calculateScore, getScoreColor, getScoreFeedback } from '../../utils/scoring';
import { getExplorationProgress } from '../../utils/storage';

interface GameScreenProps {
  onBack: () => void;
}

interface ExerciseState {
  modelBlue: Point;
  modelRed: Point;
  modelGreen: Point;
  darkBlue: Point;
  darkRed: Point;
  idealGreen: Point;
  ratio: number;
  angle: number;
  angleDelta: number;
  positionBucketX: number;
  positionBucketY: number;
  ratioBucket: number;
  angleBucket: number;
}

export function GameScreen({ onBack }: GameScreenProps) {
  const {
    settings,
    gradients,
    history,
    exploration,
    addExercise,
    updateGradientsFromExercise,
    markExplorationTested,
  } = useSettings();

  const [phase, setPhase] = useState<GamePhase>('placement');
  const [exercise, setExercise] = useState<ExerciseState | null>(null);
  const [userGreen, setUserGreen] = useState<Point | null>(null);
  const [lastScore, setLastScore] = useState<{ score: number; feedback: string } | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const exerciseCount = useRef(0);

  // Get exploration progress
  const explorationProgress = getExplorationProgress(exploration);

  // Validate user's answer
  const validateExercise = useCallback(
    (finalPoint: Point) => {
      if (!exercise) return;

      stopTimer();

      const { score, distance: dist } = calculateScore(
        finalPoint,
        exercise.idealGreen,
        exercise.darkBlue,
        exercise.darkRed
      );

      const feedback = getScoreFeedback(score);
      setLastScore({ score, feedback });
      setPhase('feedback');

      // Save exercise to history
      const exerciseRecord: Exercise = {
        id: `${Date.now()}-${exerciseCount.current++}`,
        timestamp: Date.now(),
        modelBlue: exercise.modelBlue,
        modelRed: exercise.modelRed,
        modelGreen: exercise.modelGreen,
        darkBlue: exercise.darkBlue,
        darkRed: exercise.darkRed,
        idealGreen: exercise.idealGreen,
        userGreen: finalPoint,
        positionBucketX: exercise.positionBucketX,
        positionBucketY: exercise.positionBucketY,
        ratioBucket: exercise.ratioBucket,
        angleBucket: exercise.angleBucket,
        ratio: exercise.ratio,
        angle: exercise.angle,
        angleDelta: exercise.angleDelta,
        score,
        distance: dist,
      };

      addExercise(exerciseRecord);
      updateGradientsFromExercise(exerciseRecord, canvasSize.width, canvasSize.height);

      // Mark exploration as tested
      markExplorationTested(
        exercise.positionBucketX,
        exercise.positionBucketY,
        exercise.ratioBucket,
        exercise.angleBucket
      );
    },
    [exercise, addExercise, updateGradientsFromExercise, markExplorationTested, canvasSize]
  );

  // Timer callback - only called if timer is enabled
  const handleTimerComplete = useCallback(() => {
    if (phase === 'placement' && exercise) {
      const finalPoint = userGreen || { x: canvasSize.width / 2, y: canvasSize.height / 2 };
      validateExercise(finalPoint);
    }
  }, [phase, exercise, userGreen, canvasSize, validateExercise]);

  const {
    progress,
    start: startTimer,
    stop: stopTimer,
  } = useGameTimer({
    duration: settings.exerciseDuration,
    onComplete: handleTimerComplete,
  });

  // Generate a new exercise
  const generateExercise = useCallback(() => {
    if (canvasSize.width === 0 || canvasSize.height === 0) return;

    const margin = settings.marginPercent;
    const maxAngleDelta = settings.maxAngleDelta;
    const temperature = calculateTemperature(getRecentScores(history));

    // Try to generate valid exercise (all points within bounds)
    let attempts = 0;
    while (attempts < 100) {
      attempts++;

      // Sample with exploration priority
      const { ratio, bucket: ratioBucket } = sampleRatioWithExploration(
        gradients.f2,
        temperature,
        exploration
      );
      const { angle: sampledAngle, bucket: angleBucket } = sampleAngleWithExploration(
        gradients.f3,
        temperature,
        exploration
      );

      // Generate model triangle
      const modelBlue = randomPoint(canvasSize.width, canvasSize.height, margin);
      const modelDist = Math.min(canvasSize.width, canvasSize.height) * 0.15;
      const modelAngle = Math.random() * 2 * Math.PI;
      const modelRed: Point = {
        x: modelBlue.x + modelDist * Math.cos(modelAngle),
        y: modelBlue.y + modelDist * Math.sin(modelAngle),
      };

      // Model green at sampled ratio and angle from model blue-red
      const modelGreenAngle = modelAngle + sampledAngle;
      const modelGreenDist = modelDist * ratio;
      const modelGreen: Point = {
        x: modelBlue.x + modelGreenDist * Math.cos(modelGreenAngle),
        y: modelBlue.y + modelGreenDist * Math.sin(modelGreenAngle),
      };

      // Sample dark blue position with exploration
      const { point: darkBlue, bucketX: positionBucketX, bucketY: positionBucketY } =
        samplePositionWithExploration(
          gradients.f1,
          temperature,
          canvasSize.width,
          canvasSize.height,
          margin,
          exploration
        );

      const darkDist = distance(modelBlue, modelRed) * (0.8 + Math.random() * 0.4);

      // Apply angle delta constraint
      const angleDelta = (Math.random() * 2 - 1) * maxAngleDelta;
      const darkAngle = modelAngle + angleDelta;

      const darkRed: Point = {
        x: darkBlue.x + darkDist * Math.cos(darkAngle),
        y: darkBlue.y + darkDist * Math.sin(darkAngle),
      };

      // Calculate ideal green position
      const idealGreen = calculateThirdPoint(darkBlue, darkRed, modelBlue, modelRed, modelGreen);

      // Check all points are within bounds
      if (
        isWithinBounds(modelBlue, canvasSize.width, canvasSize.height, margin) &&
        isWithinBounds(modelRed, canvasSize.width, canvasSize.height, margin) &&
        isWithinBounds(modelGreen, canvasSize.width, canvasSize.height, margin) &&
        isWithinBounds(darkBlue, canvasSize.width, canvasSize.height, margin) &&
        isWithinBounds(darkRed, canvasSize.width, canvasSize.height, margin) &&
        isWithinBounds(idealGreen, canvasSize.width, canvasSize.height, margin)
      ) {
        setExercise({
          modelBlue,
          modelRed,
          modelGreen,
          darkBlue,
          darkRed,
          idealGreen,
          ratio,
          angle: sampledAngle,
          angleDelta,
          positionBucketX,
          positionBucketY,
          ratioBucket,
          angleBucket,
        });
        setUserGreen(null);
        setPhase('placement');
        setLastScore(null);

        if (settings.timerEnabled) {
          startTimer();
        }
        return;
      }
    }

    // Fallback
    console.warn('Could not generate valid exercise after 100 attempts');
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;
    const size = Math.min(canvasSize.width, canvasSize.height) * 0.2;

    setExercise({
      modelBlue: { x: centerX - size, y: centerY },
      modelRed: { x: centerX + size, y: centerY },
      modelGreen: { x: centerX, y: centerY - size },
      darkBlue: { x: centerX - size * 0.8, y: centerY + size },
      darkRed: { x: centerX + size * 0.8, y: centerY + size },
      idealGreen: { x: centerX, y: centerY + size - size * 0.8 },
      ratio: 1,
      angle: Math.PI / 2,
      angleDelta: 0,
      positionBucketX: 5,
      positionBucketY: 3,
      ratioBucket: 7,
      angleBucket: 6,
    });
    setUserGreen(null);
    setPhase('placement');
    setLastScore(null);

    if (settings.timerEnabled) {
      startTimer();
    }
  }, [canvasSize, settings, gradients, history, exploration, startTimer]);

  // Handle tap on canvas
  const handleTap = useCallback(
    (point: Point) => {
      if (phase === 'placement') {
        setUserGreen(point);
      }
    },
    [phase]
  );

  // Handle validation button click
  const handleValidate = useCallback(() => {
    if (userGreen && phase === 'placement') {
      validateExercise(userGreen);
    }
  }, [userGreen, phase, validateExercise]);

  // Handle next exercise button click
  const handleNext = useCallback(() => {
    generateExercise();
  }, [generateExercise]);

  // Track canvas size
  useEffect(() => {
    const updateSize = () => {
      const container = document.querySelector('.game-canvas-container');
      if (container) {
        const rect = container.getBoundingClientRect();
        setCanvasSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    const container = document.querySelector('.game-canvas-container');
    if (container) {
      resizeObserver.observe(container);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Generate first exercise when canvas is ready
  useEffect(() => {
    if (canvasSize.width > 0 && canvasSize.height > 0 && !exercise) {
      generateExercise();
    }
  }, [canvasSize, exercise, generateExercise]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, [stopTimer]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (phase === 'placement' && userGreen) {
          validateExercise(userGreen);
        } else if (phase === 'feedback') {
          generateExercise();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, userGreen, validateExercise, generateExercise]);

  return (
    <div className="screen game-screen">
      <div className="game-header">
        <button className="btn btn-secondary btn-back" onClick={onBack}>
          Retour
        </button>
        <div style={{ flex: 1 }} />
        {!exploration.explorationComplete && (
          <span className="exploration-indicator">
            Exploration: {Math.round(explorationProgress.total * 100)}%
          </span>
        )}
        <span style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', marginLeft: '12px' }}>
          {history.length} exercices
        </span>
      </div>

      {settings.timerEnabled && <ProgressBar progress={progress} />}

      <GameCanvas
        phase={phase}
        modelBlue={exercise?.modelBlue || null}
        modelRed={exercise?.modelRed || null}
        modelGreen={exercise?.modelGreen || null}
        darkBlue={exercise?.darkBlue || null}
        darkRed={exercise?.darkRed || null}
        idealGreen={exercise?.idealGreen || null}
        userGreen={userGreen}
        onTap={handleTap}
      />

      {phase === 'placement' && userGreen && (
        <div className="validate-button-container">
          <button className="btn btn-primary btn-validate" onClick={handleValidate}>
            Valider <span className="shortcut-hint">(Entrée)</span>
          </button>
        </div>
      )}

      {lastScore && phase === 'feedback' && (
        <div className="score-display">
          <div className="score-value" style={{ color: getScoreColor(lastScore.score) }}>
            {Math.round(lastScore.score)}
          </div>
          <div className="score-feedback">{lastScore.feedback}</div>
          <button className="btn btn-primary btn-next" onClick={handleNext}>
            Suivant <span className="shortcut-hint">(Entrée)</span>
          </button>
        </div>
      )}
    </div>
  );
}
