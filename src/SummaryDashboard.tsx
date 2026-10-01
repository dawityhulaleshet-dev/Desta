import React, { useMemo } from 'react';
import { FamilyNode } from './destaFamilyData';
import { FlattenedNode, TreeStats, getCleanName } from './familyUtils';
import { 
  Users, 
  GitFork, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ChevronRight,
  Edit3,
  Sparkles,
  Award,
  FileDown,
  Network
} from 'lucide-react';

interface SummaryDashboardProps {
  rootNode: FamilyNode;
  flattenedNodes: FlattenedNode[];
  stats: TreeStats;
  theme?: 'dark' | 'light';
  onSelectBranch: (branchIndex: number) => void;
  onNavigateTab: (tab: 'visual' | 'topdown' | 'tree' | 'branches') => void;
  onEditNode: (node: FlattenedNode) => void;
  onOpenPdfModal?: () => void;
}

const GEEZ_NUMS = ['፩', '፪', '፫', '፬', '፭', '፮', '፯'];

function countDescendants(node: FamilyNode): number {
  if (!node.children || node.children.length === 0) return 0;
  return node.children.reduce((acc, child) => acc + 1 + countDescendants(child), 0);
}

export const SummaryDashboard: React.FC<SummaryDashboardProps> = ({
  rootNode,
  flattenedNodes,
  stats,
  theme = 'dark',
  onSelectBranch,
  onNavigateTab,
  onEditNode,
  onOpenPdfModal,
}) => {
  const isLight = theme === 'light';

  // Generation counts
  const genCounts = useMemo(() => {
    const counts = { g1: 0, g2: 0, g3: 0, g4: 0 };
    flattenedNodes.forEach(node => {
      if (node.generation === 1) counts.g1++;
      else if (node.generation === 2) counts.g2++;
      else if (node.generation === 3) counts.g3++;
      else if (node.generation === 4) counts.g4++;
    });
    return counts;
  }, [flattenedNodes]);

  // Branch statistics
  const branchStats = useMemo(() => {
    const branches = rootNode.children || [];
    return branches.map((branch, idx) => {
      const descendants = countDescendants(branch);
      const total = descendants + 1; // including the G2 child
      const g3Count = branch.children ? branch.children.length : 0;
      let g4Count = 0;
      let uncertainCount = branch.name.includes('[?]') ? 1 : 0;

      if (branch.children) {
        branch.children.forEach(g3 => {
          if (g3.name.includes('[?]')) uncertainCount++;
          if (g3.children) {
            g4Count += g3.children.length;
            g3.children.forEach(g4 => {
              if (g4.name.includes('[?]')) uncertainCount++;
            });
          }
        });
      }

      return {
        index: idx,
        name: branch.name,
        cleanName: getCleanName(branch.name),
        total,
        descendants,
        g3Count,
        g4Count,
        uncertainCount,
        percentOfTotal: stats.totalMembers > 0 ? (total / (stats.totalMembers - 1)) * 100 : 0,
      };
    });
  }, [rootNode, stats.totalMembers]);

  // Largest branch
  const largestBranch = useMemo(() => {
    if (branchStats.length === 0) return null;
    return [...branchStats].sort((a, b) => b.total - a.total)[0];
  }, [branchStats]);

  // Uncertain members list
  const uncertainMembers = useMemo(() => {
    return flattenedNodes.filter(n => n.isUncertain);
  }, [flattenedNodes]);

  const verifiedPercent = stats.totalMembers > 0 
    ? Math.round((stats.confirmedCount / stats.totalMembers) * 100) 
    : 100;

  return (
    <div className="flex flex-col gap-4">
      {/* Dashboard Action Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className={`text-base font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            የቤተሰብ ዛፍ ማጠቃለያ (Summary Dashboard)
          </h2>
          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            {stats.totalMembers} አባላት · ፯ ቅርንጫፎች · {stats.maxGenerations} ትውልዶች
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('visual')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 active:scale-95 ${
              isLight
                ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900 shadow-2xs'
                : 'bg-amber-950/40 hover:bg-amber-900/50 border-amber-700/60 text-amber-200'
            }`}
          >
            <Sparkles size={13} className="text-amber-500" />
            <span>ሥዕላዊ ዛፍ (Artistic Tree)</span>
          </button>

          <button
            onClick={() => onNavigateTab('topdown')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 active:scale-95 ${
              isLight
                ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-2xs'
                : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
            }`}
          >
            <Network size={13} className="text-sky-500" />
            <span>ዛፍ ክፈት (View Tree)</span>
          </button>

          {onOpenPdfModal && (
            <button
              onClick={onOpenPdfModal}
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all duration-150 active:scale-95 shadow-2xs ${
                isLight
                  ? 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900'
                  : 'bg-white hover:bg-slate-100 text-slate-950 border-white'
              }`}
            >
              <FileDown size={14} className={isLight ? 'text-amber-400' : 'text-sky-600'} />
              <span>PDF አውርድ</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Total Members */}
        <div className={`p-4 rounded-xl border transition-colors ${
          isLight ? 'bg-white border-slate-200 shadow-2xs' : 'bg-slate-900/70 border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              ጠቅላላ አባላት
            </span>
            <span className={`p-1.5 rounded-lg ${isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-300'}`}>
              <Users size={14} />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {stats.totalMembers}
            </span>
            <span className={`text-xs ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
              ተመዝግበዋል
            </span>
          </div>
        </div>

        {/* KPI 2: Generations */}
        <div className={`p-4 rounded-xl border transition-colors ${
          isLight ? 'bg-white border-slate-200 shadow-2xs' : 'bg-slate-900/70 border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              የትውልድ ደረጃዎች
            </span>
            <span className={`p-1.5 rounded-lg ${isLight ? 'bg-amber-100 text-amber-800' : 'bg-amber-500/20 text-amber-300'}`}>
              <Layers size={14} />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {stats.maxGenerations}
            </span>
            <span className={`text-xs font-mono ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
              G1 – G4
            </span>
          </div>
        </div>

        {/* KPI 3: Branches */}
        <div className={`p-4 rounded-xl border transition-colors ${
          isLight ? 'bg-white border-slate-200 shadow-2xs' : 'bg-slate-900/70 border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              ቅርንጫፎች
            </span>
            <span className={`p-1.5 rounded-lg ${isLight ? 'bg-sky-100 text-sky-800' : 'bg-sky-500/20 text-sky-300'}`}>
              <GitFork size={14} />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {stats.directChildrenCount}
            </span>
            <span className={`text-xs ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
              የደስታ ልጆች
            </span>
          </div>
        </div>

        {/* KPI 4: Verified Accuracy */}
        <div className={`p-4 rounded-xl border transition-colors ${
          isLight ? 'bg-white border-slate-200 shadow-2xs' : 'bg-slate-900/70 border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              የተረጋገጡ ስሞች
            </span>
            <span className={`p-1.5 rounded-lg ${isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/20 text-emerald-300'}`}>
              <CheckCircle2 size={14} />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-black tracking-tight ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
              {verifiedPercent}%
            </span>
            <span className={`text-xs ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
              {stats.confirmedCount}/{stats.totalMembers}
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Section: Branch Breakdown & Generational Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (2 spans): Branch Breakdown */}
        <div className={`lg:col-span-2 p-5 rounded-xl border transition-colors flex flex-col gap-4 ${
          isLight ? 'bg-white border-slate-200 shadow-2xs' : 'bg-slate-900/70 border-slate-800'
        }`}>
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <h2 className={`text-sm font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                የ፯ቱ ቅርንጫፎች ስርጭት (Branches)
              </h2>
            </div>
            {largestBranch && (
              <span className={`text-xs px-2 py-0.5 rounded-md font-medium flex items-center gap-1 ${
                isLight ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              }`}>
                <Award size={11} />
                <span>ትልቁ፡ {largestBranch.cleanName} ({largestBranch.total})</span>
              </span>
            )}
          </div>

          {/* Minimal Branch List with Progress Bars */}
          <div className="flex flex-col gap-3">
            {branchStats.map((b) => (
              <div 
                key={b.index}
                className={`p-3 rounded-lg border transition-all flex flex-col gap-2 ${
                  isLight 
                    ? 'bg-slate-50/60 hover:bg-slate-50 border-slate-200' 
                    : 'bg-slate-800/40 hover:bg-slate-800/70 border-slate-750'
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`font-mono font-bold w-5 text-center ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                      {GEEZ_NUMS[b.index]}
                    </span>
                    <span className={`font-bold truncate text-[13px] ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {b.cleanName}
                    </span>
                    {b.uncertainCount > 0 && (
                      <span className={`text-[10px] px-1 rounded font-mono ${
                        isLight ? 'bg-amber-100 text-amber-800' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {b.uncertainCount} [?]
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {b.g3Count} G3 · {b.g4Count} G4
                    </span>
                    <span className={`font-bold font-mono text-xs min-w-[28px] text-right ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {b.total}
                    </span>
                    <button
                      onClick={() => {
                        onSelectBranch(b.index);
                        onNavigateTab('branches');
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border flex items-center gap-1 transition-all duration-150 active:scale-95 ${
                        isLight 
                          ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-950 shadow-2xs' 
                          : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300 hover:text-white'
                      }`}
                      title="ቅርንጫፉን አሳይ (View Branch)"
                    >
                      <span>ዝርዝር</span>
                      <ChevronRight size={11} />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className={`w-full h-1.5 rounded-full overflow-hidden ${
                  isLight ? 'bg-slate-200' : 'bg-slate-700'
                }`}>
                  <div 
                    className="h-full rounded-full bg-sky-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(8, b.percentOfTotal))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Generation Distribution & Health */}
        <div className="flex flex-col gap-5">
          {/* Generations Stair Breakdown */}
          <div className={`p-5 rounded-xl border transition-colors flex flex-col gap-3.5 ${
            isLight ? 'bg-white border-slate-200 shadow-2xs' : 'bg-slate-900/70 border-slate-800'
          }`}>
            <h2 className={`text-sm font-bold tracking-tight border-b pb-2.5 ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              የትውልድ ደረጃዎች (Generations)
            </h2>

            <div className="flex flex-col gap-2.5">
              {/* G1 */}
              <div className="flex items-center justify-between text-xs">
                <span className={`font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  G1 · ዋነኛ አባት (ደስታ)
                </span>
                <span className={`font-mono font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {genCounts.g1}
                </span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-slate-800'}`}>
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '4%' }} />
              </div>

              {/* G2 */}
              <div className="flex items-center justify-between text-xs mt-1">
                <span className={`font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  G2 · ልጆች
                </span>
                <span className={`font-mono font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {genCounts.g2}
                </span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-slate-800'}`}>
                <div className="h-full bg-sky-500 rounded-full" style={{ width: '12%' }} />
              </div>

              {/* G3 */}
              <div className="flex items-center justify-between text-xs mt-1">
                <span className={`font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  G3 · የልጅ ልጆች
                </span>
                <span className={`font-mono font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {genCounts.g3}
                </span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-slate-800'}`}>
                <div 
                  className="h-full bg-purple-500 rounded-full" 
                  style={{ width: `${Math.round((genCounts.g3 / stats.totalMembers) * 100)}%` }} 
                />
              </div>

              {/* G4 */}
              <div className="flex items-center justify-between text-xs mt-1">
                <span className={`font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  G4 · ቅማንት
                </span>
                <span className={`font-mono font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {genCounts.g4}
                </span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-slate-800'}`}>
                <div 
                  className="h-full bg-emerald-500 rounded-full" 
                  style={{ width: `${Math.round((genCounts.g4 / stats.totalMembers) * 100)}%` }} 
                />
              </div>
            </div>
          </div>

          {/* Verification Status Card */}
          <div className={`p-5 rounded-xl border transition-colors flex flex-col gap-3 ${
            isLight ? 'bg-white border-slate-200 shadow-2xs' : 'bg-slate-900/70 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-sm font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                የስሞች ሁኔታ
              </h2>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                stats.uncertainCount === 0
                  ? isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/20 text-emerald-300'
                  : isLight ? 'bg-amber-100 text-amber-800' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {stats.uncertainCount === 0 ? 'ሙሉ የተረጋገጠ' : `${stats.uncertainCount} የደበዘዙ [?]`}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className={`flex-1 p-2.5 rounded-lg border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-slate-750'
              }`}>
                <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>የተረጋገጡ</div>
                <div className={`text-base font-bold mt-0.5 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                  {stats.confirmedCount}
                </div>
              </div>
              <div className={`flex-1 p-2.5 rounded-lg border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-slate-750'
              }`}>
                <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>የደበዘዙ [?]</div>
                <div className={`text-base font-bold mt-0.5 ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
                  {stats.uncertainCount}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Action Table for [?] members (if any exist) */}
      {uncertainMembers.length > 0 && (
        <div className={`p-5 rounded-xl border transition-colors flex flex-col gap-3 ${
          isLight ? 'bg-white border-slate-200 shadow-2xs' : 'bg-slate-900/70 border-slate-800'
        }`}>
          <div className="flex items-center justify-between border-b pb-2.5">
            <div className="flex items-center gap-2">
              <AlertCircle size={14} className="text-amber-500" />
              <h2 className={`text-sm font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                ማረጋገጫ የሚሹ ስሞች ({uncertainMembers.length})
              </h2>
            </div>
            <span className={`text-xs ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
              ቀጥታ ማስተካከል ይችላሉ
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {uncertainMembers.map((member) => (
              <div
                key={member.id}
                className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 transition-colors ${
                  isLight 
                    ? 'bg-amber-50/40 border-amber-200 hover:bg-amber-50' 
                    : 'bg-amber-950/20 border-amber-900/40 hover:bg-amber-950/30'
                }`}
              >
                <div className="min-w-0">
                  <div className={`font-semibold text-xs truncate ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                    {member.name}
                  </div>
                  <div className={`text-[10px] truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    G{member.generation} · {member.path.slice(-2, -1)[0] || 'ደስታ'}
                  </div>
                </div>

                <button
                  onClick={() => onEditNode(member)}
                  className={`px-2 py-1 rounded-md border shrink-0 text-[11px] font-semibold flex items-center gap-1 transition-all duration-150 active:scale-95 ${
                    isLight 
                      ? 'bg-white hover:bg-amber-100/70 border-amber-300 text-amber-900 shadow-2xs' 
                      : 'bg-amber-950/40 hover:bg-amber-900/50 border-amber-800 text-amber-200'
                  }`}
                  title="ስሙን አስተካክል (Edit Name)"
                >
                  <Edit3 size={11} />
                  <span>አስተካክል</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
