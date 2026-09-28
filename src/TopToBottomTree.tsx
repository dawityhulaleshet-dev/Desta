import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FamilyNode } from './destaFamilyData';
import { FlattenedNode, getCleanName } from './familyUtils';
import { 
  ChevronDown, 
  ChevronUp, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Move, 
  Sparkles,
  Search,
  HelpCircle,
  Edit3,
  Layers,
  Crown,
  Filter,
  Maximize2,
  Minimize2,
  FileDown
} from 'lucide-react';

interface TopToBottomTreeProps {
  rootNode: FamilyNode;
  selectedNode: FlattenedNode | null;
  onSelectNode: (node: FlattenedNode) => void;
  onEditNode: (node: FlattenedNode) => void;
  searchQuery: string;
  filterUncertainOnly: boolean;
  theme?: 'dark' | 'light';
  onOpenPdfModal?: () => void;
  activeBranchIndex?: number | null;
  onSelectBranch?: (index: number | null) => void;
}

// Ge'ez numerals for 1 through 7
const GEEZ_NUMS = ['፩', '፪', '፫', '፬', '፭', '፮', '፯'];

function countTotalDescendants(node: FamilyNode): number {
  if (!node.children || node.children.length === 0) return 0;
  return node.children.reduce((acc, child) => acc + 1 + countTotalDescendants(child), 0);
}

export const TopToBottomTree: React.FC<TopToBottomTreeProps> = ({
  rootNode,
  selectedNode,
  onSelectNode,
  onEditNode,
  searchQuery,
  filterUncertainOnly,
  theme = 'dark',
  onOpenPdfModal,
  activeBranchIndex,
  onSelectBranch,
}) => {
  const isLight = theme === 'light';
  // Zoom & Pan state
  const [scale, setScale] = useState<number>(0.92);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 30 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Root visibility toggle
  const [showG2, setShowG2] = useState<boolean>(true);

  // Stepped-Drop Layout State:
  // Instead of pushing sibling cards horizontally, only the active branch steps down,
  // and its children (G3, G4) are displayed on the tiers below without moving the other cards!
  // By default, set activeG2Index = 2 (branch 3) to match the preview diagram, or null.
  const [activeG2Index, setActiveG2Index] = useState<number | null>(
    activeBranchIndex !== undefined ? activeBranchIndex : 2
  );
  const [activeG3Index, setActiveG3Index] = useState<number | null>(4);

  // Sync when activeBranchIndex changes from outside
  useEffect(() => {
    if (activeBranchIndex !== undefined) {
      setActiveG2Index(activeBranchIndex);
      setActiveG3Index(null);
    }
  }, [activeBranchIndex]);

  // Hover state for visual highlighting only (no hover expansion)
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Total count of descendants under root
  const totalDescendantsCount = useMemo(() => {
    return countTotalDescendants(rootNode);
  }, [rootNode]);

  // G2 children list
  const g2Children = useMemo(() => {
    return rootNode.children || [];
  }, [rootNode]);

  // Active G2 Node
  const activeG2Node = useMemo(() => {
    if (activeG2Index === null || !g2Children[activeG2Index]) return null;
    return g2Children[activeG2Index];
  }, [g2Children, activeG2Index]);

  // G3 children of active G2
  const g3Children = useMemo(() => {
    return activeG2Node?.children || [];
  }, [activeG2Node]);

  // Active G3 Node
  const activeG3Node = useMemo(() => {
    if (activeG3Index === null || !g3Children[activeG3Index]) return null;
    return g3Children[activeG3Index];
  }, [g3Children, activeG3Index]);

  // G4 children of active G3
  const g4Children = useMemo(() => {
    return activeG3Node?.children || [];
  }, [activeG3Node]);

  // Auto-reveal on search match
  useEffect(() => {
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();

    // Look through G2, G3, G4 to find match and set active branches
    for (let i = 0; i < g2Children.length; i++) {
      const g2 = g2Children[i];
      if (g2.name.toLowerCase().includes(q) || getCleanName(g2.name).toLowerCase().includes(q)) {
        setActiveG2Index(i);
        setActiveG3Index(null);
        return;
      }

      if (g2.children) {
        for (let j = 0; j < g2.children.length; j++) {
          const g3 = g2.children[j];
          if (g3.name.toLowerCase().includes(q) || getCleanName(g3.name).toLowerCase().includes(q)) {
            setActiveG2Index(i);
            setActiveG3Index(j);
            return;
          }

          if (g3.children) {
            for (let k = 0; k < g3.children.length; k++) {
              const g4 = g3.children[k];
              if (g4.name.toLowerCase().includes(q) || getCleanName(g4.name).toLowerCase().includes(q)) {
                setActiveG2Index(i);
                setActiveG3Index(j);
                return;
              }
            }
          }
        }
      }
    }
  }, [searchQuery, g2Children]);

  // Zoom and pan controls
  const handleZoomIn = () => setScale(s => Math.min(2.0, +(s + 0.12).toFixed(2)));
  const handleZoomOut = () => setScale(s => Math.max(0.3, +(s - 0.12).toFixed(2)));
  const handleResetView = () => {
    setScale(0.9);
    if (containerRef.current) {
      const cw = containerRef.current.clientWidth;
      setPosition({ x: Math.round(cw / 2 - 1040 * 0.9), y: 24 });
    } else {
      setPosition({ x: 0, y: 24 });
    }
  };

  // Reset to initial collapsed state
  const resetToOverview = () => {
    setActiveG2Index(null);
    setActiveG3Index(null);
    setScale(0.9);
    if (containerRef.current) {
      const cw = containerRef.current.clientWidth;
      setPosition({ x: Math.round(cw / 2 - 1040 * 0.9), y: 24 });
    } else {
      setPosition({ x: 0, y: 24 });
    }
  };

  // Initial centering on mount
  useEffect(() => {
    if (containerRef.current) {
      const cw = containerRef.current.clientWidth;
      setPosition({ x: Math.round(cw / 2 - 1040 * 0.9), y: 24 });
      setScale(0.9);
    }
  }, []);

  // Pan events
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input, select')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 0.08 : -0.08;
      setScale(s => Math.max(0.3, Math.min(2.0, +(s + zoomFactor).toFixed(2))));
    }
  };

  // Helper to construct FlattenedNode for selection/inspector
  const makeFlattenedNode = (
    name: string,
    gen: number,
    path: string[],
    nodeRef: FamilyNode
  ): FlattenedNode => {
    return {
      id: path.join('-'),
      name,
      isUncertain: name.includes('[?]'),
      generation: gen,
      path,
      parentId: path.length > 1 ? path[path.length - 2] : null,
      childrenCount: nodeRef.children ? nodeRef.children.length : 0,
      nodeRef,
    };
  };

  // Determine active visible generation count
  const currentMaxGen = useMemo(() => {
    if (!showG2) return 1;
    if (activeG2Index === null) return 2;
    if (activeG3Index === null || !activeG3Node?.children || activeG3Node.children.length === 0) return 3;
    return 4;
  }, [showG2, activeG2Index, activeG3Index, activeG3Node]);

  return (
    <div className={`flex flex-col border rounded-xl overflow-hidden shadow-sm relative transition-colors ${
      isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-850'
    }`}>
      {/* Sleek Minimal Toolbar */}
      <div className={`border-b px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 z-20 transition-colors ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
      }`}>
        {/* 7 Branches Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 max-w-full">
          {g2Children.map((b, idx) => {
            const isActive = activeG2Index === idx;
            const bName = getCleanName(b.name);
            const geez = GEEZ_NUMS[idx] || `${idx + 1}`;

            return (
              <button
                key={idx}
                onClick={() => {
                  const nextIdx = isActive ? null : idx;
                  setActiveG2Index(nextIdx);
                  setActiveG3Index(null);
                  onSelectBranch?.(nextIdx);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 active:scale-95 border ${
                  isActive
                    ? isLight
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-950 border-white shadow-xs'
                    : isLight
                      ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700/80'
                }`}
              >
                <span>{geez}. {bName}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Depth & Zoom Controls */}
        <div className="flex items-center gap-2">
          {/* Generation Depth Selector */}
          <div className={`flex items-center p-1 rounded-xl border text-xs gap-0.5 ${
            isLight ? 'bg-slate-200/60 border-slate-300/70' : 'bg-slate-800 border-slate-700'
          }`}>
            <button
              onClick={resetToOverview}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all duration-150 active:scale-95 ${
                activeG2Index === null
                  ? isLight ? 'bg-white text-slate-950 shadow-xs font-semibold' : 'bg-slate-900 text-white shadow-xs font-semibold'
                  : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              G1–G2
            </button>
            <button
              onClick={() => {
                if (activeG2Index === null) setActiveG2Index(0);
                setActiveG3Index(null);
              }}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all duration-150 active:scale-95 ${
                activeG2Index !== null && activeG3Index === null
                  ? isLight ? 'bg-white text-slate-950 shadow-xs font-semibold' : 'bg-slate-900 text-white shadow-xs font-semibold'
                  : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              G1–G3
            </button>
            <button
              onClick={() => {
                setActiveG2Index(2);
                setActiveG3Index(4);
              }}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all duration-150 active:scale-95 ${
                activeG3Index !== null
                  ? isLight ? 'bg-white text-slate-950 shadow-xs font-semibold' : 'bg-slate-900 text-white shadow-xs font-semibold'
                  : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              G1–G4
            </button>
          </div>

          {/* Zoom controls */}
          <div className={`flex items-center p-1 rounded-xl border ${
            isLight ? 'bg-white border-slate-200 text-slate-700 shadow-2xs' : 'bg-slate-800 border-slate-700 text-slate-300'
          }`}>
            <button
              onClick={handleZoomIn}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-150 active:scale-90"
              title="አቅርብ (Zoom in)"
            >
              <ZoomIn size={13} />
            </button>
            <span className="text-[11px] font-mono px-1.5 min-w-[34px] text-center font-semibold">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={handleZoomOut}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-150 active:scale-90"
              title="አርቅ (Zoom out)"
            >
              <ZoomOut size={13} />
            </button>
            <button
              onClick={handleResetView}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-150 active:scale-90 ml-0.5"
              title="መሃል አድርግ (Reset)"
            >
              <RotateCcw size={12} />
            </button>
          </div>

          {onOpenPdfModal && (
            <button
              onClick={onOpenPdfModal}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 active:scale-95 shadow-2xs ${
                isLight 
                  ? 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900' 
                  : 'bg-white hover:bg-slate-100 text-slate-950 border-white'
              }`}
              title="PDF አውርድ (Export PDF)"
            >
              <FileDown size={13} className={isLight ? 'text-amber-400' : 'text-sky-600'} />
              <span>PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* Canvas Viewport */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className={`w-full h-[700px] lg:h-[780px] overflow-hidden relative cursor-grab active:cursor-grabbing select-none transition-colors ${
          isLight
            ? 'bg-[#fcfcfd] bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:24px_24px]'
            : 'bg-[#030712] bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] [background-size:24px_24px]'
        }`}
      >

        {/* Tree Render Container */}
        <div 
          className="absolute origin-top-left transition-transform duration-75 ease-out min-w-max px-80 py-12"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          }}
        >
          <div className="flex flex-col items-center">
            {/* ======================================================== */}
            {/* TIER 1: G1 ROOT (ደስታ)                                   */}
            {/* ======================================================== */}
            <div className="flex flex-col items-center relative z-20">
              <div 
                onClick={() => {
                  const ref = makeFlattenedNode(rootNode.name, 1, [rootNode.name], rootNode);
                  onSelectNode(ref);
                  setShowG2(!showG2);
                }}
                className={`rounded-xl px-7 py-3 text-center min-w-[240px] max-w-[300px] cursor-pointer group transition-all duration-200 ease-out transform hover:scale-105 relative z-10 border ${
                  isLight
                    ? 'bg-white border-sky-500 shadow-sm text-slate-900'
                    : 'bg-slate-900 border-sky-400 shadow-sm text-white'
                } ${
                  selectedNode?.name === rootNode.name ? (isLight ? 'ring-2 ring-sky-500' : 'ring-2 ring-sky-400') : ''
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={`font-mono text-[11px] font-medium ${isLight ? 'text-amber-800' : 'text-amber-300'}`}>
                    ፩ · ዋነኛ አባት
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const ref = makeFlattenedNode(rootNode.name, 1, [rootNode.name], rootNode);
                      onEditNode(ref);
                    }}
                    className={`opacity-0 group-hover:opacity-100 p-0.5 transition-opacity ${
                      isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-white'
                    }`}
                    title="ስም አስተካክል"
                  >
                    <Edit3 size={11} />
                  </button>
                </div>

                <h2 className={`text-3xl font-black tracking-tight my-0.5 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  {getCleanName(rootNode.name)}
                </h2>

                <div className={`mt-2 flex items-center justify-center gap-1.5 text-xs font-medium ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  <span>፯ ቅርንጫፎች</span>
                  {showG2 ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </div>
              </div>

              {/* Vertical connector dropping from bottom of G1 */}
              {showG2 && (
                <div className={`w-[2px] h-10 relative ${
                  isLight ? 'bg-sky-500' : 'bg-sky-400'
                }`}>
                  <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full z-10 ${
                    isLight ? 'bg-sky-500' : 'bg-sky-400'
                  }`} />
                </div>
              )}
            </div>

            {/* ======================================================== */}
            {/* TIER 2: G2 CHILDREN (7 BRANCHES IN A FIXED ROW)          */}
            {/* ======================================================== */}
            {showG2 && (
              <div className="flex flex-col items-center w-full relative z-10">
                {/* 7 G2 Column Slots */}
                <div className="flex flex-row items-start justify-center gap-6 pt-0">
                  {g2Children.map((child, idx) => {
                    const isActive = activeG2Index === idx;
                    const cleanName = getCleanName(child.name);
                    const isUncertain = child.name.includes('[?]');
                    const directKids = child.children?.length || 0;
                    const path = [rootNode.name, child.name];
                    const nodeKey = path.join('-');
                    const isSelected = selectedNode?.name === child.name;
                    const isSearchMatch = searchQuery.trim() !== '' && 
                      (child.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       cleanName.toLowerCase().includes(searchQuery.toLowerCase()));

                    return (
                      <div 
                        key={idx} 
                        className="w-[185px] flex flex-col items-center relative z-10 hover:z-40"
                      >
                        {/* Continuous Horizontal Bus Bar across the columns */}
                        <div className="relative w-full flex justify-center">
                          {idx > 0 && (
                            <div className={`absolute top-0 right-1/2 left-[-24px] h-[2px] ${
                              isActive 
                                ? (isLight ? 'bg-sky-500' : 'bg-sky-400') 
                                : (isLight ? 'bg-slate-300' : 'bg-slate-800')
                            }`} />
                          )}
                          {idx < g2Children.length - 1 && (
                            <div className={`absolute top-0 left-1/2 right-[-24px] h-[2px] ${
                              isActive 
                                ? (isLight ? 'bg-sky-500' : 'bg-sky-400') 
                                : (isLight ? 'bg-slate-300' : 'bg-slate-800')
                            }`} />
                          )}
                          <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${
                            isActive 
                              ? (isLight ? 'bg-sky-500' : 'bg-sky-400') 
                              : (isLight ? 'bg-slate-400' : 'bg-slate-600')
                          }`} />
                          <div className={`w-[2px] transition-all duration-200 ${
                            isActive 
                              ? (isLight ? 'h-16 bg-sky-500' : 'h-16 bg-sky-400') 
                              : (isLight ? 'h-8 bg-slate-300' : 'h-8 bg-slate-800')
                          }`} />
                        </div>

                        {/* G2 Card */}
                        <div
                          onClick={() => {
                            const ref = makeFlattenedNode(child.name, 2, path, child);
                            onSelectNode(ref);
                            if (isActive) {
                              setActiveG2Index(null);
                              setActiveG3Index(null);
                            } else {
                              setActiveG2Index(idx);
                              setActiveG3Index(null);
                            }
                          }}
                          onMouseEnter={() => setHoveredKey(nodeKey)}
                          onMouseLeave={() => setHoveredKey(null)}
                          className={`w-full rounded-xl p-3 flex flex-col items-center transition-all duration-200 cursor-pointer group border ${
                            isActive
                              ? isLight
                                ? 'bg-sky-50/70 border-sky-500 shadow-sm text-slate-900'
                                : 'bg-slate-900 border-sky-400 shadow-sm text-white'
                              : isLight
                                ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-sm'
                                : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-100 shadow-sm'
                          } ${
                            isSearchMatch ? (isLight ? 'ring-2 ring-amber-500 border-amber-500' : 'ring-2 ring-amber-400 border-amber-400') : ''
                          } ${
                            isSelected && !isActive ? (isLight ? 'ring-2 ring-sky-500' : 'ring-2 ring-sky-400') : ''
                          }`}
                        >
                          <div className="flex items-center justify-between w-full text-[11px] mb-1">
                            <span className={`font-mono ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                              {GEEZ_NUMS[idx]}
                            </span>

                            <div className="flex items-center gap-1">
                              {isUncertain && (
                                <span className={`text-[10px] font-mono px-1 rounded ${
                                  isLight ? 'text-amber-700 bg-amber-50' : 'text-amber-300 bg-amber-500/15'
                                }`}>
                                  [?]
                                </span>
                              )}

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const ref = makeFlattenedNode(child.name, 2, path, child);
                                  onEditNode(ref);
                                }}
                                className={`opacity-0 group-hover:opacity-100 p-0.5 transition-opacity ${
                                  isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-white'
                                }`}
                                title="ስም አስተካክል"
                              >
                                <Edit3 size={11} />
                              </button>
                            </div>
                          </div>

                          <div className={`text-[19px] sm:text-[21px] font-extrabold text-center my-1 leading-tight tracking-tight ${
                            isLight ? 'text-slate-900' : 'text-white'
                          }`}>
                            {cleanName}
                          </div>

                          {directKids > 0 && (
                            <div className={`mt-1.5 flex items-center gap-1 text-[11px] font-medium transition-colors ${
                              isActive 
                                ? (isLight ? 'text-sky-700' : 'text-sky-300') 
                                : (isLight ? 'text-slate-400 group-hover:text-slate-600' : 'text-slate-500 group-hover:text-slate-300')
                            }`}>
                              <span>{directKids} ልጆች</span>
                              {isActive ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </div>
                          )}
                        </div>

                        {/* DIRECT DESCENDANT G3 BLOCK - PERFECTLY ALIGNED AND DESCENDED UNDER THIS G2 CARD */}
                        {isActive && g3Children.length > 0 && (
                          <div className="flex flex-col items-center w-full relative z-20">
                            {/* Vertical connector line dropping straight down from bottom center of this active G2 card */}
                            <div className={`w-[2px] h-10 relative ${
                              isLight ? 'bg-sky-500' : 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.7)]'
                            }`}>
                              <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${
                                isLight ? 'bg-sky-500' : 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.9)]'
                              }`} />
                              <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2.5 h-2.5 rounded-full z-20 ${
                                isLight ? 'bg-sky-500 shadow-sm' : 'bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.9)]'
                              }`} />
                            </div>

                            {/* G3 Row Container - absolute centered under this card so siblings never shift horizontally */}
                            <div className="absolute top-10 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto min-w-max z-20">
                              <div className="flex flex-row items-start justify-center gap-3 sm:gap-4 pt-0">
                                {g3Children.map((g3Child, g3Idx) => {
                                  const isG3Active = activeG3Index === g3Idx;
                                  const g3CleanName = getCleanName(g3Child.name);
                                  const isG3Uncertain = g3Child.name.includes('[?]');
                                  const g3DirectKids = g3Child.children?.length || 0;
                                  const g3HasKids = g3DirectKids > 0;
                                  const g3Path = [rootNode.name, child.name, g3Child.name];
                                  const g3NodeKey = g3Path.join('-');
                                  const isG3Selected = selectedNode?.name === g3Child.name;
                                  const isG3SearchMatch = searchQuery.trim() !== '' && 
                                    (g3Child.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                     g3CleanName.toLowerCase().includes(searchQuery.toLowerCase()));

                                  return (
                                    <div 
                                      key={g3Idx}
                                      className="w-[155px] flex flex-col items-center relative z-10 hover:z-40"
                                    >
                                      {/* Horizontal Bus Line across G3 row */}
                                      <div className="relative w-full flex justify-center">
                                        {g3Idx > 0 && (
                                          <div className={`absolute top-0 right-1/2 left-[-12px] sm:left-[-16px] h-[2px] ${
                                            isG3Active 
                                              ? (isLight ? 'bg-purple-600' : 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.7)]') 
                                              : (isLight ? 'bg-sky-500' : 'bg-sky-400/80 shadow-[0_0_6px_rgba(56,189,248,0.5)]')
                                          }`} />
                                        )}
                                        {g3Idx < g3Children.length - 1 && (
                                          <div className={`absolute top-0 left-1/2 right-[-12px] sm:right-[-16px] h-[2px] ${
                                            isG3Active 
                                              ? (isLight ? 'bg-purple-600' : 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.7)]') 
                                              : (isLight ? 'bg-sky-500' : 'bg-sky-400/80 shadow-[0_0_6px_rgba(56,189,248,0.5)]')
                                          }`} />
                                        )}
                                        <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${
                                          isG3Active 
                                            ? (isLight ? 'bg-purple-600' : 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.9)]') 
                                            : (isLight ? 'bg-sky-500' : 'bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.8)]')
                                        }`} />
                                        {/* Stem dropping down into G3 card */}
                                        <div className={`w-[2px] transition-all duration-200 ${
                                          isG3Active 
                                            ? (isLight ? 'h-16 bg-purple-600' : 'h-16 bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.7)]') 
                                            : (isLight ? 'h-8 bg-sky-500' : 'h-8 bg-sky-400/80')
                                        }`} />
                                      </div>

                                      {/* G3 Card with Magnifying Effect on Hover */}
                                      <div
                                        onClick={() => {
                                          const ref = makeFlattenedNode(g3Child.name, 3, g3Path, g3Child);
                                          onSelectNode(ref);
                                          if (g3HasKids) {
                                            if (isG3Active) {
                                              setActiveG3Index(null);
                                            } else {
                                              setActiveG3Index(g3Idx);
                                            }
                                          }
                                        }}
                                        onMouseEnter={() => setHoveredKey(g3NodeKey)}
                                        onMouseLeave={() => setHoveredKey(null)}
                                        className={`w-full rounded-xl p-2.5 flex flex-col items-center transition-all duration-200 cursor-pointer group border ${
                                          isG3Active
                                            ? isLight
                                              ? 'bg-purple-50/70 border-purple-500 shadow-sm text-slate-900'
                                              : 'bg-slate-900 border-purple-400 shadow-sm text-white'
                                            : isLight
                                              ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-sm'
                                              : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-100 shadow-sm'
                                        } ${
                                          isG3SearchMatch ? (isLight ? 'ring-2 ring-amber-500 border-amber-500' : 'ring-2 ring-amber-400 border-amber-400') : ''
                                        } ${
                                          isG3Selected && !isG3Active ? (isLight ? 'ring-2 ring-sky-500' : 'ring-2 ring-sky-400') : ''
                                        }`}
                                      >
                                        <div className="flex items-center justify-between w-full text-[10px] mb-1">
                                          <span className={`font-mono ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                                            G3
                                          </span>

                                          <div className="flex items-center gap-1">
                                            {isG3Uncertain && (
                                              <span className={`text-[10px] font-mono px-1 rounded ${
                                                isLight ? 'text-amber-700 bg-amber-50' : 'text-amber-300 bg-amber-500/15'
                                              }`}>
                                                [?]
                                              </span>
                                            )}

                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                const ref = makeFlattenedNode(g3Child.name, 3, g3Path, g3Child);
                                                onEditNode(ref);
                                              }}
                                              className={`opacity-0 group-hover:opacity-100 p-0.5 transition-opacity ${
                                                isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-white'
                                              }`}
                                              title="ስም አስተካክል"
                                            >
                                              <Edit3 size={11} />
                                            </button>
                                          </div>
                                        </div>

                                        <div className={`text-[16px] sm:text-[17.5px] font-bold text-center my-1 leading-tight tracking-tight ${
                                          isLight ? 'text-slate-900' : 'text-white'
                                        }`}>
                                          {g3CleanName}
                                        </div>

                                        {g3HasKids && (
                                          <div className={`mt-1 flex items-center gap-1 text-[10px] font-medium transition-colors ${
                                            isG3Active 
                                              ? (isLight ? 'text-purple-700' : 'text-purple-300') 
                                              : (isLight ? 'text-slate-400 group-hover:text-slate-600' : 'text-slate-500 group-hover:text-slate-300')
                                          }`}>
                                            <span>{g3DirectKids} ልጆች</span>
                                            {isG3Active ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                                          </div>
                                        )}
                                      </div>

                                      {/* DIRECT DESCENDANT G4 BLOCK - PERFECTLY ALIGNED AND DESCENDED UNDER THIS G3 CARD */}
                                      {isG3Active && g4Children.length > 0 && (
                                        <div className="flex flex-col items-center w-full relative z-30">
                                          {/* Vertical connector line dropping straight down from bottom center of this active G3 card */}
                                          <div className={`w-[2px] h-10 relative ${
                                            isLight ? 'bg-purple-600' : 'bg-purple-400'
                                          }`}>
                                            <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${
                                              isLight ? 'bg-purple-600' : 'bg-purple-400'
                                            }`} />
                                            <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2.5 h-2.5 rounded-full z-20 ${
                                              isLight ? 'bg-purple-600' : 'bg-purple-400'
                                            }`} />
                                          </div>

                                          {/* G4 Row Container - absolute centered under this G3 card */}
                                          <div className="absolute top-10 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto min-w-max z-30">
                                            <div className="flex flex-row items-start justify-center gap-2.5 sm:gap-3 pt-0">
                                              {g4Children.map((g4Child, g4Idx) => {
                                                const g4CleanName = getCleanName(g4Child.name);
                                                const isG4Uncertain = g4Child.name.includes('[?]');
                                                const g4Path = [rootNode.name, child.name, g3Child.name, g4Child.name];
                                                const g4NodeKey = g4Path.join('-');
                                                const isG4Selected = selectedNode?.name === g4Child.name;
                                                const isG4SearchMatch = searchQuery.trim() !== '' && 
                                                  (g4Child.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                                   g4CleanName.toLowerCase().includes(searchQuery.toLowerCase()));

                                                return (
                                                  <div 
                                                    key={g4Idx} 
                                                    className="w-[135px] flex flex-col items-center relative z-10 hover:z-40"
                                                  >
                                                    {/* Horizontal Bus Line across G4 row */}
                                                    <div className="relative w-full flex justify-center">
                                                      {g4Idx > 0 && (
                                                        <div className={`absolute top-0 right-1/2 left-[-10px] sm:left-[-12px] h-[2px] ${
                                                          isLight ? 'bg-purple-400' : 'bg-purple-500'
                                                        }`} />
                                                      )}
                                                      {g4Idx < g4Children.length - 1 && (
                                                        <div className={`absolute top-0 left-1/2 right-[-10px] sm:right-[-12px] h-[2px] ${
                                                          isLight ? 'bg-purple-400' : 'bg-purple-500'
                                                        }`} />
                                                      )}
                                                      <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${
                                                        isLight ? 'bg-purple-500' : 'bg-purple-400'
                                                      }`} />
                                                      <div className={`w-[2px] h-8 ${
                                                        isLight ? 'bg-purple-400' : 'bg-purple-500'
                                                      }`} />
                                                    </div>

                                                    {/* G4 Leaf Card */}
                                                    <div
                                                      onClick={() => {
                                                        const ref = makeFlattenedNode(g4Child.name, 4, g4Path, g4Child);
                                                        onSelectNode(ref);
                                                      }}
                                                      onMouseEnter={() => setHoveredKey(g4NodeKey)}
                                                      onMouseLeave={() => setHoveredKey(null)}
                                                      className={`w-full rounded-xl p-2.5 flex flex-col items-center transition-all duration-200 cursor-pointer group border ${
                                                        isLight
                                                          ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-sm'
                                                          : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-100 shadow-sm'
                                                      } ${
                                                        isG4SearchMatch ? (isLight ? 'ring-2 ring-amber-500 border-amber-500' : 'ring-2 ring-amber-400 border-amber-400') : ''
                                                      } ${
                                                        isG4Selected ? (isLight ? 'ring-2 ring-purple-500 border-purple-500' : 'ring-2 ring-purple-400 border-purple-400') : ''
                                                      }`}
                                                    >
                                                      <div className="flex items-center justify-between w-full text-[10px] mb-1">
                                                        <span className={`font-mono ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                                                          G4
                                                        </span>

                                                        <div className="flex items-center gap-1">
                                                          {isG4Uncertain && (
                                                            <span className={`text-[10px] font-mono px-1 rounded ${
                                                              isLight ? 'text-amber-700 bg-amber-50' : 'text-amber-300 bg-amber-500/15'
                                                            }`}>
                                                              [?]
                                                            </span>
                                                          )}

                                                          <button
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              const ref = makeFlattenedNode(g4Child.name, 4, g4Path, g4Child);
                                                              onEditNode(ref);
                                                            }}
                                                            className={`opacity-0 group-hover:opacity-100 p-0.5 transition-opacity ${
                                                              isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-white'
                                                            }`}
                                                            title="ስም አስተካክል"
                                                          >
                                                            <Edit3 size={11} />
                                                          </button>
                                                        </div>
                                                      </div>

                                                      <div className={`text-[15px] sm:text-[16px] font-bold text-center my-0.5 leading-tight tracking-tight ${
                                                        isLight ? 'text-slate-900' : 'text-white'
                                                      }`}>
                                                        {g4CleanName}
                                                      </div>
                                                    </div>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* In-flow vertical spacer so the tree container expands naturally for the descended G3 and G4 */}
                            <div 
                              style={{ 
                                height: activeG3Index !== null && g4Children.length > 0 ? 540 : 250 
                              }} 
                              className="w-[1px] pointer-events-none" 
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
