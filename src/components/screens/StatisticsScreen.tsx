import { useState, useMemo } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useTranslation } from '../../hooks/useTranslation';
import { GlobalStats } from '../statistics/GlobalStats';
import { HeatmapCanvas } from '../statistics/HeatmapCanvas';
import { RatioCurve } from '../statistics/RatioCurve';
import { AngleCurve } from '../statistics/AngleCurve';
import { AngleDeltaCurve } from '../statistics/AngleDeltaCurve';
import { PositionByRotation } from '../statistics/PositionByRotation';
import { TimelineEvolution } from '../statistics/TimelineEvolution';
import {
  calculateStats,
  generateHeatmapData,
  generateRatioCurve,
  generateAngleCurve,
  generateAngleDeltaCurve,
} from '../../utils/statistics';

interface StatisticsScreenProps {
  onBack: () => void;
}

type Tab = 'global' | 'heatmap' | 'ratio' | 'angle' | 'rotation' | 'pos-rotation' | 'timeline';

export function StatisticsScreen({ onBack }: StatisticsScreenProps) {
  const { history } = useSettings();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('global');

  const stats = useMemo(() => calculateStats(history), [history]);
  const heatmapData = useMemo(() => generateHeatmapData(history), [history]);
  const ratioCurve = useMemo(() => generateRatioCurve(history), [history]);
  const angleCurve = useMemo(() => generateAngleCurve(history), [history]);
  const angleDeltaCurve = useMemo(() => generateAngleDeltaCurve(history), [history]);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'global', label: t.summary },
    { id: 'heatmap', label: t.positions },
    { id: 'ratio', label: t.ratios },
    { id: 'angle', label: t.angles },
    { id: 'rotation', label: t.rotation },
    { id: 'pos-rotation', label: t.posRot },
    { id: 'timeline', label: t.evolution },
  ];

  return (
    <div className="screen">
      <div className="screen-header">
        <button className="btn btn-secondary btn-back" onClick={onBack}>
          {t.back}
        </button>
        <h1 className="screen-title">{t.statisticsTitle}</h1>
      </div>

      <div className="screen-content">
        {history.length === 0 ? (
          <div className="empty-state">
            <h2 className="empty-state-title">{t.noDataYet}</h2>
            <p>{t.completeExercises}</p>
          </div>
        ) : (
          <>
            <div className="stats-tabs">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`stats-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="stats-content">
              {activeTab === 'global' && <GlobalStats stats={stats} />}
              {activeTab === 'heatmap' && <HeatmapCanvas data={heatmapData} />}
              {activeTab === 'ratio' && <RatioCurve data={ratioCurve} />}
              {activeTab === 'angle' && <AngleCurve data={angleCurve} />}
              {activeTab === 'rotation' && <AngleDeltaCurve data={angleDeltaCurve} />}
              {activeTab === 'pos-rotation' && <PositionByRotation history={history} />}
              {activeTab === 'timeline' && <TimelineEvolution history={history} />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
