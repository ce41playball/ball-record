import React from 'react';
import { BasesState } from '../types/baseball';

interface BaseballDiamondProps {
  bases: BasesState;
  onToggleBase?: (base: keyof BasesState) => void;
  size?: 'sm' | 'md';
}

export const BaseballDiamond: React.FC<BaseballDiamondProps> = ({
  bases,
  onToggleBase,
  size = 'md',
}) => {
  const isInteractive = Boolean(onToggleBase);
  const dim = size === 'sm' ? 'w-28 h-24' : 'w-36 h-32';

  const baseButtonClass = (occupied: boolean) =>
    `transition-colors duration-150 ${
      isInteractive ? 'cursor-pointer' : 'cursor-default'
    } ${
      occupied
        ? 'fill-amber-500 stroke-amber-700'
        : 'fill-white stroke-slate-400 hover:stroke-slate-700'
    }`;

  return (
    <div className="flex flex-col items-center select-none">
      <div className={`relative ${dim} flex items-center justify-center`}>
        <svg
          viewBox="0 0 120 110"
          className="w-full h-full overflow-visible"
          role="group"
          aria-label="壘包狀態圖"
        >
          {/* Infield diamond path */}
          <polygon
            points="60,16 102,56 60,96 18,56"
            className="fill-emerald-50/80 stroke-emerald-700/35"
            strokeWidth="2"
          />

          {/* Second Base (Top) */}
          <g
            onClick={() => onToggleBase?.('second')}
            role={isInteractive ? 'button' : undefined}
            tabIndex={isInteractive ? 0 : undefined}
            aria-label={`二壘${bases.second ? '有人' : '無人'}`}
            onKeyDown={(e) => {
              if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onToggleBase?.('second');
              }
            }}
            className="focus:outline-none"
          >
            <rect x="40" y="0" width="40" height="34" fill="transparent" />
            <polygon
              points="60,6 71,17 60,28 49,17"
              strokeWidth="2"
              className={baseButtonClass(bases.second)}
            />
            <text
              x="60"
              y="40"
              textAnchor="middle"
              className={`text-[9px] font-semibold ${
                bases.second ? 'fill-amber-700' : 'fill-slate-500'
              }`}
            >
              二壘
            </text>
          </g>

          {/* Third Base (Left) */}
          <g
            onClick={() => onToggleBase?.('third')}
            role={isInteractive ? 'button' : undefined}
            tabIndex={isInteractive ? 0 : undefined}
            aria-label={`三壘${bases.third ? '有人' : '無人'}`}
            onKeyDown={(e) => {
              if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onToggleBase?.('third');
              }
            }}
            className="focus:outline-none"
          >
            <rect x="0" y="36" width="40" height="40" fill="transparent" />
            <polygon
              points="18,45 29,56 18,67 7,56"
              strokeWidth="2"
              className={baseButtonClass(bases.third)}
            />
            <text
              x="18"
              y="81"
              textAnchor="middle"
              className={`text-[9px] font-semibold ${
                bases.third ? 'fill-amber-700' : 'fill-slate-500'
              }`}
            >
              三壘
            </text>
          </g>

          {/* First Base (Right) */}
          <g
            onClick={() => onToggleBase?.('first')}
            role={isInteractive ? 'button' : undefined}
            tabIndex={isInteractive ? 0 : undefined}
            aria-label={`一壘${bases.first ? '有人' : '無人'}`}
            onKeyDown={(e) => {
              if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onToggleBase?.('first');
              }
            }}
            className="focus:outline-none"
          >
            <rect x="80" y="36" width="40" height="40" fill="transparent" />
            <polygon
              points="102,45 113,56 102,67 91,56"
              strokeWidth="2"
              className={baseButtonClass(bases.first)}
            />
            <text
              x="102"
              y="81"
              textAnchor="middle"
              className={`text-[9px] font-semibold ${
                bases.first ? 'fill-amber-700' : 'fill-slate-500'
              }`}
            >
              一壘
            </text>
          </g>

          {/* Home Plate (Bottom) */}
          <polygon
            points="54,92 66,92 66,99 60,104 54,99"
            className="fill-slate-200 stroke-slate-500"
            strokeWidth="1.5"
          />
        </svg>
      </div>
    </div>
  );
};
