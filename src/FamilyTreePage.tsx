import React, { useState, useMemo, useRef } from 'react';
import { FamilyNode } from './destaFamilyData';
import { FlattenedNode, TreeStats, getCleanName } from './familyUtils';
import { RadialHeritageTree } from './RadialHeritageTree';
import { generateRadialTreeSvg } from './RadialTreeSvgExport';
import { downloadElementAsPdf } from './pdfGenerator';
import { 
  Search, 
  X, 
  ChevronDown, 
  ChevronRight, 
  Download, 
  FileDown, 
  Eye, 
  Layers, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ListTree, 
  Compass,
  RotateCcw,
  UserCheck,
  ShieldAlert,
  Printer
} from 'lucide-react';

interface FamilyTreePageProps {
  rootNode: FamilyNode;
  flattenedNodes: FlattenedNode[];
  stats: TreeStats;
  theme?: 'dark' | 'light';
  onOpenPdfModal?: () => void;
}

const GEEZ_NUMS = ['፩', '፪', '፫', '፬', '፭', '፮', '፯', '፰'];

export const FamilyTreePage: React.FC<FamilyTreePageProps> = ({
  rootNode,
  flattenedNodes,
  stats,
  theme = 'light',
  onOpenPdfModal,
}) => {
  // Navigation & View state
  const [viewMode, setViewMode] = useState<'radial' | 'list'>('radial');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranchIndex, setSelectedBranchIndex] = useState<number | null>(null);
  const [selectedNode, setSelectedNode] = useState<FlattenedNode | null>(null);
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);
  const [isDownloadingSvg, setIsDownloadingSvg] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const interactiveTreeRef = useRef<HTMLDivElement>(null);
  const printContainerRef = useRef<HTMLDivElement>(null);

  // The 8 Primary Branches
  const primaryBranches = useMemo(() => {
    function countAllDescendants(node: FamilyNode): number {
      if (!node.children || node.children.length === 0) return 0;
      return node.children.reduce((acc, c) => acc + 1 + countAllDescendants(c), 0);
    }

    return (rootNode.children || []).map((b, idx) => {
      const g3 = b.children || [];
      const totalDescendants = countAllDescendants(b);
      return {
        index: idx,
        geez: GEEZ_NUMS[idx] || `${idx + 1}`,
        rawName: b.name,
        cleanName: getCleanName(b.name),
        g3Count: g3.length,
        totalDescendants,
        node: b,
      };
    });
  }, [rootNode]);

  // Search filtering
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return flattenedNodes.filter(node => {
      const clean = getCleanName(node.name).toLowerCase();
      const raw = node.name.toLowerCase();
      // If branch filter is on, optionally prioritize or restrict
      if (selectedBranchIndex !== null) {
        const branch = primaryBranches[selectedBranchIndex];
        const inBranch = node.path.includes(branch.rawName) || node.name === 'ደስታ';
        return (clean.includes(q) || raw.includes(q)) && inBranch;
      }
      return clean.includes(q) || raw.includes(q);
    }).slice(0, 8); // Top 8 suggestions
  }, [searchQuery, flattenedNodes, selectedBranchIndex, primaryBranches]);

  // Handle selecting member from search
  const handleSelectSearchedMember = (node: FlattenedNode) => {
    setSelectedNode(node);
    setHighlightedNodeId(node.id);
    setSearchQuery('');
    // Scroll smoothly to the interactive tree if not in view
    interactiveTreeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Branch exploration handler
  const handleExploreBranch = (idx: number) => {
    setSelectedBranchIndex(idx);
    // Scroll smoothly to tree
    interactiveTreeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Clear branch filter
  const handleResetBranchFilter = () => {
    setSelectedBranchIndex(null);
  };

  // Download standalone Vector SVG
  const handleDownloadSvg = () => {
    try {
      setIsDownloadingSvg(true);
      const svgString = generateRadialTreeSvg(rootNode);
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Desta_Family_Radial_Square_Luxury.svg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download SVG:', err);
    } finally {
      setIsDownloadingSvg(false);
    }
  };

  // Download PDF Report
  const handleDownloadPdf = async () => {
    if (onOpenPdfModal) {
      onOpenPdfModal();
      return;
    }
    // Fallback direct browser print
    window.print();
  };

  // Relationship description helper
  const getRelationshipText = (gen: number): string => {
    switch (gen) {
      case 1: return 'መስራች አባት (Founding Ancestor)';
      case 2: return 'የደስታ ልጅ (Patriarchal / Matriarchal Child of Desta)';
      case 3: return 'የደስታ የልጅ ልጅ (Grandchild of Desta)';
      case 4: return 'የደስታ ቅድመ-አያት የልጅ ልጅ (Great-Grandchild of Desta)';
      default: return `ትውልድ ${gen} አባል`;
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FBF9F5] text-[#2B2421] selection:bg-[#C5A059] selection:text-[#1F1A17] font-sans">
      
      {/* =========================================================================
          SECTION A: HERO SECTION (Premium Editorial Heritage)
          ========================================================================= */}
      <section className="relative w-full py-8 px-4 sm:px-6 lg:px-8 border-b border-[#E8E2D7] overflow-hidden bg-gradient-to-b from-[#F5EFE6]/60 via-[#FBF9F5] to-[#FBF9F5]">
        {/* Subtle decorative background watermarks */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-[#C5A059]/10 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-[#C5A059]/5 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Heading */}
          <h1 className="font-heritage-en text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#231D19] mb-2">
            Our Family Tree
          </h1>

          {/* Amharic Subtitle */}
          <p className="font-heritage-am text-xl sm:text-2xl font-bold text-[#5C2027] tracking-normal">
            የደስታ ቤተሰብ የዘር ሐረግ
          </p>
        </div>
      </section>

      {/* =========================================================================
          SECTION B: SEARCH & INTERACTIVE CIRCULAR FAMILY TREE
          ========================================================================= */}
      <section 
        id="interactive-tree" 
        ref={interactiveTreeRef}
        className="w-full py-6 px-2 sm:px-4 lg:px-6"
      >
        {/* Search Bar & View Controls Strip */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E8E2D7]">
          {/* View Toggle & Search Bar Cluster */}
          <div className="flex flex-wrap items-center justify-between w-full gap-2.5">
            {/* View Mode & Download Circular Tree Action Button */}
            <div className="flex items-center p-1 rounded-xl bg-[#F0EBE1] border border-[#E0D7CA] gap-1">
              <button
                type="button"
                onClick={() => setViewMode(prev => prev === 'radial' ? 'list' : 'radial')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'radial'
                    ? 'bg-[#2B2421] text-white shadow-xs font-bold'
                    : 'bg-white text-[#2B2421] shadow-2xs font-bold'
                }`}
                title={viewMode === 'radial' ? 'ወደ ዝርዝር ተዋረድ ቀይር (Switch to List)' : 'ወደ ክብ ዛፍ ቀይር (Switch to Radial)'}
              >
                {viewMode === 'radial' ? 'ክብ ዛፍ (Radial Tree)' : 'ዝርዝር ተዋረድ (List View)'}
              </button>
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 bg-[#5C2027] hover:bg-[#43161C] text-white shadow-xs active:scale-95 cursor-pointer"
                title="ክበበ ዘር ሐረግ አውርድ (Download High Quality Circular Family Tree)"
              >
                <Download size={13} className="text-[#EED9C4]" />
                <span>ክበበ ዘር ሐረግ አውርድ (Circular Family Tree)</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadSvg}
                className="hidden sm:flex px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all items-center gap-1 bg-white hover:bg-[#FAF6ED] text-[#2B2421] border border-[#DDD5C5] active:scale-95 cursor-pointer"
                title="SVG ቬክተር አውርድ (Download Scalable Vector SVG)"
              >
                <FileDown size={12} className="text-[#8C7D70]" />
                <span>SVG</span>
              </button>
            </div>

            {/* Search Input with Autocomplete Suggestions */}
            <div className="relative min-w-[220px] sm:min-w-[280px]">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7D70]" />
                <input
                  type="text"
                  placeholder="አባል በስም ፈልግ (Search member)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-white border border-[#DDD5C5] text-xs text-[#2B2421] placeholder-[#8C7D70] focus:outline-none focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/15 shadow-2xs transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-xs text-[#8C7D70] hover:text-[#2B2421]"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Autocomplete Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute right-0 top-full mt-1.5 w-full bg-white rounded-xl shadow-2xl border border-[#DDD5C5] p-1.5 z-50 flex flex-col gap-1 max-h-64 overflow-y-auto">
                  <div className="px-2 py-1 text-[10px] font-semibold tracking-wider uppercase text-[#8C7D70] border-b border-[#F0EBE1]">
                    የተገኙ አባላት ({searchResults.length})
                  </div>
                  {searchResults.map(res => (
                    <button
                      key={res.id}
                      onClick={() => handleSelectSearchedMember(res)}
                      className="px-2.5 py-1.5 rounded-lg text-left text-xs hover:bg-[#FAF6ED] transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <div className="font-semibold text-[#2B2421] group-hover:text-[#5C2027] flex items-center gap-1.5">
                          <span>{res.name}</span>
                          {res.memberId && (
                            <span className="font-mono text-[10px] text-[#8C7D70] bg-[#F2ECE1] px-1 rounded">
                              {res.memberId}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#8C7D70]">
                          ትውልድ {res.generation} · {res.branchName || (res.path.length > 1 ? res.path[1] : 'መስራች')}
                        </div>
                      </div>
                      <ChevronRight size={13} className="text-[#8C7D70] group-hover:text-[#5C2027]" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active Branch Exploration Filter Banner (if selected) */}
        {selectedBranchIndex !== null && (
          <div className="mb-4 p-3 rounded-2xl bg-[#F7F2E8] border border-[#C5A059]/40 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5C2027]" />
              <span className="text-xs font-bold text-[#2B2421]">
                {primaryBranches[selectedBranchIndex].cleanName} ቅርንጫፍ
              </span>
              <span className="text-xs text-[#8C7D70]">
                ({primaryBranches[selectedBranchIndex].totalDescendants} ዘሮች ተለይተው ቀርበዋል)
              </span>
            </div>

            <button
              onClick={handleResetBranchFilter}
              className="px-3 py-1 rounded-xl text-xs font-semibold bg-white border border-[#DDD5C5] text-[#5C2027] hover:bg-[#FAF6ED] transition-all active:scale-95"
            >
              ሁሉንም ቅርንጫፎች አሳይ (Clear Filter)
            </button>
          </div>
        )}

        {/* Tree Canvas Layout with Side Panel Overlay - 100% Full Width */}
        <div className="relative w-full">
          
          {/* Main Visualization Area - 100% Full Width */}
          <div className="w-full">
            {viewMode === 'radial' ? (
              <RadialHeritageTree
                rootNode={rootNode}
                flattenedNodes={flattenedNodes}
                selectedNode={selectedNode}
                onSelectNode={(node) => setSelectedNode(node)}
                selectedBranchIndex={selectedBranchIndex}
                highlightedNodeId={highlightedNodeId}
              />
            ) : (
              /* Alternative Hierarchical List View for Mobile & Compact Devices */
              <div className="w-full bg-white rounded-2xl sm:rounded-3xl border border-[#E6DFD3] p-5 shadow-lg max-h-[720px] overflow-y-auto">
                <div className="pb-3 mb-4 border-b border-[#F0EBE1] flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#2B2421]">
                    የደስታ ቤተሰብ ተዋረድ ዝርዝር (Lineage Hierarchy)
                  </h3>
                  <span className="text-xs text-[#8C7D70]">
                    {flattenedNodes.length} የተመዘገቡ አባላት
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {primaryBranches.map(branch => {
                    const isFiltered = selectedBranchIndex === null || selectedBranchIndex === branch.index;
                    if (!isFiltered) return null;

                    return (
                      <div key={branch.index} className="border border-[#EFEBE4] rounded-xl p-3 bg-[#FAF8F5]/60">
                        <div 
                          className="flex items-center justify-between cursor-pointer font-bold text-sm text-[#2B2421] hover:text-[#5C2027]"
                          onClick={() => {
                            const bNode = flattenedNodes.find(fn => fn.name === branch.rawName);
                            if (bNode) setSelectedNode(bNode);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#C5A059]/20 text-[#5C2027]">
                              [{branch.geez}]
                            </span>
                            <span>{branch.cleanName}</span>
                          </div>
                          <span className="text-xs text-[#8C7D70] font-normal">
                            {branch.totalDescendants} ዘሮች
                          </span>
                        </div>

                        {/* Direct Children (G3) */}
                        <div className="mt-2.5 pl-4 border-l-2 border-[#C5A059]/30 flex flex-col gap-1.5">
                          {branch.node.children?.map((g3Child, g3Idx) => (
                            <div key={g3Idx} className="text-xs">
                              <div 
                                className="font-medium text-[#4A4038] hover:text-[#5C2027] cursor-pointer flex items-center gap-1.5 py-0.5"
                                onClick={() => {
                                  const g3Match = flattenedNodes.find(fn => fn.name === g3Child.name && fn.generation === 3);
                                  if (g3Match) setSelectedNode(g3Match);
                                }}
                              >
                                <span className="text-[#8C7D70]">•</span>
                                <span>{getCleanName(g3Child.name)}</span>
                                {g3Child.children && g3Child.children.length > 0 && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#EFEBE4] text-[#6B5E55]">
                                    {g3Child.children.length} ልጆች
                                  </span>
                                )}
                              </div>

                              {/* G4 Grandchildren */}
                              {g3Child.children && g3Child.children.length > 0 && (
                                <div className="pl-4 mt-1 border-l border-[#DDD5C5] flex flex-col gap-1">
                                  {g3Child.children.map((g4Child, g4Idx) => (
                                    <div 
                                      key={g4Idx}
                                      className="text-[11px] text-[#6B5E55] hover:text-[#5C2027] cursor-pointer flex items-center gap-1"
                                      onClick={() => {
                                        const g4Match = flattenedNodes.find(fn => fn.name === g4Child.name && fn.generation === 4);
                                        if (g4Match) setSelectedNode(g4Match);
                                      }}
                                    >
                                      <span className="text-[#C5A059]">-</span>
                                      <span>{getCleanName(g4Child.name)}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* SECTION D: FAMILY MEMBER DETAIL PANEL (Floating Slide-Over Overlay) */}
          {selectedNode && (
            <div className="absolute top-4 right-4 z-40 w-full sm:w-96 max-w-[calc(100%-2rem)] max-h-[calc(100%-2rem)] overflow-y-auto bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-[#E6DFD3] p-5 shadow-2xl animate-in fade-in slide-in-from-right-4 duration-200">
              {/* Panel Header */}
              <div className="flex items-start justify-between pb-3 mb-4 border-b border-[#F0EBE1]">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#FAF4E8] border border-[#C5A059]/30 text-[10.5px] font-mono font-semibold text-[#5C2027] mb-1">
                    <span>ትውልድ {GEEZ_NUMS[selectedNode.generation - 1] || selectedNode.generation}</span>
                    <span>· G{selectedNode.generation}</span>
                    {selectedNode.memberId && (
                      <span className="px-1.5 py-0.2 rounded bg-[#5C2027]/10 text-[#5C2027] font-bold">
                        {selectedNode.memberId}
                      </span>
                    )}
                  </div>
                  <h3 className="font-heritage-am text-lg font-bold text-[#231D19]">
                    {selectedNode.name}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedNode(null)}
                  className="p-1 rounded-lg text-[#8C7D70] hover:text-[#2B2421] hover:bg-[#F2ECE1] transition-colors"
                  title="ዝጋ (Close)"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Relationship & Ancestral Path */}
              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-[11px] font-semibold text-[#8C7D70] uppercase tracking-wider block mb-0.5">
                    ተዋረድና ዝምድና (Relationship)
                  </span>
                  <p className="font-medium text-[#2B2421]">
                    {getRelationshipText(selectedNode.generation)}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-[#8C7D70] uppercase tracking-wider block mb-0.5">
                    የዘር ሐረግ መስመር (Lineage Path)
                  </span>
                  <div className="font-mono text-[11px] text-[#5A4F47] bg-[#FAF8F5] p-2 rounded-xl border border-[#EAE3D6] leading-relaxed">
                    {selectedNode.path.map(p => getCleanName(p)).join(' → ')}
                  </div>
                </div>

                {/* Parent Navigation */}
                {selectedNode.parentId && (
                  <div>
                    <span className="text-[11px] font-semibold text-[#8C7D70] uppercase tracking-wider block mb-1">
                      ወላጅ (Parent)
                    </span>
                    {(() => {
                      const parent = flattenedNodes.find(fn => fn.id === selectedNode.parentId);
                      if (!parent) return <span className="text-[#8C7D70]">መረጃ አልተመዘገበም</span>;
                      return (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedNode(parent);
                            setHighlightedNodeId(parent.id);
                          }}
                          className="w-full text-left p-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F3ECE1] border border-[#EAE3D6] transition-colors flex items-center justify-between text-xs font-semibold text-[#5C2027] group"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                            <span>{parent.name}</span>
                          </div>
                          <span className="text-[10px] text-[#8C7D70] group-hover:text-[#5C2027]">ተመልከት →</span>
                        </button>
                      );
                    })()}
                  </div>
                )}

                {/* Children Navigation */}
                <div>
                  <span className="text-[11px] font-semibold text-[#8C7D70] uppercase tracking-wider block mb-1">
                    ልጆች (Children · {selectedNode.childrenCount})
                  </span>
                  {selectedNode.childrenCount > 0 ? (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {flattenedNodes
                        .filter(fn => fn.parentId === selectedNode.id)
                        .map(child => (
                          <button
                            key={child.id}
                            type="button"
                            onClick={() => {
                              setSelectedNode(child);
                              setHighlightedNodeId(child.id);
                            }}
                            className="w-full text-left p-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F3ECE1] border border-[#EAE3D6] transition-colors flex items-center justify-between text-xs text-[#2B2421] hover:text-[#5C2027] group"
                          >
                            <span>{child.name}</span>
                            <span className="text-[10px] text-[#8C7D70] group-hover:text-[#5C2027]">ተመልከት →</span>
                          </button>
                        ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-[#8C7D70] italic">
                      በዚህ መዝገብ የተመዘገቡ ልጆች የሉም (No recorded descendants).
                    </p>
                  )}
                </div>

                {/* Verification Notice */}
                <div className="pt-2 border-t border-[#F0EBE1] flex items-start gap-2">
                  {selectedNode.isUncertain ? (
                    <>
                      <AlertCircle size={14} className="text-[#C5A059] shrink-0 mt-0.5" />
                      <p className="text-[11px] text-[#7A6B60] leading-tight">
                        ስሙ በ[?] ምልክት ተመዝግቧል፤ ትክክለኛነቱ ለቀጣይ የቤተሰብ ማረጋገጫ ተቀምጧል።
                      </p>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} className="text-emerald-700 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-[#7A6B60] leading-tight">
                        በቤተሰብ ዛፍ ማህደር የተረጋገጠ የስም ምዝገባ።
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          SECTION E: EXPLORE BY FAMILY BRANCH (The 7 Primary Pillars)
          ========================================================================= */}
      <section className="w-full py-14 px-4 sm:px-6 lg:px-8 border-t border-[#E8E2D7] bg-[#F7F3EC]/50">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="font-heritage-en text-xs font-semibold tracking-[0.2em] text-[#5C2027] uppercase block mb-1">
              THE SEVEN PILLARS OF DESTA
            </span>
            <h2 className="font-heritage-en text-3xl font-bold text-[#231D19] mb-2">
              Explore by Family Branch
            </h2>
            <p className="font-heritage-am text-base font-semibold text-[#5C2027] mb-2">
              ስምንቱ ዋና የደስታ የቤተሰብ ቅርንጫፎች (፰ ዋና ዋና ቅርንጫፎች)
            </p>
            <p className="font-heritage-en text-xs text-[#6B5E55] italic">
              Select any branch to isolate its lineage within the circular tree diagram.
            </p>
          </div>

          {/* 8 Branch Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {primaryBranches.map((branch) => {
              const isSelected = selectedBranchIndex === branch.index;
              return (
                <div
                  key={branch.index}
                  className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white border-[#5C2027] shadow-xl ring-2 ring-[#5C2027]/20 scale-[1.02]'
                      : 'bg-white/85 border-[#E2DAD0] hover:bg-white hover:border-[#C5A059] shadow-sm hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Branch Number & Geez Pill */}
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-[#FAF4E8] text-[#5C2027] border border-[#C5A059]/30">
                        ቅርንጫፍ {branch.geez} · #{branch.index + 1}
                      </span>
                      <span className="text-xs text-[#8C7D70]">
                        {branch.totalDescendants} ዘሮች
                      </span>
                    </div>

                    {/* Branch Patriarch / Matriarch Name */}
                    <h3 className="font-heritage-am text-base font-bold text-[#231D19] mb-1">
                      {branch.cleanName}
                    </h3>

                    {/* Descendants Breakdown */}
                    <div className="text-[11px] text-[#6B5E55] space-y-0.5 mb-4">
                      <div>• {branch.g3Count} ቀጥተኛ ልጆች (G3 Members)</div>
                      <div>• ጠቅላላ ተወላጆች፡ {branch.totalDescendants}</div>
                    </div>
                  </div>

                  {/* Explore Action Button */}
                  <button
                    type="button"
                    onClick={() => handleExploreBranch(branch.index)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-[#5C2027] text-white shadow-xs'
                        : 'bg-[#FAF8F5] hover:bg-[#F2ECE1] text-[#2B2421] border border-[#DDD5C5]'
                    }`}
                  >
                    <span>{isSelected ? 'ተመርጧል (Selected)' : 'ቅርንጫፉን መርምር (Explore)'}</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Reset All Branches Button */}
          {selectedBranchIndex !== null && (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={handleResetBranchFilter}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#DDD5C5] text-xs font-semibold text-[#5C2027] hover:bg-[#FAF6ED] shadow-xs active:scale-95 transition-all"
              >
                <RotateCcw size={13} />
                <span>ሁሉንም ፰ ቅርንጫፎች መልሰህ አሳይ (Show All 8 Branches)</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          SECTION F: FAMILY GENERATIONS (Demographic Overview & Integrity)
          ========================================================================= */}
      <section className="w-full py-14 px-4 sm:px-6 lg:px-8 border-t border-[#E8E2D7]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="font-heritage-en text-xs font-semibold tracking-[0.2em] text-[#5C2027] uppercase block mb-1">
              CHRONICLE OF FIVE CONCENTRIC GENERATIONS
            </span>
            <h2 className="font-heritage-en text-3xl font-bold text-[#231D19] mb-1">
              Family Generations Overview
            </h2>
            <p className="font-heritage-am text-base font-semibold text-[#5C2027]">
              የደስታ ቤተሰብ አምስት ትውልዶች ማጠቃለያ (G1 - G5)
            </p>
          </div>

          {/* 5 Generation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-8">
            <div className="p-4 rounded-2xl bg-white border border-[#E2DAD0] shadow-sm text-center">
              <span className="font-heritage-en text-[10px] font-semibold tracking-wider text-[#8C7D70] uppercase">
                RING 0 · G1
              </span>
              <div className="font-heritage-am text-xl font-bold text-[#5C2027] my-1">
                ደስታ
              </div>
              <div className="text-[11px] text-[#5A4F47] font-medium">
                መስራች አባት (Hub)
              </div>
              <div className="mt-2.5 pt-2 border-t border-[#F0EBE1] text-[10px] text-[#8C7D70]">
                1 Ancestral Root
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E2DAD0] shadow-sm text-center">
              <span className="font-heritage-en text-[10px] font-semibold tracking-wider text-[#8C7D70] uppercase">
                RING 1 · G2
              </span>
              <div className="font-heritage-am text-xl font-bold text-[#231D19] my-1">
                ፰ ልጆች (8)
              </div>
              <div className="text-[11px] text-[#5A4F47] font-medium">
                ዋና ቅርንጫፎች
              </div>
              <div className="mt-2.5 pt-2 border-t border-[#F0EBE1] text-[10px] text-[#8C7D70]">
                8 Primary Branches
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E2DAD0] shadow-sm text-center">
              <span className="font-heritage-en text-[10px] font-semibold tracking-wider text-[#8C7D70] uppercase">
                RING 2 · G3
              </span>
              <div className="font-heritage-am text-xl font-bold text-[#231D19] my-1">
                የልጅ ልጆች
              </div>
              <div className="text-[11px] text-[#5A4F47] font-medium">
                Grandchildren
              </div>
              <div className="mt-2.5 pt-2 border-t border-[#F0EBE1] text-[10px] text-[#8C7D70]">
                Concentric Ring 2
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E2DAD0] shadow-sm text-center">
              <span className="font-heritage-en text-[10px] font-semibold tracking-wider text-[#8C7D70] uppercase">
                RING 3 · G4
              </span>
              <div className="font-heritage-am text-xl font-bold text-[#231D19] my-1">
                ቅድመ-አያት ዘሮች
              </div>
              <div className="text-[11px] text-[#5A4F47] font-medium">
                Great-Grandchildren
              </div>
              <div className="mt-2.5 pt-2 border-t border-[#F0EBE1] text-[10px] text-[#8C7D70]">
                Concentric Ring 3
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E2DAD0] shadow-sm text-center">
              <span className="font-heritage-en text-[10px] font-semibold tracking-wider text-[#8C7D70] uppercase">
                RING 4/5 · G5
              </span>
              <div className="font-heritage-am text-xl font-bold text-[#231D19] my-1">
                የውጪ ጫፍ ዘሮች
              </div>
              <div className="text-[11px] text-[#5A4F47] font-medium">
                Deep Outer Descendants
              </div>
              <div className="mt-2.5 pt-2 border-t border-[#F0EBE1] text-[10px] text-[#8C7D70]">
                Concentric Ring 4 & 5
              </div>
            </div>
          </div>

          {/* Historical Master Archive Note */}
          <div className="p-4 rounded-2xl bg-[#FAF6EE] border border-[#C5A059]/40 flex items-start gap-3 text-xs text-[#5A4F47] max-w-3xl mx-auto shadow-xs">
            <ShieldAlert size={18} className="text-[#C5A059] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold text-[#231D19] block mb-0.5">
                የደስታ የቤተሰብ ዛፍ ሙሉ ሪፖርት (ጠቅላላ አባላት፡ 168 / ፰ ዋና ዋና ቅርንጫፎች / 5 ትውልዶች)
              </span>
              ይህ ማህደር ሁሉንም 168 የተመዘገቡ አባላት እና ፰ቱን ዋና ዋና ቅርንጫፎች ያካተተ ነው። ያልተሞሉ ቦታዎች ([ስም ያልተሞላ]) እና ጊዜያዊ ግንኙነቶች ([?]) እንደ ታሪካዊ መረጃ በስሱ በነጠብጣብ መስመር ተቀምጠዋል።
            </div>
          </div>
        </div>
      </section>


      {/* Editorial Heritage Footer */}
      <footer className="w-full py-8 px-4 border-t border-[#E8E2D7] text-center text-xs text-[#8C7D70] font-heritage-en">
        <p className="mb-1 text-sm font-semibold text-[#4A4038]">
          The Desta Family Heritage Archive · የደስታ ቤተሰብ ታሪክ ማህደር
        </p>
        <p className="text-[11px] text-[#A69A8E]">
          Preserving lineage, celebrating generations, and honoring the founding ancestor ደስታ.
        </p>
      </footer>
    </div>
  );
};
