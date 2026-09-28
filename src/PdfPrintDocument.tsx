import React from 'react';
import { FamilyNode } from './destaFamilyData';
import { FlattenedNode, TreeStats, getCleanName } from './familyUtils';

interface PdfPrintDocumentProps {
  rootNode: FamilyNode;
  flattenedNodes: FlattenedNode[];
  stats: TreeStats;
  exportType: 'all' | 'summary' | 'tree';
}

const GEEZ_NUMS = ['፩', '፪', '፫', '፬', '፭', '፮', '፯'];

function countDescendants(node: FamilyNode): number {
  if (!node.children || node.children.length === 0) return 0;
  return node.children.reduce((acc, child) => acc + 1 + countDescendants(child), 0);
}

export const PdfPrintDocument: React.FC<PdfPrintDocumentProps> = ({
  rootNode,
  flattenedNodes,
  stats,
  exportType,
}) => {
  const g2Branches = rootNode.children || [];
  
  // Generation counts
  const genCounts = {
    g1: flattenedNodes.filter(n => n.generation === 1).length,
    g2: flattenedNodes.filter(n => n.generation === 2).length,
    g3: flattenedNodes.filter(n => n.generation === 3).length,
    g4: flattenedNodes.filter(n => n.generation === 4).length,
  };

  const verifiedPercent = stats.totalMembers > 0 
    ? Math.round((stats.confirmedCount / stats.totalMembers) * 100) 
    : 100;

  const showSummary = exportType === 'all' || exportType === 'summary';
  const showTree = exportType === 'all' || exportType === 'tree';

  return (
    <div 
      id="pdf-printable-content"
      className="bg-white text-slate-900 p-8 max-w-[900px] mx-auto font-sans leading-relaxed"
      style={{ minHeight: '100%' }}
    >
      {/* Document Header */}
      <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-start justify-between">
        <div>
          <span className="text-[11px] font-mono tracking-widest text-slate-500 uppercase">
            Official Family Heritage Documentation
          </span>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
            የደስታ የቤተሰብ ዛፍ ሙሉ ሪፖርት
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Desta Family Lineage Transcription & Comprehensive Demographic Record
          </p>
        </div>

        <div className="text-right text-xs">
          <div className="font-bold text-slate-800">
            {exportType === 'all' && 'ሙሉ ሪፖርት (All: Summary & Tree)'}
            {exportType === 'summary' && 'ማጠቃለያ ዳሽቦርድ (Summary Only)'}
            {exportType === 'tree' && 'የቤተሰብ ዛፍ ተዋረድ (Tree Only)'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            ጠቅላላ አባላት: {stats.totalMembers} · ፯ ቅርንጫፎች
          </div>
        </div>
      </div>

      {/* SECTION 1: SUMMARY DASHBOARD */}
      {showSummary && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              ክፍል ፩፡ ማጠቃለያ ዳሽቦርድ (Executive Summary)
            </h2>
          </div>

          {/* 4 KPIs Grid */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="border border-slate-300 rounded-lg p-3 bg-slate-50/80">
              <div className="text-[10px] text-slate-500 uppercase font-medium">ጠቅላላ አባላት</div>
              <div className="text-2xl font-black text-slate-900 mt-0.5">{stats.totalMembers}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">የተመዘገቡ አባላት</div>
            </div>

            <div className="border border-slate-300 rounded-lg p-3 bg-slate-50/80">
              <div className="text-[10px] text-slate-500 uppercase font-medium">የትውልድ ደረጃዎች</div>
              <div className="text-2xl font-black text-slate-900 mt-0.5">{stats.maxGenerations}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">G1 እስከ G4</div>
            </div>

            <div className="border border-slate-300 rounded-lg p-3 bg-slate-50/80">
              <div className="text-[10px] text-slate-500 uppercase font-medium">ዋና ቅርንጫፎች</div>
              <div className="text-2xl font-black text-slate-900 mt-0.5">{stats.directChildrenCount}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">የደስታ ልጆች</div>
            </div>

            <div className="border border-slate-300 rounded-lg p-3 bg-slate-50/80">
              <div className="text-[10px] text-slate-500 uppercase font-medium">የተረጋገጠ ትክክለኛነት</div>
              <div className="text-2xl font-black text-emerald-700 mt-0.5">{verifiedPercent}%</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{stats.confirmedCount} የተረጋገጡ</div>
            </div>
          </div>

          {/* Two Columns: Generations & Branch Distribution Table */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Generations Breakdown */}
            <div className="border border-slate-200 rounded-lg p-3 bg-white">
              <h3 className="text-xs font-bold mb-2.5 text-slate-800 border-b pb-1.5">
                የትውልድ ስርጭት (Generations Depth)
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span><strong>G1</strong> · ዋነኛ አባት (ደስታ)</span>
                  <span className="font-mono font-bold">{genCounts.g1}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span><strong>G2</strong> · ልጆች (Branches)</span>
                  <span className="font-mono font-bold">{genCounts.g2}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span><strong>G3</strong> · የልጅ ልጆች (Grandchildren)</span>
                  <span className="font-mono font-bold">{genCounts.g3}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span><strong>G4</strong> · ቅማንት (Great-Grandchildren)</span>
                  <span className="font-mono font-bold">{genCounts.g4}</span>
                </div>
              </div>
            </div>

            {/* Quality & Uncertainty */}
            <div className="border border-slate-200 rounded-lg p-3 bg-white">
              <h3 className="text-xs font-bold mb-2.5 text-slate-800 border-b pb-1.5">
                የዳታ ሁኔታ (Data Verification Status)
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span>ሙሉ የተረጋገጡ ስሞች</span>
                  <span className="font-mono font-bold text-emerald-700">{stats.confirmedCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>በከፊል የደበዘዙ [?] ስሞች</span>
                  <span className="font-mono font-bold text-amber-700">{stats.uncertainCount}</span>
                </div>
                <div className="text-[11px] text-slate-500 pt-1 border-t">
                  [?] ምልክት ያለባቸው ስሞች በመጀመሪያው ገበታ ላይ በከፊል የደበዘዙትን ያመለክታል።
                </div>
              </div>
            </div>
          </div>

          {/* 7 Branches Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">ቁጥር</th>
                  <th className="py-2 px-3">የቅርንጫፍ ስም (G2)</th>
                  <th className="py-2 px-3 text-center">G3 (ልጅ ልጆች)</th>
                  <th className="py-2 px-3 text-center">G4 (ቅማንት)</th>
                  <th className="py-2 px-3 text-right">ጠቅላላ ተወላጅ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {g2Branches.map((branch, idx) => {
                  const g3Count = branch.children?.length || 0;
                  let g4Count = 0;
                  if (branch.children) {
                    branch.children.forEach(c => {
                      if (c.children) g4Count += c.children.length;
                    });
                  }
                  const total = 1 + g3Count + g4Count;

                  return (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="py-1.5 px-3 font-mono font-bold text-slate-500">
                        {GEEZ_NUMS[idx]}
                      </td>
                      <td className="py-1.5 px-3 font-bold text-slate-900">
                        {getCleanName(branch.name)}
                      </td>
                      <td className="py-1.5 px-3 text-center font-mono">
                        {g3Count}
                      </td>
                      <td className="py-1.5 px-3 text-center font-mono">
                        {g4Count}
                      </td>
                      <td className="py-1.5 px-3 text-right font-mono font-bold text-slate-900">
                        {total}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: FULL FAMILY TREE HIERARCHY */}
      {showTree && (
        <div>
          <div className="flex items-center gap-2 mb-3 pt-4 border-t border-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              ክፍል ፪፡ የቤተሰብ ዛፍ ሙሉ ተዋረድ (Full Lineage Tree Hierarchy)
            </h2>
          </div>

          {/* Root Card */}
          <div className="p-3 rounded-lg border-2 border-slate-900 bg-slate-50 mb-5 text-center">
            <div className="text-[10px] font-mono text-slate-500">ትውልድ ፩ (G1) · ዋነኛ አባት</div>
            <div className="text-xl font-black text-slate-900">{getCleanName(rootNode.name)}</div>
            <div className="text-xs text-slate-600 mt-0.5">፯ ዋና ዋና ቅርንጫፎች ተመዝግበዋል</div>
          </div>

          {/* All 7 Branches Detailed Cards */}
          <div className="space-y-4">
            {g2Branches.map((branch, bIdx) => {
              const cleanBranchName = getCleanName(branch.name);
              const branchDescendants = countDescendants(branch);

              return (
                <div 
                  key={bIdx}
                  className="border border-slate-300 rounded-lg p-3.5 bg-white break-inside-avoid"
                >
                  {/* Branch Title */}
                  <div className="flex items-center justify-between border-b pb-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold px-1.5 py-0.5 bg-slate-900 text-white rounded text-xs">
                        {GEEZ_NUMS[bIdx]}
                      </span>
                      <h3 className="font-black text-base text-slate-900">
                        {cleanBranchName}
                      </h3>
                      {branch.name.includes('[?]') && (
                        <span className="text-[10px] px-1 bg-amber-100 text-amber-800 rounded font-mono">
                          [?]
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-mono font-semibold text-slate-600">
                      {branch.children?.length || 0} ልጆች · ጠቅላላ {branchDescendants + 1}
                    </div>
                  </div>

                  {/* Children (G3) & Grandchildren (G4) */}
                  {branch.children && branch.children.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {branch.children.map((child, cIdx) => (
                        <div 
                          key={cIdx}
                          className="border border-slate-200 rounded p-2 bg-slate-50/70"
                        >
                          <div className="font-bold text-slate-900 flex items-center justify-between">
                            <span>{getCleanName(child.name)}</span>
                            {child.name.includes('[?]') && (
                              <span className="text-[9px] px-1 rounded bg-amber-100 text-amber-800">
                                [?]
                              </span>
                            )}
                          </div>

                          {child.children && child.children.length > 0 && (
                            <div className="mt-1.5 pt-1.5 border-t border-slate-200">
                              <div className="text-[10px] text-slate-500 mb-1">
                                ቅማንት (G4) ({child.children.length}):
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {child.children.map((g4, g4Idx) => (
                                  <span 
                                    key={g4Idx}
                                    className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[11px] text-slate-800"
                                  >
                                    {getCleanName(g4.name)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs italic text-slate-400">
                      ተጨማሪ ዝርዝር የለም
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Document Footer */}
      <div className="mt-8 pt-4 border-t border-slate-300 text-center text-[10px] text-slate-400">
        የደስታ የቤተሰብ ዛፍ ሙሉ የሥነ-ዘር ሐረግ እና ማጠቃለያ ሪፖርት · Desta Family Heritage Archive
      </div>
    </div>
  );
};
