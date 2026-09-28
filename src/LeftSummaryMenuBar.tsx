import React, { useState } from 'react';
import { FamilyNode } from './destaFamilyData';
import { TreeStats, getCleanName } from './familyUtils';
import { 
  LayoutDashboard, 
  Users, 
  GitFork, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft,
  FileDown,
  ArrowUpRight,
  Filter
} from 'lucide-react';

interface LeftSummaryMenuBarProps {
  stats: TreeStats;
  rootNode: FamilyNode;
  theme?: 'dark' | 'light';
  activeBranchIndex?: number | null;
  onSelectBranch?: (index: number | null) => void;
  onOpenFullDashboard?: () => void;
  filterUncertainOnly?: boolean;
  onToggleFilterUncertain?: () => void;
  onOpenPdfModal?: () => void;
}

const GEEZ_NUMS = ['፩', '፪', '፫', '፬', '፭', '፮', '፯'];

function countDescendants(node: FamilyNode): number {
  if (!node.children || node.children.length === 0) return 0;
  return node.children.reduce((acc, child) => acc + 1 + countDescendants(child), 0);
}

export const LeftSummaryMenuBar: React.FC<LeftSummaryMenuBarProps> = ({
  stats,
  rootNode,
  theme = 'light',
  activeBranchIndex = null,
  onSelectBranch,
  onOpenFullDashboard,
  filterUncertainOnly = false,
  onToggleFilterUncertain,
  onOpenPdfModal,
}) => {
  const isLight = theme === 'light';
  const [isCollapsed, setIsCollapsed] = useState(false);

  const branches = rootNode.children || [];

  const verifiedPercent = stats.totalMembers > 0 
    ? Math.round((stats.confirmedCount / stats.totalMembers) * 100) 
    : 100;

  // Collapsed slim sidebar view
  if (isCollapsed) {
    return (
      <aside 
        className={`w-12 shrink-0 border rounded-2xl flex flex-col items-center py-3 gap-3 transition-all self-stretch ${
          isLight ? 'bg-white border-slate-200 shadow-2xs' : 'bg-slate-900 border-slate-800'
        }`}
        title="Summary Menu Bar (Collapsed)"
      >
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className={`p-2 rounded-xl border transition-all duration-150 active:scale-95 ${
            isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
          }`}
          title="ማጠቃለያ ዘርጋ (Expand Summary Menu)"
        >
          <ChevronRight size={15} />
        </button>

        <div className="w-6 h-[1px] bg-slate-200 dark:bg-slate-800 my-1" />

        <div className="flex flex-col items-center gap-2 text-xs">
          <span className="p-1.5 rounded-lg text-sky-600 dark:text-sky-400" title={`ጠቅላላ አባላት: ${stats.totalMembers}`}>
            <Users size={16} />
          </span>
          <span className="text-[10px] font-mono font-bold">{stats.totalMembers}</span>
        </div>

        <div className="flex flex-col items-center gap-2 text-xs">
          <span className="p-1.5 rounded-lg text-amber-600 dark:text-amber-400" title={`ቅርንጫፎች: ${stats.directChildrenCount}`}>
            <GitFork size={16} />
          </span>
          <span className="text-[10px] font-mono font-bold">{stats.directChildrenCount}</span>
        </div>

        <div className="flex flex-col items-center gap-2 text-xs">
          <span className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400" title={`የተረጋገጡ: ${stats.confirmedCount}`}>
            <CheckCircle2 size={16} />
          </span>
          <span className="text-[10px] font-mono font-bold">{verifiedPercent}%</span>
        </div>

        <div className="mt-auto flex flex-col items-center gap-2">
          {onOpenPdfModal && (
            <button
              onClick={onOpenPdfModal}
              className={`p-2 rounded-xl border transition-all active:scale-95 ${
                isLight ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-950 border-white'
              }`}
              title="PDF አውርድ"
            >
              <FileDown size={14} />
            </button>
          )}

          {onOpenFullDashboard && (
            <button
              onClick={onOpenFullDashboard}
              className={`p-2 rounded-xl border transition-all active:scale-95 ${
                isLight ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-sky-950 text-sky-300 border-sky-800'
              }`}
              title="ሙሉ ዳሽቦርድ ክፈት"
            >
              <LayoutDashboard size={14} />
            </button>
          )}
        </div>
      </aside>
    );
  }

  // Expanded Left Menu Bar view
  return (
    <aside 
      className={`w-full lg:w-64 xl:w-72 shrink-0 border rounded-2xl p-3.5 flex flex-col gap-3.5 transition-all shadow-2xs self-stretch ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
      }`}
    >
      {/* Menu Bar Header */}
      <div className="flex items-center justify-between border-b pb-2.5 transition-colors">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
            <LayoutDashboard size={15} />
          </span>
          <div>
            <h3 className="text-xs font-black tracking-tight uppercase">
              Summary Dashboard
            </h3>
            <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              የቤተሰብ ማጠቃለያ ሜኑ
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed(true)}
          className={`p-1.5 rounded-lg border transition-all duration-150 active:scale-95 ${
            isLight ? 'hover:bg-slate-100 border-slate-200 text-slate-500' : 'hover:bg-slate-800 border-slate-700 text-slate-400'
          }`}
          title="ሜኑውን እጠፍ (Collapse Sidebar)"
        >
          <ChevronLeft size={14} />
        </button>
      </div>

      {/* 4 Summary Metric Cards (Vertical Grid) */}
      <div className="grid grid-cols-2 gap-2">
        {/* Total Members */}
        <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${
          isLight ? 'bg-slate-50/80 border-slate-200/80' : 'bg-slate-800/40 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>ጠቅላላ አባላት</span>
            <Users size={12} className="text-sky-500" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-black">{stats.totalMembers}</span>
            <span className="text-[10px] text-slate-400">አባላት</span>
          </div>
        </div>

        {/* Branches */}
        <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${
          isLight ? 'bg-slate-50/80 border-slate-200/80' : 'bg-slate-800/40 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>ቅርንጫፎች</span>
            <GitFork size={12} className="text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-black">{stats.directChildrenCount}</span>
            <span className="text-[10px] text-slate-400">የ፪ኛ ደረጃ</span>
          </div>
        </div>

        {/* Generations */}
        <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${
          isLight ? 'bg-slate-50/80 border-slate-200/80' : 'bg-slate-800/40 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>ትውልዶች</span>
            <Layers size={12} className="text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-black">{stats.maxGenerations}</span>
            <span className="text-[10px] font-mono text-slate-400">G1–G4</span>
          </div>
        </div>

        {/* Verified Rate */}
        <div className={`p-2.5 rounded-xl border flex flex-col justify-between ${
          isLight ? 'bg-emerald-50/50 border-emerald-200/60' : 'bg-emerald-950/20 border-emerald-900/40'
        }`}>
          <div className="flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-400">
            <span>የተረጋገጡ</span>
            <CheckCircle2 size={12} className="text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-black text-emerald-700 dark:text-emerald-300">
              {stats.confirmedCount}
            </span>
            <span className="text-[10px] font-semibold text-emerald-600/80">{verifiedPercent}%</span>
          </div>
        </div>
      </div>

      {/* Uncertainty Notice / Quick Toggle */}
      {stats.uncertainCount > 0 && (
        <button
          type="button"
          onClick={onToggleFilterUncertain}
          className={`px-3 py-2 rounded-xl border text-xs text-left flex items-center justify-between transition-all duration-150 active:scale-98 ${
            filterUncertainOnly 
              ? (isLight ? 'bg-amber-100 border-amber-300 text-amber-950 font-bold' : 'bg-amber-500/25 border-amber-500 text-white font-bold') 
              : (isLight ? 'bg-amber-50/60 hover:bg-amber-50 border-amber-200 text-amber-900' : 'bg-amber-950/20 hover:bg-amber-950/40 border-amber-900 text-amber-300')
          }`}
          title="የደበዘዙ ስሞችን አጣራ (Filter blurred names)"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <AlertCircle size={13} className="text-amber-600 shrink-0" />
            <span className="truncate">በከፊል የደበዘዙ ስሞች [?]</span>
          </div>
          <span className="font-mono font-bold text-xs shrink-0">
            {stats.uncertainCount}
          </span>
        </button>
      )}

      {/* 7 Branches Navigation Menu */}
      <div className="flex flex-col gap-1.5 flex-1 min-h-0">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 px-1">
          <span>፯ ቅርንጫፎች (7 Branches)</span>
          <span className="text-[10px] font-normal">ተወላጆች</span>
        </div>

        <div className="flex flex-col gap-1 overflow-y-auto max-h-56 pr-0.5">
          {branches.map((b, idx) => {
            const isActive = activeBranchIndex === idx;
            const bName = getCleanName(b.name);
            const totalDesc = countDescendants(b);
            const geez = GEEZ_NUMS[idx] || `${idx + 1}`;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectBranch && onSelectBranch(isActive ? null : idx)}
                className={`w-full px-2.5 py-1.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all duration-150 active:scale-[0.98] ${
                  isActive
                    ? isLight
                      ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-xs'
                      : 'bg-white text-slate-950 border-white font-bold shadow-xs'
                    : isLight
                      ? 'bg-slate-50/70 hover:bg-slate-100 border-slate-200/80 text-slate-700'
                      : 'bg-slate-800/40 hover:bg-slate-800 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`font-mono text-[11px] font-bold ${isActive ? 'opacity-80' : 'text-slate-400'}`}>
                    {geez}.
                  </span>
                  <span className="truncate font-medium">{bName}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span className={`text-[10px] font-mono ${isActive ? 'opacity-80' : 'text-slate-400'}`}>
                    {totalDesc + 1}
                  </span>
                  <ChevronRight size={11} className={isActive ? 'opacity-90' : 'opacity-40'} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="border-t pt-2.5 flex flex-col gap-1.5 mt-auto">
        {onOpenFullDashboard && (
          <button
            type="button"
            onClick={onOpenFullDashboard}
            className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all duration-150 active:scale-95 ${
              isLight 
                ? 'bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-800 shadow-2xs' 
                : 'bg-sky-950/40 hover:bg-sky-950/70 border-sky-800 text-sky-300'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <LayoutDashboard size={13} className="text-sky-600 dark:text-sky-400" />
              <span>ሙሉ ዳሽቦርድ ክፈት</span>
            </span>
            <ArrowUpRight size={13} />
          </button>
        )}

        {onOpenPdfModal && (
          <button
            type="button"
            onClick={onOpenPdfModal}
            className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-150 active:scale-95 ${
              isLight 
                ? 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900 shadow-2xs' 
                : 'bg-white hover:bg-slate-100 text-slate-950 border-white shadow-2xs'
            }`}
          >
            <FileDown size={13} className={isLight ? 'text-amber-400' : 'text-sky-600'} />
            <span>PDF ሪፖርት አውርድ</span>
          </button>
        )}
      </div>
    </aside>
  );
};
