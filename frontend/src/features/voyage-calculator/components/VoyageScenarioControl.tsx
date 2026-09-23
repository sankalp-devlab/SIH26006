/**
 * SIH 26006 Maritime Intelligence Platform
 * Module 11: Voyage Scenario Control Strip
 */

import React from 'react';
import { Sliders, Check } from 'lucide-react';
import type { VoyageScenario } from '../../../types/voyage-calculator';

interface VoyageScenarioControlProps {
  scenarios: VoyageScenario[];
  activeScenarioId: string;
  onSelectScenario: (scenarioId: string) => void;
}

export const VoyageScenarioControl: React.FC<VoyageScenarioControlProps> = ({
  scenarios,
  activeScenarioId,
  onSelectScenario,
}) => {
  return (
    <div className="voyage-scenario-strip">
      <div className="voyage-scenario-label">
        <Sliders size={14} style={{ color: 'var(--voyage-cyan)' }} />
        <span>Calculation Scenario</span>
      </div>

      <div className="voyage-scenario-group">
        {scenarios.map((sc) => {
          const isActive = activeScenarioId === sc.id;
          return (
            <button
              key={sc.id}
              type="button"
              onClick={() => onSelectScenario(sc.id)}
              className={`voyage-scenario-pill ${isActive ? 'active' : ''}`}
              title={sc.description}
            >
              {isActive && <Check size={13} style={{ color: 'var(--voyage-cyan)' }} />}
              <span>{sc.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
