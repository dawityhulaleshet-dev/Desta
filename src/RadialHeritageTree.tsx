import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { FamilyNode } from './destaFamilyData';
import { FlattenedNode, getCleanName } from './familyUtils';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RotateCcw, 
  Info
} from 'lucide-react';

export interface RadialHeritageNode {
  id: string;
  name: string;
  cleanName: string;
  isUncertain: boolean;
  isBlank: boolean;
  generation: number; // 1 (Root), 2 (Ring 1), 3 (Ring 2), 4 (Ring 3), 5 (Ring 4/5)
  branchIndex: number;
  branchName: string;
  parentId: string | null;
  path: string[];
  nodeRef: FamilyNode;
  children: RadialHeritageNode[];
  startAngle: number;
  endAngle: number;
  innerRadius: number;
  outerRadius: number;
}

interface RadialHeritageTreeProps {
  rootNode: FamilyNode;
  flattenedNodes: FlattenedNode[];
  selectedNode: FlattenedNode | null;
  onSelectNode: (node: FlattenedNode) => void;
  selectedBranchIndex: number | null;
  highlightedNodeId: string | null;
}

const GEEZ_NUMS = ['፩', '፪', '፫', '፬', '፭', '፮', '፯', '፰'];

// Luxury Heritage Palette for the 8 Primary Branches
export const HERITAGE_BRANCH_THEMES = [
  { name: 'ስማኝ ደስታ', color: '#B8860B', border: '#7A5807', bg: '#FAF5E8', text: '#3E2D04' },       // 1. Dark Goldenrod
  { name: 'መንግስቱ ደስታ', color: '#8B2635', border: '#5C1822', bg: '#FDF1F2', text: '#400F17' },     // 2. Crimson Wine
  { name: 'ሳይኮን ደስታ', color: '#2B5B84', border: '#1C3B57', bg: '#EEF5FA', text: '#102436' },        // 3. Oxford Slate Blue
  { name: 'ዋለ ደስታ', color: '#3A6B56', border: '#254738', bg: '#EDF5F1', text: '#152C22' },          // 4. Heritage Forest Emerald
  { name: 'አድማስ ደስታ', color: '#8C5A32', border: '#5E3B20', bg: '#FBF4ED', text: '#3E2512' },       // 5. Warm Ochre Sienna
  { name: 'አለማየሁ ደስታ', color: '#6A4C7D', border: '#463153', bg: '#F6F0FA', text: '#2E1F38' },     // 6. Imperial Amethyst
  { name: 'ጤና ደስታ', color: '#4E6B70', border: '#33484C', bg: '#EEF4F5', text: '#1F2D30' },          // 7. Celadon Teal
  { name: 'ሲራክ ደስታ', color: '#A0522D', border: '#6E371C', bg: '#FAF1EC', text: '#45200E' },        // 8. Sienna Rust
];

export const RadialHeritageTree: React.FC<RadialHeritageTreeProps> = ({
  rootNode,
  flattenedNodes,
  selectedNode,
  onSelectNode,
  selectedBranchIndex,
  highlightedNodeId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Pan and Zoom transform state
  const [scale, setScale] = useState<number>(0.85);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<RadialHeritageNode | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Dimensions of SVG coordinate space (1500x1500px for generous 5-ring resolution)
  const svgSize = 1500;
  const center = svgSize / 2;

  // 5 Concentric Rings Radii (Expanded from center hub out to Ring 5)
  // Ring 0 (Center Hub): 0 to 110
  // Ring 1 (1st Generation - 8 Primary Children): 110 to 220
  // Ring 2 (2nd Generation - Grandchildren): 220 to 350
  // Ring 3 (3rd Generation - Great-grandchildren): 350 to 490
  // Ring 4 (4th Generation): 490 to 620
  // Ring 5 (5th Generation - Outer Rim): 620 to 730
  const rCenter = 110;
  const rRing1 = 220;
  const rRing2 = 350;
  const rRing3 = 490;
  const rRing4 = 620;
  const rRing5 = 730;

  // Compute leaf weight of any subtree for proportional angular layout
  const getNodeWeight = useCallback((node: FamilyNode): number => {
    if (!node.children || node.children.length === 0) return 1;
    return node.children.reduce((acc, c) => acc + getNodeWeight(c), 0);
  }, []);

  // Compute tree geometry and angles across all 5 concentric generations
  const { radialNodes, nodeMap } = useMemo(() => {
    const map = new Map<string, RadialHeritageNode>();
    const branches = rootNode.children || [];

    // Proportional weighting for the 8 primary branches with minimum span guarantee
    const branchWeights = branches.map(b => Math.max(getNodeWeight(b), 4));
    const totalWeight = branchWeights.reduce((a, b) => a + b, 0) || 1;

    let currentAngle = -Math.PI / 2; // Start from 12 o'clock apex
    const allNodes: RadialHeritageNode[] = [];

    // Ring 0: Center Root Medallion (ደስታ)
    const rootRadial: RadialHeritageNode = {
      id: rootNode.id || 'p001',
      name: rootNode.name,
      cleanName: getCleanName(rootNode.name),
      isUncertain: false,
      isBlank: false,
      generation: 1,
      branchIndex: -1,
      branchName: 'ደስታ',
      parentId: null,
      path: ['ደስታ'],
      nodeRef: rootNode,
      children: [],
      startAngle: 0,
      endAngle: 2 * Math.PI,
      innerRadius: 0,
      outerRadius: rCenter,
    };
    map.set(rootRadial.id, rootRadial);

    // Recursive layout function to position all nested concentric generations (Ring 1 through Ring 5)
    function layoutChildren(
      parentNode: FamilyNode,
      parentRadial: RadialHeritageNode,
      bIdx: number,
      bName: string,
      startA: number,
      endA: number,
      currentGen: number
    ) {
      const children = parentNode.children || [];
      if (children.length === 0) return;

      const totalChildWeight = children.reduce((acc, c) => acc + Math.max(1, getNodeWeight(c)), 0);
      let childAngle = startA;

      children.forEach((childNode, cIdx) => {
        const cWeight = Math.max(1, getNodeWeight(childNode));
        const cSweep = (cWeight / totalChildWeight) * (endA - startA);
        const cStart = childAngle;
        const cEnd = childAngle + cSweep;
        childAngle = cEnd;

        // Concentric ring radii allocation (NO HOLLOW RINGS):
        // Ring 2 (2nd Generation - Grandchildren): rRing1 to rRing2 (Immediately borders Ring 1, zero gap!)
        // Ring 3 (3rd Generation - Great-grandchildren): rRing2 to rRing3
        // Ring 4 (4th Generation): rRing3 to rRing4
        // Ring 5 (5th Generation - Outer Rim): rRing4 to rRing5
        let inR = rRing1;
        let outR = rRing2;
        if (currentGen === 2) {
          inR = rRing1;
          outR = rRing2;
        } else if (currentGen === 3) {
          inR = rRing2;
          outR = rRing3;
        } else if (currentGen === 4) {
          inR = rRing3;
          outR = rRing4;
        } else if (currentGen >= 5) {
          inR = rRing4;
          outR = rRing5;
        }

        const childId = childNode.id || `${parentRadial.id}-${cIdx}-${childNode.name}`;
        const isBlank = childNode.name.includes('[ስም ያልተሞላ]');
        const isUncertain = childNode.name.includes('[?]') || !!childNode.reviewRequired;

        const childRadial: RadialHeritageNode = {
          id: childId,
          name: childNode.name,
          cleanName: getCleanName(childNode.name),
          isUncertain,
          isBlank,
          generation: currentGen,
          branchIndex: bIdx,
          branchName: bName,
          parentId: parentRadial.id,
          path: [...parentRadial.path, childNode.name],
          nodeRef: childNode,
          children: [],
          startAngle: cStart,
          endAngle: cEnd,
          innerRadius: inR,
          outerRadius: outR,
        };

        allNodes.push(childRadial);
        map.set(childRadial.id, childRadial);
        parentRadial.children.push(childRadial);

        // Recurse for deeper descendants (Ring 3 through Ring 5 outer rim)
        if (childNode.children && childNode.children.length > 0) {
          layoutChildren(childNode, childRadial, bIdx, bName, cStart, cEnd, currentGen + 1);
        }
      });
    }

    // Process the 8 Primary Children (Ring 1)
    branches.forEach((branch, bIdx) => {
      const sweep = (branchWeights[bIdx] / totalWeight) * 2 * Math.PI;
      const bStartAngle = currentAngle;
      const bEndAngle = currentAngle + sweep;
      currentAngle = bEndAngle;

      const branchId = branch.id || `b${bIdx + 1}`;
      const branchNameClean = getCleanName(branch.name);

      const branchRadial: RadialHeritageNode = {
        id: branchId,
        name: branch.name,
        cleanName: branchNameClean,
        isUncertain: branch.name.includes('[?]'),
        isBlank: branch.name.includes('[ስም ያልተሞላ]'),
        generation: 1, // Ring 1 (1st Generation Founders)
        branchIndex: bIdx,
        branchName: branchNameClean,
        parentId: rootRadial.id,
        path: ['ደስታ', branch.name],
        nodeRef: branch,
        children: [],
        startAngle: bStartAngle,
        endAngle: bEndAngle,
        innerRadius: rCenter,
        outerRadius: rRing1,
      };

      allNodes.push(branchRadial);
      map.set(branchRadial.id, branchRadial);
      rootRadial.children.push(branchRadial);

      // Direct Grandchildren (Ring 2 - fully populated, directly borders Ring 1)
      if (branch.children && branch.children.length > 0) {
        layoutChildren(branch, branchRadial, bIdx, branchNameClean, bStartAngle, bEndAngle, 2);
      }
    });

    return { radialNodes: allNodes, nodeMap: map };
  }, [rootNode, getNodeWeight]);

  // Compute ancestral lineage path for interactive highlighting
  const activeLineageIds = useMemo(() => {
    const targetNode = hoveredNode || (selectedNode ? nodeMap.get(selectedNode.id) : null);
    if (!targetNode) return new Set<string>();

    const ids = new Set<string>();
    let curr: RadialHeritageNode | undefined = targetNode;
    while (curr) {
      ids.add(curr.id);
      curr = curr.parentId ? nodeMap.get(curr.parentId) : undefined;
    }
    return ids;
  }, [hoveredNode, selectedNode, nodeMap]);

  // Zoom controls
  const handleZoom = useCallback((delta: number) => {
    setScale(prev => Math.min(Math.max(prev + delta, 0.4), 3.5));
  }, []);

  const handleReset = useCallback(() => {
    setScale(0.85);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleFitScreen = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const minDim = Math.min(clientWidth, clientHeight);
    const fitScale = Math.max(0.4, Math.min(1.2, (minDim - 40) / svgSize));
    setScale(fitScale);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Pointer panning handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).tagName === 'BUTTON') return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Helper to generate SVG arc path with subtle boundary margins
  const getSectorPath = (rIn: number, rOut: number, a1: number, a2: number): string => {
    // Slight angular inset to show separation between segments
    const span = a2 - a1;
    const inset = span > 0.05 ? 0.002 : 0;
    const effA1 = a1 + inset;
    const effA2 = a2 - inset;

    const x1 = center + rIn * Math.cos(effA1);
    const y1 = center + rIn * Math.sin(effA1);
    const x2 = center + rOut * Math.cos(effA1);
    const y2 = center + rOut * Math.sin(effA1);
    const x3 = center + rOut * Math.cos(effA2);
    const y3 = center + rOut * Math.sin(effA2);
    const x4 = center + rIn * Math.cos(effA2);
    const y4 = center + rIn * Math.sin(effA2);
    const largeArc = (effA2 - effA1) > Math.PI ? 1 : 0;

    return `M ${x1.toFixed(2)} ${y1.toFixed(2)} L ${x2.toFixed(2)} ${y2.toFixed(2)} A ${rOut} ${rOut} 0 ${largeArc} 1 ${x3.toFixed(2)} ${y3.toFixed(2)} L ${x4.toFixed(2)} ${y4.toFixed(2)} A ${rIn} ${rIn} 0 ${largeArc} 0 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`;
  };

  // Node selection handler
  const handleNodeClick = (node: RadialHeritageNode, e: React.MouseEvent) => {
    e.stopPropagation();
    const flatMatch = flattenedNodes.find(fn => fn.id === node.id || fn.memberId === node.id || (fn.name === node.name && fn.generation === node.generation));
    if (flatMatch) {
      onSelectNode(flatMatch);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-full min-w-full h-[680px] sm:h-[820px] lg:h-[900px] rounded-2xl sm:rounded-3xl border border-[#E6DFD3] bg-[#FAF8F5] shadow-xl overflow-hidden select-none touch-none cursor-grab active:cursor-grabbing flex items-center justify-center"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Subtle Warm Ivory Backdrop Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: 'radial-gradient(#C5A059 0.75px, transparent 0.75px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Floating Heritage Tree Controls (Top Right) */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#E6DFD3] shadow-lg">
        <button
          type="button"
          onClick={() => handleZoom(0.2)}
          className="p-2 rounded-xl text-[#3A3430] hover:bg-[#F2ECE1] hover:text-[#5C2027] transition-all active:scale-95"
          title="አቅርብ (Zoom In / +)"
        >
          <ZoomIn size={15} />
        </button>

        <span className="px-2 py-0.5 text-[11px] font-mono font-semibold text-[#5A4F47]">
          {Math.round(scale * 100)}%
        </span>

        <button
          type="button"
          onClick={() => handleZoom(-0.2)}
          className="p-2 rounded-xl text-[#3A3430] hover:bg-[#F2ECE1] hover:text-[#5C2027] transition-all active:scale-95"
          title="አርቅ (Zoom Out / -)"
        >
          <ZoomOut size={15} />
        </button>

        <button
          type="button"
          onClick={handleFitScreen}
          className="p-2 rounded-xl text-[#3A3430] hover:bg-[#F2ECE1] hover:text-[#5C2027] transition-all active:scale-95"
          title="ሙሉውን አሳይ (Fit Screen)"
        >
          <Maximize2 size={15} />
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="p-2 rounded-xl text-[#3A3430] hover:bg-[#F2ECE1] hover:text-[#5C2027] transition-all active:scale-95"
          title="ወደ መጀመሪያው መልስ (Reset View)"
        >
          <RotateCcw size={15} />
        </button>
      </div>

      {/* Floating Heritage Info Badge (Top Left) */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-[#E6DFD3] shadow-md">
        <span className="w-2.5 h-2.5 rounded-full bg-[#5C2027]" />
        <span className="font-heritage-en text-xs font-bold text-[#3A3430] tracking-wider uppercase">
          DESTA HERITAGE RADIAL ARCHIVE
        </span>
        <span className="text-[#8C7D70] text-xs">·</span>
        <span className="font-heritage-am text-xs text-[#5C2027] font-bold">
          ጠቅላላ አባላት፡ 168 (168 Listed Nodes / 8 Primary Branches / 5 Generations)
        </span>
      </div>

      {/* Interactive SVG Canvas */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        className="w-full h-full pointer-events-auto transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        <defs>
          {/* Subtle Radial Glow filter for selected node */}
          <filter id="gold-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Circular Framing Rings (Marking Rings 1 to 5) */}
        <circle cx={center} cy={center} r={rRing1} fill="none" stroke="#2B2421" strokeWidth="0.8" opacity="0.25" />
        <circle cx={center} cy={center} r={rRing2} fill="none" stroke="#8C7D70" strokeWidth="0.6" strokeDasharray="3 3" opacity="0.3" />
        <circle cx={center} cy={center} r={rRing3} fill="none" stroke="#8C7D70" strokeWidth="0.6" strokeDasharray="3 3" opacity="0.3" />
        <circle cx={center} cy={center} r={rRing4} fill="none" stroke="#8C7D70" strokeWidth="0.6" strokeDasharray="3 3" opacity="0.3" />
        <circle cx={center} cy={center} r={rRing5 + 8} fill="none" stroke="#C5A059" strokeWidth="1.2" opacity="0.7" />
        <circle cx={center} cy={center} r={rRing5 + 16} fill="none" stroke="#2B2421" strokeWidth="0.5" opacity="0.3" />
        <circle cx={center} cy={center} r={rRing5 + 24} fill="none" stroke="#8C7D70" strokeWidth="0.4" strokeDasharray="4 4" opacity="0.4" />

        {/* Radial Concentric Sectors Rendering */}
        <g id="radial-sectors">
          {radialNodes.map((node) => {
            const isSelected = selectedNode?.name === node.name && selectedNode?.generation === node.generation;
            const isHovered = hoveredNode?.id === node.id;
            const isInLineage = activeLineageIds.has(node.id);
            const isTargetBranch = selectedBranchIndex === null || node.branchIndex === selectedBranchIndex;
            const branchTheme = HERITAGE_BRANCH_THEMES[node.branchIndex] || HERITAGE_BRANCH_THEMES[0];

            // Sector path
            const pathD = getSectorPath(node.innerRadius, node.outerRadius, node.startAngle, node.endAngle);

            // Compute background fill based on generation and special status
            let fill = '#FFFFFF';
            if (node.generation === 1) {
              // Ring 1 (8 Primary Children)
              fill = branchTheme.bg;
            } else if (node.generation === 2) {
              // Ring 2 (Grandchildren - POPULATED & DIRECTLY BORDERING RING 1)
              fill = '#FAF8F4';
            } else if (node.generation === 3) {
              // Ring 3 (Great-grandchildren)
              fill = '#FDFBF7';
            } else if (node.generation >= 4) {
              // Ring 4 & 5 (Deep descendants outer rim)
              fill = '#FFFFFF';
            }

            // Distinct tinted/beige placeholder blocks (#EED9C4) for documented blank slots [ስም ያልተሞላ]
            if (node.isBlank) {
              fill = '#EED9C4';
            }

            // Provisional reading [?] subtle tint
            if (node.name === '[?]') {
              fill = '#F7F3EB';
            }

            if (isSelected) {
              fill = '#5C2027'; // Rich Heritage Burgundy
            } else if (isHovered) {
              fill = '#D4AF37'; // Heritage Gold
            } else if (isInLineage) {
              fill = '#F0E6D2'; // Warm Gold Lineage tint
            }

            // Opacity for branch filtering
            const opacity = isTargetBranch ? 1 : 0.18;

            // Compute stroke & dash array
            let stroke = '#8C7D70';
            let strokeWidth = 0.6;
            let strokeDasharray: string | undefined = undefined;

            if (node.generation === 1) {
              stroke = branchTheme.border;
              strokeWidth = 1.4;
            }

            if (node.isBlank) {
              stroke = '#B8A898';
              strokeDasharray = '3 3';
            } else if (node.isUncertain || node.name === '[?]') {
              stroke = '#A8998A';
              strokeDasharray = '2 2';
            }

            if (isSelected) {
              stroke = '#D4AF37';
              strokeWidth = 2.5;
              strokeDasharray = undefined;
            }

            // Midpoint angle and radius for text
            const midAngle = (node.startAngle + node.endAngle) / 2;
            const midRadius = (node.innerRadius + node.outerRadius) / 2;
            let textRotation = (midAngle * 180) / Math.PI;

            // Correct text orientation so letters are never upside down
            let textX = center + midRadius * Math.cos(midAngle);
            let textY = center + midRadius * Math.sin(midAngle);

            if (textRotation > 90 && textRotation < 270) {
              textRotation += 180;
            } else if (textRotation < -90) {
              textRotation += 180;
            }

            // Text font size per ring generation
            let fontSize = 9;
            if (node.generation === 1) fontSize = 13.5;
            else if (node.generation === 2) fontSize = 10.5;
            else if (node.generation === 3) fontSize = 9.2;
            else if (node.generation === 4) fontSize = 8.5;
            else if (node.generation >= 5) fontSize = 7.8;

            // Angular span check: if the arc is very narrow, scale down font slightly
            const angleSpan = node.endAngle - node.startAngle;
            if (angleSpan < 0.05) {
              fontSize = Math.max(7, fontSize - 1.5);
            }

            let textColor = isSelected ? '#FFFFFF' : isHovered ? '#1F1A17' : '#26221F';
            if (node.isBlank) textColor = '#7A6453';
            const fontWeight = (node.generation === 1 || isSelected) ? '700' : (node.generation === 2 ? '600' : '500');

            // Display label
            let displayLabel = node.cleanName;
            if (node.isBlank) {
              displayLabel = '— ያልተሞላ —';
            } else if (node.name === '[?]') {
              displayLabel = '?';
            }

            return (
              <g
                key={node.id}
                className="cursor-pointer transition-opacity duration-200"
                opacity={opacity}
                onClick={(e) => handleNodeClick(node, e)}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <path
                  d={pathD}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  className="transition-colors duration-150"
                  filter={isSelected ? 'url(#gold-glow)' : undefined}
                />

                {/* Name Label with trailing ellipses preserved */}
                <text
                  x={textX.toFixed(2)}
                  y={textY.toFixed(2)}
                  fontFamily="'Noto Serif Ethiopic', 'Noto Sans Ethiopic', serif"
                  fontSize={fontSize}
                  fontWeight={fontWeight}
                  fill={textColor}
                  textAnchor="middle"
                  dominantBaseline="central"
                  transform={`rotate(${textRotation.toFixed(2)} ${textX.toFixed(2)} ${textY.toFixed(2)})`}
                  className="pointer-events-none select-none tracking-tight"
                >
                  {displayLabel}
                  {node.isUncertain && !node.isBlank && node.name !== '[?]' && (
                    <tspan fill="#8C7D70" fontSize={fontSize * 0.8}> [?]</tspan>
                  )}
                </text>
              </g>
            );
          })}
        </g>

        {/* Center Founding Ancestor Medallion (ደስታ - DESTA ROOT ANCESTOR) */}
        <g 
          id="center-ancestor" 
          className="cursor-pointer"
          onClick={() => {
            const rootFlat = flattenedNodes.find(fn => fn.name === 'ደስታ');
            if (rootFlat) onSelectNode(rootFlat);
          }}
        >
          <circle
            cx={center}
            cy={center}
            r={rCenter}
            fill="#FAF8F5"
            stroke="#2B2421"
            strokeWidth="3"
            className="transition-colors hover:fill-[#F2ECE1]"
          />
          <circle cx={center} cy={center} r={rCenter - 5} fill="none" stroke="#C5A059" strokeWidth="1.5" />
          <circle cx={center} cy={center} r={rCenter - 10} fill="none" stroke="#8C7D70" strokeWidth="0.75" opacity="0.4" />

          {/* Medallion Typography */}
          <text
            x={center}
            y={center - 24}
            fontFamily="'Noto Serif Ethiopic', 'Noto Sans Ethiopic', serif"
            fontSize="34"
            fontWeight="800"
            fill="#2B2421"
            textAnchor="middle"
          >
            ደስታ
          </text>

          <text
            x={center}
            y={center + 10}
            fontFamily="'EB Garamond', Georgia, serif"
            fontSize="15"
            fontWeight="600"
            letterSpacing="0.38em"
            fill="#5C2027"
            textAnchor="middle"
          >
            D E S T A
          </text>

          <text
            x={center}
            y={center + 30}
            fontFamily="'EB Garamond', Georgia, serif"
            fontSize="10"
            fontWeight="500"
            letterSpacing="0.25em"
            fill="#8C7D70"
            textAnchor="middle"
          >
            ROOT ANCESTOR
          </text>
        </g>
      </svg>

      {/* Hover Floating Tooltip */}
      {hoveredNode && !isDragging && (
        <div 
          className="absolute z-40 pointer-events-none p-3.5 rounded-xl bg-[#26201D]/95 text-white shadow-2xl border border-[#C5A059]/40 backdrop-blur-md max-w-xs transition-transform duration-75"
          style={{
            left: Math.min(mousePos.x + 16, (containerRef.current?.clientWidth || 600) - 250),
            top: Math.min(mousePos.y + 16, (containerRef.current?.clientHeight || 600) - 120),
          }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#C5A059] text-[#1F1A17]">
              ትውልድ {GEEZ_NUMS[hoveredNode.generation - 1] || hoveredNode.generation}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-white/10 text-amber-200">
              {hoveredNode.id}
            </span>
            <span className="text-[11px] text-[#C5A059] font-medium font-heritage-en">
              Ring {hoveredNode.generation - 1}
            </span>
          </div>

          <h4 className="font-heritage-am text-sm font-bold text-white mb-1">
            {hoveredNode.isBlank ? '[ስም ያልተሞላ - Documented Placeholder]' : hoveredNode.name}
          </h4>

          <p className="text-[11px] text-[#D8D0C5] flex items-center gap-1 font-heritage-am">
            <span>ቅርንጫፍ:</span>
            <span className="font-semibold text-white">{hoveredNode.branchName}</span>
          </p>

          {hoveredNode.children.length > 0 && (
            <p className="text-[10px] text-[#C5A059] mt-1 font-mono">
              ቀጥተኛ ልጆች: {hoveredNode.children.length}
            </p>
          )}

          <p className="text-[10px] text-[#C5A059]/80 mt-1 italic font-heritage-en">
            Click to inspect full lineage path
          </p>
        </div>
      )}

      {/* Corner Legend & Footer Metadata (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-20 hidden sm:flex flex-col gap-1.5 p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-[#E6DFD3] shadow-md text-xs text-[#2B2421]">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded bg-[#FAF8F4] border border-[#8C7D70] inline-block shrink-0" />
          <span className="font-semibold text-[11.5px]">የተመዘገቡ አባላት (Documented Members)</span>
        </div>
        <div className="flex items-center gap-2 text-[#7D6857]">
          <span className="w-3.5 h-3.5 rounded bg-[#EED9C4] border border-[#B8A898] border-dashed inline-block shrink-0" />
          <span className="font-semibold text-[11.5px]">■ = ያልተሞላ ስም (Documented Placeholder)</span>
        </div>
        <div className="pt-1 mt-0.5 border-t border-[#F0EBE1] text-[10.5px] font-medium text-[#5C2027]">
          ፰ ዋና ዋና ቅርንጫፎች • ፭ ትውልዶች (Ring 0 እስከ Ring 5) • ጠቅላላ አባላት: 168
        </div>
      </div>

      {/* Mobile Interaction Hint */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none sm:hidden flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-[#E6DFD3] text-[10.5px] text-[#5A4F47] shadow-sm">
        <Info size={12} className="text-[#C5A059]" />
        <span>ለመጎተት ይጫኑ · ለማጉላት ይቆንጥጡ (Pan & Pinch)</span>
      </div>
    </div>
  );
};
