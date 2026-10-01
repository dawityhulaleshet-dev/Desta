import React, { useState, useRef, useMemo } from 'react';
import { FamilyNode } from './destaFamilyData';
import { FlattenedNode, getCleanName, TreeStats } from './familyUtils';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Printer, 
  Search, 
  Sparkles, 
  Edit3, 
  Compass,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';

interface ArtisticVisualTreeProps {
  rootNode: FamilyNode;
  selectedNode: FlattenedNode | null;
  onSelectNode: (node: FlattenedNode) => void;
  onEditNode: (node: FlattenedNode) => void;
  stats: TreeStats;
  theme?: 'dark' | 'light';
  onOpenPdfModal?: () => void;
}

interface VisualNode {
  flattened: FlattenedNode;
  x: number;
  y: number;
  r: number;
  branchIndex: number;
  circleNumber: number; // 1 to 7
  color: string;
  parentG3Id?: string;
}

// Ge'ez Numerals for children
const GEEZ_NUMS = ['፩', '፪', '፫', '፬', '፭', '፮', '፯'];

// Palette of branch colors for the 7 limbs
const BRANCH_PALETTES = [
  { main: '#f59e0b', name: 'ተስፋዬ ደስታ', glow: '#fbbf24' },        // 1: Middle Left
  { main: '#10b981', name: 'አቶ አያሌው ደስታ', glow: '#34d399' },      // 2: Upper Left
  { main: '#38bdf8', name: 'አቶ ሳይኮን ደስታ', glow: '#7dd3fc' },      // 3: Crown Apex
  { main: '#f43f5e', name: 'አቶ አብርሃም ደስታ', glow: '#fb7185' },     // 4: Lower Left
  { main: '#a855f7', name: 'ወ/ሮ እጅጋየሁ ደስታ', glow: '#c084fc' },    // 5: Lower Right
  { main: '#06b6d4', name: 'ከበደ ደስታ', glow: '#67e8f9' },          // 6: Upper Right
  { main: '#eab308', name: 'ወንድሙ ደስታ', glow: '#fde047' }          // 7: Middle Right
];

// User's 21:9 fine art tree background
const TREE_BACKGROUND_IMAGE = "https://res.cloudinary.com/dhylipuur/image/upload/v1790861546/tree_2_nvpmnx.jpg";

// Exact 21:9 Skeleton Branch Placements from user's 21Asset 8ldpi.svg
// Coordinate Space: 2100 × 900 (21:9 Aspect Ratio)
// Desta (G1) centered on trunk at (1050, 760)
// Zero connection lines rendered - medallions sit directly on the painted tree branches
const SKELETON_CONFIGS = [
  // 1: Middle Left (ተስፋዬ ደስታ) - [1 G2] at (960, 500), 16 G3 nodes extending horizontally left
  {
    branchIdx: 0,
    circleNumber: 1,
    anchor: { x: 960, y: 500 },
    getG3Position: (t: number, idx: number) => {
      // Runs along middle left branch from x: 905 down to x: 395 at y ~ 500
      const x = 905 - t * 510;
      const y = 500 + (idx % 2 === 0 ? -11 : 11);
      return { x, y };
    },
    getG4Position: (g3X: number, g3Y: number, g4Idx: number, g4Total: number) => {
      const spread = g4Total > 1 ? (g4Idx - (g4Total - 1) / 2) * 22 : 0;
      return {
        x: g3X + spread,
        y: g3Y - 45 + (g4Idx % 2) * 16,
      };
    }
  },

  // 2: Upper Left (አቶ አያሌው ደስታ) - [2 G2] at (980, 290), 11 G3 nodes along upper left bough
  {
    branchIdx: 1,
    circleNumber: 2,
    anchor: { x: 980, y: 290 },
    getG3Position: (t: number, idx: number) => {
      // Runs along upper left branch from x: 925 down to x: 595, y sloping gently 280 to 325
      const x = 925 - t * 330;
      const y = 280 + 10 * Math.sin(Math.PI * t) + t * 40 + (idx % 2 === 0 ? -11 : 11);
      return { x, y };
    },
    getG4Position: (g3X: number, g3Y: number, g4Idx: number, g4Total: number) => {
      const spread = g4Total > 1 ? (g4Idx - (g4Total - 1) / 2) * 22 : 0;
      return {
        x: g3X + spread,
        y: g3Y - 45 + (g4Idx % 2) * 16,
      };
    }
  },

  // 3: Crown Apex (አቶ ሳይኮን ደስታ) - [3 G2] at (1050, 255), exactly 3 G3 nodes crowning the apex
  {
    branchIdx: 2,
    circleNumber: 3,
    anchor: { x: 1050, y: 255 },
    getG3Position: (t: number, idx: number) => {
      // Exact 3 circles crowning the apex prongs as requested
      if (idx === 0) return { x: 1025, y: 210 }; // Left prong
      if (idx === 1) return { x: 1050, y: 160 }; // Center top prong
      return { x: 1075, y: 210 };                // Right prong
    },
    getG4Position: (g3X: number, g3Y: number, g4Idx: number, g4Total: number) => {
      const spread = g4Total > 1 ? (g4Idx - (g4Total - 1) / 2) * 20 : 0;
      return {
        x: g3X + spread,
        y: g3Y - 42 + (g4Idx % 2) * 15,
      };
    }
  },

  // 4: Lower Left (አቶ አብርሃም ደስታ) - [4 G2] at (925, 635), G3 nodes along lower left bough
  {
    branchIdx: 3,
    circleNumber: 4,
    anchor: { x: 925, y: 635 },
    getG3Position: (t: number, idx: number) => {
      // Runs along lower left bough from x: 875 down to x: 470, starting at y ~ 635
      const x = 875 - t * 405;
      const y = 635 + 18 * Math.sin(Math.PI * 0.6 * t) - (t > 0.5 ? (t - 0.5) * 65 : 0) + (idx % 2 === 0 ? -11 : 11);
      return { x, y };
    },
    getG4Position: (g3X: number, g3Y: number, g4Idx: number, g4Total: number) => {
      const spread = g4Total > 1 ? (g4Idx - (g4Total - 1) / 2) * 22 : 0;
      return {
        x: g3X + spread,
        y: g3Y + 45 - (g4Idx % 2) * 16,
      };
    }
  },

  // 5: Lower Right (ወ/ሮ እጅጋየሁ ደስታ) - [5 G2] at (1175, 650), G3 nodes curving along lower right bough
  {
    branchIdx: 4,
    circleNumber: 5,
    anchor: { x: 1175, y: 650 },
    getG3Position: (t: number, idx: number) => {
      // Runs along lower right bough from x: 1235 out to x: 1720, starting at y ~ 635-650
      const x = 1235 + t * 485;
      const y = 635 + 28 * Math.sin(Math.PI * 0.6 * t) - (t > 0.5 ? (t - 0.5) * 140 : 0) + (idx % 2 === 0 ? -11 : 11);
      return { x, y };
    },
    getG4Position: (g3X: number, g3Y: number, g4Idx: number, g4Total: number) => {
      const spread = g4Total > 1 ? (g4Idx - (g4Total - 1) / 2) * 22 : 0;
      return {
        x: g3X + spread,
        y: g3Y + 45 - (g4Idx % 2) * 16,
      };
    }
  },

  // 6: Upper Right (ከበደ ደስታ) - [6 G2] at (1125, 300), 10 G3 nodes along upper right bough
  {
    branchIdx: 5,
    circleNumber: 6,
    anchor: { x: 1125, y: 300 },
    getG3Position: (t: number, idx: number) => {
      // Runs along upper right bough from x: 1180 to x: 1640, y sloping gently 295 to 345
      const x = 1180 + t * 460;
      const y = 295 + t * 45 + (idx % 2 === 0 ? -11 : 11);
      return { x, y };
    },
    getG4Position: (g3X: number, g3Y: number, g4Idx: number, g4Total: number) => {
      const spread = g4Total > 1 ? (g4Idx - (g4Total - 1) / 2) * 22 : 0;
      return {
        x: g3X + spread,
        y: g3Y - 45 + (g4Idx % 2) * 16,
      };
    }
  },

  // 7: Middle Right (ወንድሙ ደስታ) - [7 G2] at (1140, 520), 9 G3 nodes along middle right bough
  {
    branchIdx: 6,
    circleNumber: 7,
    anchor: { x: 1140, y: 520 },
    getG3Position: (t: number, idx: number) => {
      // Runs horizontally along middle right branch from x: 1200 out to x: 1780 at y ~ 520
      const x = 1200 + t * 580;
      const y = 520 + (idx % 2 === 0 ? -11 : 11);
      return { x, y };
    },
    getG4Position: (g3X: number, g3Y: number, g4Idx: number, g4Total: number) => {
      const spread = g4Total > 1 ? (g4Idx - (g4Total - 1) / 2) * 22 : 0;
      return {
        x: g3X + spread,
        y: g3Y - 45 + (g4Idx % 2) * 16,
      };
    }
  }
];

export const ArtisticVisualTree: React.FC<ArtisticVisualTreeProps> = ({
  rootNode,
  selectedNode,
  onSelectNode,
  onEditNode,
  stats,
  theme = 'dark',
  onOpenPdfModal,
}) => {
  const isLight = theme === 'light';

  // Canvas zoom & pan state
  const [scale, setScale] = useState<number>(1.0);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Interactive filters
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [activeGeneration, setActiveGeneration] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // G4 is omitted/hidden by default until a G3 node is clicked
  const [expandedG3Ids, setExpandedG3Ids] = useState<Set<string>>(new Set());

  const containerRef = useRef<HTMLDivElement>(null);

  // Compute exact coordinates for 21:9 Canvas matching 21Asset 8ldpi.svg
  const visualNodes = useMemo(() => {
    const nodes: VisualNode[] = [];

    // Root (ደስታ) firmly anchored on the lower central trunk heartwood at (1050, 760)
    const rootX = 1050;
    const rootY = 760;
    const rootFlattened: FlattenedNode = {
      id: 'root-desta',
      name: rootNode.name,
      isUncertain: rootNode.name.includes('[?]'),
      generation: 1,
      path: [rootNode.name],
      parentId: null,
      childrenCount: rootNode.children ? rootNode.children.length : 0,
      nodeRef: rootNode,
    };

    nodes.push({
      flattened: rootFlattened,
      x: rootX,
      y: rootY,
      r: 34,
      branchIndex: -1,
      circleNumber: 0,
      color: '#fbbf24',
    });

    const children = rootNode.children || [];

    children.forEach((child, bIdx) => {
      const cfg = SKELETON_CONFIGS[bIdx] || SKELETON_CONFIGS[0];
      const branchColor = BRANCH_PALETTES[bIdx % BRANCH_PALETTES.length].main;

      // 1. Child Medallion placed at circular marker (1 to 7)
      const childFlattened: FlattenedNode = {
        id: `branch-${bIdx}`,
        name: child.name,
        isUncertain: child.name.includes('[?]'),
        generation: 2,
        path: [rootNode.name, child.name],
        parentId: 'root-desta',
        childrenCount: child.children ? child.children.length : 0,
        nodeRef: child,
      };

      nodes.push({
        flattened: childFlattened,
        x: cfg.anchor.x,
        y: cfg.anchor.y,
        r: 24,
        branchIndex: bIdx,
        circleNumber: cfg.circleNumber,
        color: branchColor,
      });

      // 2. Position G3 (Grandchildren) along the branch bough corridor
      const g3Children = child.children || [];
      const g3Count = g3Children.length;

      g3Children.forEach((g3Node, g3Idx) => {
        const t = g3Count > 1 ? g3Idx / (g3Count - 1) : 0.5;
        const g3Pos = cfg.getG3Position(t, g3Idx);

        const g3Flattened: FlattenedNode = {
          id: `g3-${bIdx}-${g3Idx}`,
          name: g3Node.name,
          isUncertain: g3Node.name.includes('[?]'),
          generation: 3,
          path: [rootNode.name, child.name, g3Node.name],
          parentId: `branch-${bIdx}`,
          childrenCount: g3Node.children ? g3Node.children.length : 0,
          nodeRef: g3Node,
        };

        nodes.push({
          flattened: g3Flattened,
          x: g3Pos.x,
          y: g3Pos.y,
          r: 14,
          branchIndex: bIdx,
          circleNumber: cfg.circleNumber,
          color: branchColor,
        });

        // 3. Position G4 (Great-Grandchildren) along foliage rays (hidden until G3 clicked)
        const g4Children = g3Node.children || [];
        const g4Count = g4Children.length;

        g4Children.forEach((g4Node, g4Idx) => {
          const g4Pos = cfg.getG4Position(g3Pos.x, g3Pos.y, g4Idx, g4Count);

          const g4Flattened: FlattenedNode = {
            id: `g4-${bIdx}-${g3Idx}-${g4Idx}`,
            name: g4Node.name,
            isUncertain: g4Node.name.includes('[?]'),
            generation: 4,
            path: [rootNode.name, child.name, g3Node.name, g4Node.name],
            parentId: `g3-${bIdx}-${g3Idx}`,
            childrenCount: 0,
            nodeRef: g4Node,
          };

          nodes.push({
            flattened: g4Flattened,
            x: g4Pos.x,
            y: g4Pos.y,
            r: 12,
            branchIndex: bIdx,
            circleNumber: cfg.circleNumber,
            color: branchColor,
            parentG3Id: g3Flattened.id,
          });
        });
      });
    });

    return nodes;
  }, [rootNode]);

  // Selected Visual Node
  const selectedVisualNode = useMemo(() => {
    if (!selectedNode) return null;
    return visualNodes.find(vn => vn.flattened.name === selectedNode.name) || null;
  }, [selectedNode, visualNodes]);

  // Pan & Zoom handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input, .no-pan')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.92 : 1.08;
    setScale(prev => Math.min(2.5, Math.max(0.45, prev * zoomFactor)));
  };

  const handleResetView = () => {
    setScale(1.0);
    setPosition({ x: 0, y: 0 });
    setSelectedBranch(null);
    setActiveGeneration(0);
  };

  const focusOnNode = (vn: VisualNode) => {
    onSelectNode(vn.flattened);
    // If clicking a G3 node, toggle expansion of its G4 children
    if (vn.flattened.generation === 3) {
      setExpandedG3Ids(prev => {
        const next = new Set(prev);
        if (next.has(vn.flattened.id)) {
          next.delete(vn.flattened.id);
        } else {
          next.add(vn.flattened.id);
        }
        return next;
      });
    }
  };

  return (
    <div className={`relative w-full h-[85vh] min-h-[660px] rounded-3xl overflow-hidden border shadow-2xl flex flex-col select-none ${
      isLight ? 'bg-amber-950/5 border-amber-900/20' : 'bg-slate-950 border-amber-500/25'
    }`}>
      {/* 1. Header Overlay (Top Left Brand) */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none flex flex-col gap-1 max-w-sm sm:max-w-md">
        <div className="bg-slate-950/85 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-amber-500/35 shadow-xl pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-amber-500/20 text-amber-400">
              <Sparkles size={16} />
            </span>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-amber-300 font-serif">
              የደስታ ቤተሰብ (Desta Family)
            </h1>
          </div>
          <p className="text-[11px] text-amber-200/80 font-serif tracking-widest mt-0.5 uppercase">
            21:9 Widescreen Ancestral Canvas
          </p>
          <div className="flex items-center gap-2 text-[10px] text-amber-300/70 mt-1">
            <span>{stats.totalMembers} አባላት</span>
            <span>·</span>
            <span>፯ ዋና ቅርንጫፎች</span>
            <span>·</span>
            <span>{stats.maxGenerations} ትውልዶች</span>
          </div>
        </div>
      </div>

      {/* 2. Top Right Interactive Controls Palette */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2 max-w-md">
        {/* Search, Layer Toggle & Tool Buttons */}
        <div className="bg-slate-950/85 backdrop-blur-md p-1.5 rounded-2xl border border-amber-500/30 shadow-xl flex items-center gap-1.5">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-amber-400/70" />
            <input
              type="text"
              placeholder="አባል ፈልግ (Search)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-7 pr-6 py-1.5 rounded-xl bg-slate-900/90 border border-amber-500/20 text-amber-100 text-xs w-36 sm:w-44 focus:outline-none focus:border-amber-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-amber-400/60 hover:text-amber-300"
              >
                ✕
              </button>
            )}
          </div>

          {onOpenPdfModal && (
            <button
              onClick={onOpenPdfModal}
              className="px-2.5 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold flex items-center gap-1 transition-all active:scale-95"
              title="ሥዕሉን ወይም ሪፖርቱን አትም (Print/Export Artwork)"
            >
              <Printer size={13} />
              <span className="hidden sm:inline">አትም</span>
            </button>
          )}

          <button
            onClick={() => setScale(prev => Math.min(2.5, prev * 1.15))}
            className="p-1.5 rounded-xl border border-amber-500/20 bg-slate-900/80 hover:bg-amber-500/20 text-amber-300 transition-all active:scale-95"
            title="አቅርብ (Zoom in)"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={() => setScale(prev => Math.max(0.45, prev * 0.85))}
            className="p-1.5 rounded-xl border border-amber-500/20 bg-slate-900/80 hover:bg-amber-500/20 text-amber-300 transition-all active:scale-95"
            title="አርቅ (Zoom out)"
          >
            <ZoomOut size={14} />
          </button>
          <button
            onClick={handleResetView}
            className="p-1.5 rounded-xl border border-amber-500/20 bg-slate-900/80 hover:bg-amber-500/20 text-amber-300 transition-all active:scale-95"
            title="መሃል አድርግ (Reset View)"
          >
            <RotateCcw size={14} />
          </button>
        </div>

        {/* 7 Branch Quick Filter Pills (1 to 7) */}
        <div className="bg-slate-950/85 backdrop-blur-md p-1 rounded-xl border border-amber-500/20 shadow-lg flex items-center gap-1 flex-wrap justify-end">
          <button
            onClick={() => setSelectedBranch(null)}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all ${
              selectedBranch === null
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'text-amber-200/70 hover:text-white hover:bg-slate-800'
            }`}
          >
            ሁሉም ቅርንጫፎች (All)
          </button>
          {BRANCH_PALETTES.map((bp, idx) => {
            const isSelected = selectedBranch === idx;
            const num = idx + 1;
            const geez = GEEZ_NUMS[idx] || `${num}`;
            return (
              <button
                key={idx}
                onClick={() => setSelectedBranch(isSelected ? null : idx)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all border flex items-center gap-0.5 ${
                  isSelected
                    ? 'bg-white text-slate-950 border-white shadow-xs font-bold'
                    : 'text-amber-100/80 border-amber-500/20 hover:bg-slate-800'
                }`}
                style={{
                  backgroundColor: isSelected ? bp.main : undefined,
                  color: isSelected ? '#ffffff' : undefined,
                  borderColor: isSelected ? bp.main : undefined
                }}
                title={`ቅርንጫፍ ${num} (${geez}): ${bp.name}`}
              >
                <span className="font-mono text-[9px] font-bold">[{num}]</span>
                <span>{geez}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Pan & Zoom Botanical Canvas with High-Res Tree Backdrop (21:9 Ratio) */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className={`w-full h-full cursor-grab active:cursor-grabbing overflow-hidden relative ${
          isDragging ? 'cursor-grabbing' : ''
        }`}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.12s ease-out',
          }}
          className="w-[2100px] h-[900px] relative pointer-events-auto"
        >
          {/* A. High-Res Fine Art Tree Image Background (21:9) */}
          <img 
            src={TREE_BACKGROUND_IMAGE}
            alt="Desta Family Ancestral Tree"
            className="w-full h-full object-cover select-none pointer-events-none absolute inset-0"
            referrerPolicy="no-referrer"
          />

          {/* Vignette overlay */}
          <div className="absolute inset-0 bg-radial from-transparent via-black/10 to-black/35 pointer-events-none" />

          {/* B. Medallions Layer - No synthetic connection lines, medallions rest directly on tree limbs */}
          <div className="absolute inset-0 pointer-events-none">
            {visualNodes.map((vn) => {
              const isG4 = vn.flattened.generation === 4;
              // Omit / hide G4 by default until parent G3 is clicked / expanded
              if (isG4) {
                const isG4Visible = vn.parentG3Id && (
                  expandedG3Ids.has(vn.parentG3Id) ||
                  (selectedVisualNode && selectedVisualNode.flattened.id === vn.parentG3Id) ||
                  activeGeneration === 4
                );
                if (!isG4Visible) return null;
              }

              const clean = getCleanName(vn.flattened.name);
              const isSelected = selectedVisualNode?.flattened.id === vn.flattened.id;
              const isHovered = hoveredNodeId === vn.flattened.id;

              // Filter checks
              const matchesSearch = searchQuery 
                ? clean.toLowerCase().includes(searchQuery.toLowerCase()) || vn.flattened.name.includes(searchQuery)
                : true;

              const matchesBranch = selectedBranch === null || vn.branchIndex === -1 || vn.branchIndex === selectedBranch;
              const matchesGen = activeGeneration === 0 || vn.flattened.generation === activeGeneration;

              const isMuted = !matchesSearch || !matchesBranch || !matchesGen;
              const isRoot = vn.flattened.generation === 1;
              const isChild = vn.flattened.generation === 2;
              const isG3 = vn.flattened.generation === 3;

              const diameter = vn.r * 2;

              return (
                <div
                  key={vn.flattened.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    focusOnNode(vn);
                  }}
                  onMouseEnter={() => setHoveredNodeId(vn.flattened.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  style={{
                    left: `${vn.x - vn.r}px`,
                    top: `${vn.y - vn.r}px`,
                    width: `${diameter}px`,
                    height: `${diameter}px`,
                  }}
                  className={`absolute pointer-events-auto cursor-pointer rounded-full flex flex-col items-center justify-center transition-all duration-300 ${
                    isMuted ? 'opacity-20 scale-90 filter grayscale' : 'opacity-100 hover:scale-115'
                  } ${
                    isSelected ? 'scale-125 z-30 ring-4 ring-amber-400 ring-offset-2 ring-offset-slate-950 shadow-2xl' : 'z-10'
                  }`}
                  title={`${isChild ? `[${vn.circleNumber}] ` : ''}${vn.flattened.name} (ትውልድ ${vn.flattened.generation})`}
                >
                  {/* Medallion Shell: Transparent Glass styled according to Generation and G2 Branch Color */}
                  {isRoot ? (
                    // Root Patriarch with Crown at (1050, 760)
                    <div 
                      style={{
                        boxShadow: isSelected 
                          ? '0 0 32px rgba(251, 191, 36, 1), 0 0 16px #f59e0b' 
                          : isHovered 
                            ? '0 0 24px rgba(251, 191, 36, 0.9)' 
                            : '0 0 28px rgba(245, 158, 11, 0.95), 0 4px 18px rgba(0, 0, 0, 0.95)',
                        background: 'linear-gradient(135deg, #fef08a 0%, #d97706 45%, #78350f 100%)',
                      }}
                      className="w-full h-full rounded-full p-1 border-2 border-amber-200 flex items-center justify-center relative overflow-hidden"
                    >
                      <div className="w-full h-full rounded-full bg-stone-950/90 border border-amber-500/50 flex items-center justify-center relative shadow-inner overflow-hidden">
                        <svg viewBox="0 0 40 40" className="w-4/5 h-4/5 text-amber-200/90 fill-current opacity-95 drop-shadow">
                          <circle cx="20" cy="14" r="7.5" />
                          <path d="M11,35 C11,26 15,22 20,22 C25,22 29,26 29,35 Z" />
                          <path d="M14,16 Q20,25 26,16 Q20,29 14,16 Z" fill="#eab308" />
                        </svg>
                      </div>
                    </div>
                  ) : isChild ? (
                    // G2 Child: Signature Branch Medallion with G2 Color & Badge
                    <div 
                      style={{
                        boxShadow: isSelected 
                          ? `0 0 32px ${vn.color}, 0 0 16px #ffffff` 
                          : isHovered 
                            ? `0 0 22px ${vn.color}` 
                            : `0 0 16px rgba(0, 0, 0, 0.9), 0 0 12px ${vn.color}90`,
                        background: `linear-gradient(135deg, #fef08a 0%, ${vn.color} 50%, #451a03 100%)`,
                      }}
                      className="w-full h-full rounded-full p-0.5 border border-amber-200 flex items-center justify-center relative overflow-hidden"
                    >
                      <div className="w-full h-full rounded-full bg-stone-950/85 border border-amber-500/50 flex items-center justify-center relative shadow-inner overflow-hidden backdrop-blur-xs">
                        <svg viewBox="0 0 40 40" className="w-4/5 h-4/5 text-amber-200/90 fill-current opacity-95 drop-shadow">
                          <circle cx="20" cy="14" r="6.5" />
                          <path d="M13,34 C13,26 16,23 20,23 C24,23 27,26 27,34 Z" />
                        </svg>
                        {/* Circle Number Badge [1] to [7] */}
                        <div 
                          style={{ backgroundColor: vn.color }}
                          className="absolute top-0.5 left-0.5 px-1 rounded-full text-slate-950 font-black text-[9px] border border-white/70 shadow leading-tight"
                        >
                          {vn.circleNumber}
                        </div>
                        {vn.flattened.isUncertain && (
                          <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-amber-400 border border-slate-900 shadow" />
                        )}
                      </div>
                    </div>
                  ) : isG3 ? (
                    // G3 Grandchild: Transparent Glass Cameo Medallion matching G2 Branch Color
                    <div 
                      style={{
                        borderColor: `${vn.color}dd`,
                        background: `radial-gradient(circle at 35% 35%, ${vn.color}25 0%, rgba(15, 23, 42, 0.35) 85%)`,
                        boxShadow: isSelected 
                          ? `0 0 24px ${vn.color}, 0 0 10px #ffffff` 
                          : isHovered 
                            ? `0 0 16px ${vn.color}` 
                            : `0 0 10px ${vn.color}60, inset 0 0 6px ${vn.color}35`,
                      }}
                      className="w-full h-full rounded-full border-2 backdrop-blur-[2px] flex items-center justify-center relative overflow-hidden transition-all"
                    >
                      {/* Concentric subtle inner ring */}
                      <div 
                        style={{ borderColor: `${vn.color}66` }}
                        className="w-[82%] h-[82%] rounded-full border border-dashed flex items-center justify-center"
                      >
                        {/* Portrait Silhouette in G2 Color */}
                        <svg viewBox="0 0 40 40" className="w-3/4 h-3/4 drop-shadow" style={{ color: vn.color }}>
                          <circle cx="20" cy="14" r="6" fill="currentColor" fillOpacity="0.9" />
                          <path d="M13,34 C13,26 16,23 20,23 C24,23 27,26 27,34 Z" fill="currentColor" fillOpacity="0.9" />
                        </svg>
                      </div>
                      {vn.flattened.isUncertain && (
                        <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400 shadow" />
                      )}
                      {/* Interactive G4 children count toggle badge */}
                      {vn.flattened.childrenCount > 0 && (
                        <div 
                          style={{ backgroundColor: vn.color }}
                          className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full text-slate-950 font-black text-[8px] border border-white/80 shadow flex items-center justify-center leading-tight transition-transform hover:scale-125"
                          title={`${vn.flattened.childrenCount} ልጆች - ጠቅ ያድርጉ ለማየት/ለመደበቅ (Click to toggle G4 children)`}
                        >
                          <span>{expandedG3Ids.has(vn.flattened.id) ? '−' : `+${vn.flattened.childrenCount}`}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    // G4 Great-Grandchild: Distinct Transparent Dewdrop Ring with Sprout Blossom in G2 Color
                    <div 
                      style={{
                        borderColor: `${vn.color}bb`,
                        background: `radial-gradient(circle at 40% 40%, ${vn.color}20 0%, rgba(10, 15, 30, 0.25) 90%)`,
                        boxShadow: isSelected 
                          ? `0 0 20px ${vn.color}, 0 0 8px #ffffff` 
                          : isHovered 
                            ? `0 0 14px ${vn.color}` 
                            : `0 0 8px ${vn.color}45, inset 0 0 4px ${vn.color}30`,
                      }}
                      className="w-full h-full rounded-full border border-dashed backdrop-blur-[1.5px] ring-1 ring-white/20 flex items-center justify-center relative overflow-hidden transition-all"
                    >
                      {/* Distinct G4 Sprout / Leaf Blossom Icon in G2 Color */}
                      <svg viewBox="0 0 24 24" className="w-3/4 h-3/4 drop-shadow" style={{ color: vn.color }}>
                        <path
                          d="M12 21 C12 17 12 13 12 9 M12 9 C13 5 17 4 19 6 C19 9 16 11 12 11 M12 11 C11 14 7 15 5 13 C5 10 9 8 12 9"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeOpacity="0.95"
                        />
                        <circle cx="12" cy="7" r="1.5" fill="currentColor" fillOpacity="0.95" />
                      </svg>
                      {vn.flattened.isUncertain && (
                        <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400 shadow" />
                      )}
                    </div>
                  )}

                  {/* Brass Nameplate Banner below medallion with G2 color matching */}
                  <div 
                    style={{
                      borderColor: isG3 
                        ? `${vn.color}75` 
                        : isChild 
                          ? `${vn.color}aa` 
                          : `${vn.color}45`,
                    }}
                    className={`absolute -bottom-3.5 sm:-bottom-4 whitespace-nowrap px-1 py-0.2 rounded-md border text-center shadow-xl transition-all ${
                      isRoot
                        ? 'bg-amber-500 text-slate-950 font-black text-[11px] border-amber-300 ring-2 ring-amber-400 shadow-amber-500/50'
                        : isChild
                          ? 'bg-slate-950/90 text-amber-300 font-bold text-[9.5px] shadow-black backdrop-blur-xs'
                          : isG3
                            ? 'bg-slate-950/80 text-amber-100 font-medium text-[8px] backdrop-blur-sm shadow-md'
                            : 'bg-slate-950/75 text-amber-200/90 font-normal text-[7.5px] backdrop-blur-xs shadow-sm'
                    }`}
                  >
                    <span className={`truncate inline-block font-serif ${isG3 ? 'max-w-[70px]' : isChild ? 'max-w-[85px]' : 'max-w-[65px]'}`}>
                      {isChild && vn.branchIndex >= 0 ? `${GEEZ_NUMS[vn.branchIndex]}. ` : ''}
                      {clean}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* C. Antique Callout Card (When Member is Selected) */}
          {selectedVisualNode && (
            <div 
              style={{
                left: `${
                  selectedVisualNode.x > 1150
                    ? Math.max(30, selectedVisualNode.x - 340)
                    : Math.min(1760, selectedVisualNode.x + 45)
                }px`,
                top: `${Math.min(640, Math.max(50, selectedVisualNode.y - 70))}px`,
              }}
              className="absolute z-40 w-72 sm:w-80 bg-stone-900/95 backdrop-blur-md rounded-2xl border-2 border-amber-500/60 p-4 shadow-2xl text-amber-100 flex flex-col gap-2.5 font-serif no-pan pointer-events-auto"
            >
              {/* Header with Close */}
              <div className="flex items-start justify-between border-b border-amber-500/30 pb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center shrink-0">
                    <span className="text-base font-bold text-amber-300">
                      {selectedVisualNode.flattened.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-amber-200 tracking-tight leading-snug">
                      {getCleanName(selectedVisualNode.flattened.name)}
                    </h3>
                    <span className="text-xs text-amber-400 font-sans">
                      ትውልድ {selectedVisualNode.flattened.generation} 
                      {selectedVisualNode.flattened.generation === 1 ? ' · መሥራች አባት (Patriarch)' : ''}
                      {selectedVisualNode.flattened.generation === 2 ? ` · ቅርንጫፍ [${selectedVisualNode.circleNumber}]` : ''}
                      {selectedVisualNode.flattened.generation === 3 ? ' · የልጅ ልጅ (Grandchild)' : ''}
                      {selectedVisualNode.flattened.generation === 4 ? ' · ቅድመ-ልጅ (Great-Grandchild)' : ''}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectNode(null as any)}
                  className="p-1 rounded-lg text-amber-400/60 hover:text-amber-200 hover:bg-stone-800 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Lineage Trail */}
              <div className="text-xs font-sans text-amber-200/80 bg-stone-950/60 p-2 rounded-xl border border-amber-500/20 flex flex-col gap-1">
                <span className="text-[10px] text-amber-400 uppercase tracking-wider font-semibold">
                  የትውልድ ሐረግ (Lineage Path):
                </span>
                <span className="font-mono text-[11px] leading-tight text-amber-100">
                  {selectedVisualNode.flattened.path.map(p => getCleanName(p)).join(' → ')}
                </span>
              </div>

              {/* Descendants & Status */}
              <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                <div className="p-2 rounded-xl bg-stone-950/40 border border-amber-500/20 flex flex-col">
                  <span className="text-[10px] text-amber-400/70">የልጆች ብዛት</span>
                  <span className="font-bold text-sm text-amber-200">
                    {selectedVisualNode.flattened.childrenCount}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-stone-950/40 border border-amber-500/20 flex flex-col">
                  <span className="text-[10px] text-amber-400/70">የስም ሁኔታ</span>
                  <span className={`font-semibold text-xs flex items-center gap-1 ${
                    selectedVisualNode.flattened.isUncertain ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {selectedVisualNode.flattened.isUncertain ? (
                      <>
                        <AlertCircle size={11} />
                        <span>ማረጋገጫ የሚሻ [?]</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={11} />
                        <span>የተረጋገጠ</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center gap-2 pt-1 border-t border-amber-500/20 font-sans flex-wrap">
                <button
                  onClick={() => onEditNode(selectedVisualNode.flattened)}
                  className="flex-1 py-1.5 px-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 text-xs font-semibold flex items-center justify-center gap-1 transition-all active:scale-95"
                >
                  <Edit3 size={12} />
                  <span>ስም አስተካክል (Edit)</span>
                </button>

                {selectedVisualNode.flattened.generation === 3 && selectedVisualNode.flattened.childrenCount > 0 && (
                  <button
                    onClick={() => {
                      const g3Id = selectedVisualNode.flattened.id;
                      setExpandedG3Ids(prev => {
                        const next = new Set(prev);
                        if (next.has(g3Id)) next.delete(g3Id);
                        else next.add(g3Id);
                        return next;
                      });
                    }}
                    className="py-1.5 px-2.5 rounded-xl border border-amber-400 bg-amber-500/25 hover:bg-amber-500/40 text-amber-200 text-xs font-semibold flex items-center justify-center gap-1 transition-all active:scale-95"
                  >
                    <span>
                      {expandedG3Ids.has(selectedVisualNode.flattened.id)
                        ? 'ልጆችን ደብቅ (Hide G4)'
                        : `ልጆችን አሳይ (+${selectedVisualNode.flattened.childrenCount})`}
                    </span>
                  </button>
                )}

                {selectedVisualNode.branchIndex >= 0 && (
                  <button
                    onClick={() => setSelectedBranch(selectedVisualNode.branchIndex)}
                    className="py-1.5 px-3 rounded-xl border border-amber-400 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all active:scale-95"
                  >
                    ቅርንጫፍ ለይ
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Generational Timeline Scrubber (Bottom Center Control) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-xl px-4 pointer-events-none">
        <div className="bg-slate-950/85 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-amber-500/40 shadow-2xl flex flex-col gap-1.5 pointer-events-auto">
          <div className="flex items-center justify-between text-[11px] text-amber-300 font-serif">
            <span className="flex items-center gap-1.5 font-bold">
              <Compass size={13} className="text-amber-400" />
              <span>የትውልድ ቅደም ተከተል (Timeline):</span>
            </span>
            <span className="text-[10px] text-amber-400/80 font-mono">
              {activeGeneration === 0 ? 'ሁሉንም በማሳየት ላይ' : `ትውልድ ${activeGeneration}`}
            </span>
          </div>

          {/* Stepped Timeline Track */}
          <div className="grid grid-cols-5 gap-1.5 pt-0.5">
            {[
              { gen: 0, label: 'ሁሉንም (All)', icon: '🌳' },
              { gen: 1, label: 'ግንድ (Desta)', icon: '👑' },
              { gen: 2, label: 'ልጆች (Branches)', icon: '🌿' },
              { gen: 3, label: 'የልጅ ልጆች', icon: '🍃' },
              { gen: 4, label: 'ቅድመ-ልጅ (Crown)', icon: '✨' },
            ].map(step => {
              const isActive = activeGeneration === step.gen;
              return (
                <button
                  key={step.gen}
                  onClick={() => setActiveGeneration(step.gen)}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 transition-all duration-150 active:scale-95 border ${
                    isActive
                      ? 'bg-amber-500 text-stone-950 border-amber-300 shadow-md font-bold'
                      : 'bg-stone-900/80 text-amber-200/80 border-amber-500/20 hover:bg-stone-800'
                  }`}
                >
                  <span className="text-xs">{step.icon}</span>
                  <span className="truncate">{step.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
