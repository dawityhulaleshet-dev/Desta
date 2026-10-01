import React, { useState, useMemo, useRef } from 'react';
import { 
  FamilyNode, 
  destaFamilyData as initialTreeData 
} from './destaFamilyData';
import { 
  computeTreeStats, 
  flattenTree, 
  getCleanName,
  FlattenedNode 
} from './familyUtils';
import { TopToBottomTree } from './TopToBottomTree';
import { SummaryDashboard } from './SummaryDashboard';
import { LeftSummaryMenuBar } from './LeftSummaryMenuBar';
import { ArtisticVisualTree } from './ArtisticVisualTree';
import { PdfExportModal } from './PdfExportModal';
import { 
  Share2, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  Users, 
  HelpCircle, 
  Layers, 
  Maximize2, 
  Minimize2, 
  GitFork, 
  UserCheck, 
  RotateCcw,
  Sparkles,
  Info,
  Edit3,
  Network,
  ListTree,
  LayoutDashboard,
  FileDown,
  Sun,
  Moon
} from 'lucide-react';

export default function App() {
  const [treeData, setTreeData] = useState<FamilyNode>(initialTreeData);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUncertainOnly, setFilterUncertainOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'topdown' | 'tree' | 'branches' | 'dashboard'>('visual');
  const [selectedNode, setSelectedNode] = useState<FlattenedNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [activeBranchIndex, setActiveBranchIndex] = useState<number>(0);
  const [selectedTreeBranchIndex, setSelectedTreeBranchIndex] = useState<number | null>(2);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  
  const isLight = theme === 'light';
  
  // Edit modal state
  const [editingNode, setEditingNode] = useState<{ path: string[]; currentName: string } | null>(null);
  const [newNameInput, setNewNameInput] = useState('');

  // Stats calculation
  const stats = useMemo(() => computeTreeStats(treeData), [treeData]);
  const flattenedList = useMemo(() => flattenTree(treeData), [treeData]);

  // Toggle node expansion
  const toggleExpand = (id: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id]
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    flattenedList.forEach(item => {
      allExpanded[item.id] = true;
    });
    setExpandedNodes(allExpanded);
  };

  const collapseAll = () => {
    setExpandedNodes({});
  };

  const handleResetData = () => {
    if (window.confirm('ይህን ወደ መጀመሪያው የደስታ የቤተሰብ ዛፍ ዳታ መመለስ ይፈልጋሉ? (Reset data to default?)')) {
      setTreeData(initialTreeData);
      setSelectedNode(null);
    }
  };

  // Node editing logic
  const handleStartEdit = (node: FlattenedNode) => {
    setEditingNode({
      path: node.path,
      currentName: node.name
    });
    setNewNameInput(node.name);
  };

  const handleSaveEdit = () => {
    if (!editingNode || !newNameInput.trim()) return;

    const updateRecursive = (curr: FamilyNode, path: string[], depth: number): FamilyNode => {
      if (depth === path.length - 1 && curr.name === path[depth]) {
        return {
          ...curr,
          name: newNameInput.trim(),
        };
      }
      if (curr.children && depth < path.length - 1) {
        return {
          ...curr,
          children: curr.children.map(child => updateRecursive(child, path, depth + 1))
        };
      }
      return curr;
    };

    const updated = updateRecursive(treeData, editingNode.path, 0);
    setTreeData(updated);
    setEditingNode(null);

    // Update selected node if currently inspected
    if (selectedNode && selectedNode.name === editingNode.currentName) {
      setSelectedNode(prev => prev ? { ...prev, name: newNameInput.trim(), isUncertain: newNameInput.includes('[?]') } : null);
    }
  };

  // Filtered members for search
  const filteredList = useMemo(() => {
    return flattenedList.filter(item => {
      const matchesSearch = !searchQuery.trim() || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getCleanName(item.name).toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesUncertainty = !filterUncertainOnly || item.isUncertain;

      return matchesSearch && matchesUncertainty;
    });
  }, [flattenedList, searchQuery, filterUncertainOnly]);

  // Generation colors and badges
  const getGenerationMeta = (gen: number) => {
    switch (gen) {
      case 1:
        return {
          bg: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
          badge: 'bg-amber-500/30 text-amber-200 border-amber-400/40',
          title: 'ትውልድ ፩ (Root Ancestor / ዋነኛ አባት)',
          colorHex: '#f59e0b'
        };
      case 2:
        return {
          bg: 'bg-sky-500/20 border-sky-500/40 text-sky-300',
          badge: 'bg-sky-500/30 text-sky-200 border-sky-400/40',
          title: 'ትውልድ ፪ (ልጆች / Direct Children)',
          colorHex: '#38bdf8'
        };
      case 3:
        return {
          bg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
          badge: 'bg-emerald-500/30 text-emerald-200 border-emerald-400/40',
          title: 'ትውልድ ፫ (የልጅ ልጆች / Grandchildren)',
          colorHex: '#34d399'
        };
      case 4:
      default:
        return {
          bg: 'bg-purple-500/20 border-purple-500/40 text-purple-300',
          badge: 'bg-purple-500/30 text-purple-200 border-purple-400/40',
          title: 'ትውልድ ፬ (ቅማንት / Great-Grandchildren)',
          colorHex: '#c084fc'
        };
    }
  };

  // Recursive tree component
  const TreeNode = ({ 
    node, 
    path, 
    gen, 
    index 
  }: { 
    node: FamilyNode; 
    path: string[]; 
    gen: number; 
    index: number;
  }) => {
    const id = `${path.join('-')}-${index}-${node.name}`;
    const currentPath = [...path, node.name];
    const isExpanded = expandedNodes[id] !== false; // Default expanded
    const hasChildren = node.children && node.children.length > 0;
    const isUncertain = node.name.includes('[?]');
    const meta = getGenerationMeta(gen);
    
    // Check if node matches search query
    const isSearchMatch = searchQuery.trim() !== '' && 
      (node.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
       getCleanName(node.name).toLowerCase().includes(searchQuery.toLowerCase()));

    const isDimmed = searchQuery.trim() !== '' && !isSearchMatch && 
      !node.children?.some(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (filterUncertainOnly && !isUncertain && !node.children?.some(c => c.name.includes('[?]'))) {
      return null;
    }

    return (
      <div className={`relative pl-4 md:pl-6 my-1 transition-opacity ${isDimmed ? 'opacity-40' : 'opacity-100'}`}>
        {/* Branch line */}
        <div className={`absolute left-0 top-5 bottom-0 w-[2px] ${isLight ? 'bg-slate-300' : 'bg-slate-700/60'}`} />
        <div className={`absolute left-0 top-5 w-4 h-[2px] ${isLight ? 'bg-slate-300' : 'bg-slate-700/60'}`} />

        <div className="flex items-center gap-2 py-1 group">
          {hasChildren ? (
            <button
              onClick={() => toggleExpand(id)}
              className={`p-1 rounded transition-colors border ${
                isLight 
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
              }`}
              title={isExpanded ? 'Collapse branch' : 'Expand branch'}
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <div className="w-6 h-6 flex items-center justify-center">
              <span className={`w-2 h-2 rounded-full transition-colors ${
                isLight ? 'bg-slate-300 group-hover:bg-amber-500' : 'bg-slate-600 group-hover:bg-amber-400'
              }`} />
            </div>
          )}

          {/* Node Card with Magnifying Effect on Hover */}
          <div 
            onClick={() => {
              setSelectedNode({
                id,
                name: node.name,
                isUncertain,
                generation: gen,
                path: currentPath,
                parentId: path.length > 0 ? path[path.length - 1] : null,
                childrenCount: node.children ? node.children.length : 0,
                nodeRef: node
              });
            }}
            className={`cursor-pointer px-3 py-1.5 rounded-lg border transition-all duration-300 ease-out transform hover:scale-105 hover:-translate-y-0.5 hover:z-20 relative flex items-center gap-2 shadow-sm ${
              isSearchMatch 
                ? (isLight ? 'ring-2 ring-amber-500 bg-amber-50 border-amber-400' : 'ring-2 ring-amber-400 bg-amber-950/40 border-amber-400') 
                : (isLight 
                    ? 'bg-white hover:bg-slate-50 border-slate-200 hover:border-sky-400 hover:shadow-md' 
                    : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 hover:border-sky-400/60 hover:shadow-lg hover:shadow-sky-500/20')
            } ${
              selectedNode?.name === node.name 
                ? (isLight ? 'ring-2 ring-sky-500 border-sky-500 bg-sky-50' : 'ring-2 ring-sky-400 border-sky-400 bg-sky-950/30') 
                : ''
            }`}
          >
            <span className={`text-xs px-1.5 py-0.5 rounded font-mono font-medium border ${meta.badge}`}>
              G{gen}
            </span>

            <span className={`tracking-wide ${
              gen === 1 
                ? (isLight ? 'text-amber-800 font-extrabold text-lg' : 'text-amber-200 font-extrabold text-lg') 
                : gen === 2
                  ? (isLight ? 'text-slate-900 font-bold text-base sm:text-[17px]' : 'text-white font-bold text-base sm:text-[17px]')
                  : gen === 3
                    ? (isLight ? 'text-slate-900 font-bold text-[15px]' : 'text-slate-100 font-bold text-[15px]')
                    : (isLight ? 'text-slate-900 font-semibold text-sm' : 'text-slate-100 font-semibold text-sm')
            }`}>
              {getCleanName(node.name)}
            </span>

            {isUncertain && (
              <span 
                className={`inline-flex items-center gap-0.5 text-[11px] px-1.5 py-0.5 rounded-full font-mono border ${
                  isLight ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                }`}
                title="የደበዘዘ"
              >
                [?]
              </span>
            )}

            {hasChildren && (
              <span className={`text-[11px] px-1.5 py-0.2 rounded font-mono border ${
                isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-700/60 text-slate-300 border-slate-600/50'
              }`}>
                {node.children!.length} ልጆች
              </span>
            )}
          </div>

          <button
            onClick={() => handleStartEdit({
              id,
              name: node.name,
              isUncertain,
              generation: gen,
              path: currentPath,
              parentId: path.length > 0 ? path[path.length - 1] : null,
              childrenCount: node.children ? node.children.length : 0,
              nodeRef: node
            })}
            className={`opacity-0 group-hover:opacity-100 p-1 transition-opacity rounded ${
              isLight ? 'text-slate-400 hover:text-amber-600 hover:bg-slate-100' : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
            }`}
            title="Edit transcription"
          >
            <Edit3 size={13} />
          </button>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="flex flex-col">
            {node.children!.map((child, idx) => (
              <TreeNode 
                key={`${child.name}-${idx}`} 
                node={child} 
                path={currentPath} 
                gen={gen + 1} 
                index={idx} 
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors ${
      isLight 
        ? 'bg-slate-100 text-slate-900 selection:bg-amber-400 selection:text-slate-950' 
        : 'bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950'
    }`}>
      {/* Top Navbar */}
      <header className={`border-b sticky top-0 z-40 px-4 sm:px-6 py-2.5 w-full transition-colors ${
        isLight ? 'border-slate-200 bg-white/95 backdrop-blur shadow-xs' : 'border-slate-850 bg-slate-950/90 backdrop-blur'
      }`}>
        <div className="w-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <h1 className={`text-base sm:text-lg font-bold tracking-tight ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              የደስታ የቤተሰብ ዛፍ
            </h1>
            <span className={`text-xs hidden sm:inline ${
              isLight ? 'text-slate-400' : 'text-slate-500'
            }`}>
              · ፯ ቅርንጫፎች · {stats.totalMembers} አባላት
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPdfModalOpen(true)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all duration-150 active:scale-95 shadow-2xs ${
                isLight 
                  ? 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900' 
                  : 'bg-white hover:bg-slate-100 text-slate-950 border-white'
              }`}
              title="PDF አውርድ (Download PDF Report)"
            >
              <FileDown size={14} className={isLight ? 'text-amber-400' : 'text-sky-600'} />
              <span>PDF አውርድ</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 active:scale-95 ${
                activeTab === 'dashboard'
                  ? isLight ? 'bg-sky-600 text-white border-sky-600 shadow-xs' : 'bg-sky-500 text-slate-950 border-sky-500 shadow-xs'
                  : isLight ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-2xs' : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
              title="Summary Dashboard"
            >
              <LayoutDashboard size={13} />
              <span className="hidden sm:inline">Summary Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </button>

            <button
              onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
              className={`p-2 rounded-xl border transition-all duration-150 active:scale-95 ${
                isLight
                  ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-2xs'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
              title={isLight ? 'ወደ ጨለማ ገጽታ ቀይር (Dark Mode)' : 'ወደ ብርሃን ገጽታ ቀይር (Light Mode)'}
            >
              {isLight ? <Moon size={15} /> : <Sun size={15} className="text-amber-400" />}
            </button>

            <button
              onClick={handleResetData}
              className={`p-2 rounded-xl border transition-all duration-150 active:scale-95 ${
                isLight
                  ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-2xs'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
              title="መረጃውን ወደ መጀመሪያው መልስ (Reset)"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 w-full px-3 sm:px-6 py-3 flex flex-col gap-3">
        {/* Navigation & Search Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <nav className={`flex items-center p-1 rounded-xl border self-start gap-1 transition-colors ${
            isLight ? 'bg-slate-200/60 border-slate-300/70' : 'bg-slate-900 border-slate-800'
          }`}>
            <button
              onClick={() => setActiveTab('visual')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-[0.98] flex items-center gap-1.5 ${
                activeTab === 'visual'
                  ? isLight ? 'bg-amber-500 text-slate-950 shadow-xs font-bold' : 'bg-amber-400 text-slate-950 shadow-xs font-bold'
                  : isLight ? 'text-amber-900 hover:text-amber-950 hover:bg-amber-100/60 font-medium' : 'text-amber-300 hover:text-white hover:bg-amber-500/10'
              }`}
            >
              <Sparkles size={13} className={activeTab === 'visual' ? 'text-slate-950' : 'text-amber-500'} />
              <span>ሥዕላዊ ዛፍ (Artistic Tree)</span>
            </button>
            <button
              onClick={() => setActiveTab('topdown')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-[0.98] flex items-center gap-1.5 ${
                activeTab === 'topdown'
                  ? isLight ? 'bg-white text-slate-950 shadow-xs' : 'bg-slate-800 text-white shadow-xs'
                  : isLight ? 'text-slate-600 hover:text-slate-950 hover:bg-white/50' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Network size={13} className={activeTab === 'topdown' ? (isLight ? 'text-sky-600' : 'text-sky-400') : ''} />
              <span>ዛፍ (Tree)</span>
            </button>
            <button
              onClick={() => setActiveTab('tree')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-[0.98] flex items-center gap-1.5 ${
                activeTab === 'tree'
                  ? isLight ? 'bg-white text-slate-950 shadow-xs' : 'bg-slate-800 text-white shadow-xs'
                  : isLight ? 'text-slate-600 hover:text-slate-950 hover:bg-white/50' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <ListTree size={13} className={activeTab === 'tree' ? (isLight ? 'text-sky-600' : 'text-sky-400') : ''} />
              <span>ዝርዝር (List)</span>
            </button>
            <button
              onClick={() => setActiveTab('branches')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-[0.98] flex items-center gap-1.5 ${
                activeTab === 'branches'
                  ? isLight ? 'bg-white text-slate-950 shadow-xs' : 'bg-slate-800 text-white shadow-xs'
                  : isLight ? 'text-slate-600 hover:text-slate-950 hover:bg-white/50' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Layers size={13} className={activeTab === 'branches' ? (isLight ? 'text-sky-600' : 'text-sky-400') : ''} />
              <span>ቅርንጫፎች (Branches)</span>
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-[0.98] flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? isLight ? 'bg-white text-slate-950 shadow-xs' : 'bg-slate-800 text-white shadow-xs'
                  : isLight ? 'text-slate-600 hover:text-slate-950 hover:bg-white/50' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard size={13} className={activeTab === 'dashboard' ? (isLight ? 'text-sky-600' : 'text-sky-400') : ''} />
              <span>ማጠቃለያ (Summary)</span>
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
              <input
                type="text"
                placeholder="ፈልግ..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={`pl-8 pr-7 py-1.5 rounded-xl border text-xs focus:outline-none w-44 sm:w-60 transition-all duration-150 ${
                  isLight 
                    ? 'bg-white border-slate-200 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15 shadow-2xs' 
                    : 'bg-slate-900 border-slate-800 text-white focus:border-sky-400 focus:ring-2 focus:ring-sky-400/15'
                }`}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-xs transition-opacity hover:opacity-100 ${
                    isLight ? 'text-slate-400 hover:bg-slate-100' : 'text-slate-500 hover:bg-slate-800'
                  }`}
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setFilterUncertainOnly(!filterUncertainOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all duration-150 active:scale-95 shadow-2xs ${
                filterUncertainOnly 
                  ? (isLight ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-amber-500/20' : 'bg-amber-400 text-slate-950 border-amber-400') 
                  : (isLight ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300')
              }`}
              title="በከፊል የደበዘዙ ስሞችን ብቻ አሳይ (Filter uncertain names)"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${filterUncertainOnly ? 'bg-slate-950' : 'bg-amber-500'}`} />
              <span>የደበዘዙ [?]</span>
            </button>

            {activeTab === 'tree' && (
              <div className={`flex items-center p-0.5 rounded-xl border ${
                isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}>
                <button
                  onClick={expandAll}
                  className={`p-1.5 rounded-lg transition-all duration-150 active:scale-95 ${
                    isLight ? 'text-slate-700 hover:bg-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                  title="ሁሉንም ዘርጋ"
                >
                  <Maximize2 size={13} />
                </button>
                <button
                  onClick={collapseAll}
                  className={`p-1.5 rounded-lg transition-all duration-150 active:scale-95 ${
                    isLight ? 'text-slate-700 hover:bg-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                  title="ሁሉንም እጠፍ"
                >
                  <Minimize2 size={13} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab -1: Artistic Visual Tree (Botanical Oil Painting View) */}
        {activeTab === 'visual' && (
          <div className="w-full flex flex-col gap-3">
            <ArtisticVisualTree
              rootNode={treeData}
              selectedNode={selectedNode}
              onSelectNode={setSelectedNode}
              onEditNode={handleStartEdit}
              stats={stats}
              theme={theme}
              onOpenPdfModal={() => setIsPdfModalOpen(true)}
            />
          </div>
        )}

        {/* Tab 0: Top to Bottom Tree */}
        {activeTab === 'topdown' && (
          <div className="flex flex-col lg:flex-row items-start gap-3 w-full flex-1 min-h-0">
            {/* Left Summary Menu Bar */}
            <LeftSummaryMenuBar
              stats={stats}
              rootNode={treeData}
              theme={theme}
              activeBranchIndex={selectedTreeBranchIndex}
              onSelectBranch={setSelectedTreeBranchIndex}
              onOpenFullDashboard={() => setActiveTab('dashboard')}
              onOpenArtisticTree={() => setActiveTab('visual')}
              filterUncertainOnly={filterUncertainOnly}
              onToggleFilterUncertain={() => setFilterUncertainOnly(!filterUncertainOnly)}
              onOpenPdfModal={() => setIsPdfModalOpen(true)}
            />

            {/* Tree Canvas Area */}
            <div className="flex-1 w-full min-w-0 flex flex-col gap-3">
              <TopToBottomTree
                rootNode={treeData}
                selectedNode={selectedNode}
                onSelectNode={setSelectedNode}
                onEditNode={handleStartEdit}
                searchQuery={searchQuery}
                filterUncertainOnly={filterUncertainOnly}
                theme={theme}
                onOpenPdfModal={() => setIsPdfModalOpen(true)}
                activeBranchIndex={selectedTreeBranchIndex}
                onSelectBranch={setSelectedTreeBranchIndex}
              />

            {/* Selected Member Minimal Bar */}
            {selectedNode && (
              <div className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 transition-colors ${
                isLight ? 'bg-white border-slate-200 text-slate-900 shadow-xs' : 'bg-slate-900 border-slate-800 text-white'
              }`}>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-base font-bold flex items-center gap-1.5">
                    {selectedNode.name}
                    {selectedNode.isUncertain && (
                      <span className={`text-[10px] font-mono px-1 rounded ${
                        isLight ? 'text-amber-700 bg-amber-50' : 'text-amber-300 bg-amber-500/15'
                      }`}>
                        [?]
                      </span>
                    )}
                  </span>

                  <span className={`text-xs ${isLight ? 'text-slate-300' : 'text-slate-600'}`}>·</span>

                  <span className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    ትውልድ {selectedNode.generation}
                  </span>

                  {selectedNode.childrenCount > 0 && (
                    <>
                      <span className={`text-xs ${isLight ? 'text-slate-300' : 'text-slate-600'}`}>·</span>
                      <span className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        {selectedNode.childrenCount} ልጆች
                      </span>
                    </>
                  )}

                  <span className={`text-xs ${isLight ? 'text-slate-300' : 'text-slate-600'}`}>·</span>

                  <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {selectedNode.path.join(' → ')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartEdit(selectedNode)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 ${
                      isLight ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                    }`}
                  >
                    <Edit3 size={11} />
                    <span>አስተካክል</span>
                  </button>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="p-1 rounded text-xs opacity-50 hover:opacity-100"
                    title="ዝጋ"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
            </div>
          </div>
        )}

        {/* Tab 1: Interactive Tree View */}
        {activeTab === 'tree' && (
          <div className="flex flex-col gap-3">
            <div className={`border rounded-xl p-5 overflow-x-auto shadow-xs transition-colors ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
            }`}>
              <div className="min-w-[450px]">
                <TreeNode 
                  node={treeData} 
                  path={[]} 
                  gen={1} 
                  index={0} 
                />
              </div>
            </div>

            {selectedNode && (
              <div className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 transition-colors ${
                isLight ? 'bg-white border-slate-200 text-slate-900 shadow-xs' : 'bg-slate-900 border-slate-800 text-white'
              }`}>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-base font-bold flex items-center gap-1.5">
                    {selectedNode.name}
                    {selectedNode.isUncertain && (
                      <span className={`text-[10px] font-mono px-1 rounded ${
                        isLight ? 'text-amber-700 bg-amber-50' : 'text-amber-300 bg-amber-500/15'
                      }`}>
                        [?]
                      </span>
                    )}
                  </span>
                  <span className={`text-xs ${isLight ? 'text-slate-300' : 'text-slate-600'}`}>·</span>
                  <span className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    ትውልድ {selectedNode.generation}
                  </span>
                  {selectedNode.childrenCount > 0 && (
                    <>
                      <span className={`text-xs ${isLight ? 'text-slate-300' : 'text-slate-600'}`}>·</span>
                      <span className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        {selectedNode.childrenCount} ልጆች
                      </span>
                    </>
                  )}
                  <span className={`text-xs ${isLight ? 'text-slate-300' : 'text-slate-600'}`}>·</span>
                  <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {selectedNode.path.join(' → ')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartEdit(selectedNode)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 ${
                      isLight ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                    }`}
                  >
                    <Edit3 size={11} />
                    <span>አስተካክል</span>
                  </button>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="p-1 rounded text-xs opacity-50 hover:opacity-100"
                    title="ዝጋ"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Branch-by-Branch Explorer */}
        {activeTab === 'branches' && (
          <div className="flex flex-col gap-6">
            <div className={`flex overflow-x-auto pb-2 gap-2 border-b ${
              isLight ? 'border-slate-200' : 'border-slate-800'
            }`}>
              {treeData.children?.map((branch, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveBranchIndex(idx)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border ${
                    activeBranchIndex === idx
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                      : isLight 
                        ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm' 
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-slate-950/20 flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <span>{getCleanName(branch.name)}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    isLight && activeBranchIndex !== idx ? 'bg-slate-100 text-slate-600' : 'bg-slate-800/40 text-current'
                  }`}>
                    {branch.children?.length || 0}
                  </span>
                </button>
              ))}
            </div>

            {treeData.children && treeData.children[activeBranchIndex] && (
              <div className={`border rounded-xl p-5 transition-colors ${
                isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900/60 border-slate-800'
              }`}>
                <div className={`flex items-center justify-between border-b pb-3 mb-4 ${
                  isLight ? 'border-slate-200' : 'border-slate-800'
                }`}>
                  <h2 className={`text-xl font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {treeData.children[activeBranchIndex].name}
                  </h2>
                  <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {treeData.children[activeBranchIndex].children?.length || 0} ልጆች
                  </span>
                </div>

                {/* Subtree Rendering */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {treeData.children[activeBranchIndex].children?.map((child, cIdx) => (
                    <div 
                      key={cIdx} 
                      className={`border rounded-lg p-3.5 transition-all ${
                        isLight 
                          ? 'bg-slate-50/70 hover:bg-white border-slate-200 shadow-2xs' 
                          : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/70'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                          {child.name}
                        </div>
                        {child.name.includes('[?]') && (
                          <span className={`text-[10px] px-1 rounded border ${
                            isLight ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                          }`}>
                            [?]
                          </span>
                        )}
                      </div>

                      {child.children && child.children.length > 0 && (
                        <div className={`mt-2.5 pt-2 border-t ${isLight ? 'border-slate-200' : 'border-slate-700/60'}`}>
                          <div className="flex flex-wrap gap-1">
                            {child.children.map((grand, gIdx) => (
                              <span 
                                key={gIdx}
                                className={`text-[13px] font-medium px-2 py-0.5 rounded border ${
                                  isLight 
                                    ? 'bg-white border-slate-200 text-slate-800' 
                                    : 'bg-slate-900 border-slate-700 text-slate-300'
                                }`}
                              >
                                {grand.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Summary Dashboard */}
        {activeTab === 'dashboard' && (
          <SummaryDashboard
            rootNode={treeData}
            flattenedNodes={flattenedList}
            stats={stats}
            theme={theme}
            onSelectBranch={(idx) => {
              setActiveBranchIndex(idx);
            }}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
            }}
            onEditNode={handleStartEdit}
            onOpenPdfModal={() => setIsPdfModalOpen(true)}
          />
        )}
      </main>

      {/* Edit Transcription Modal */}
      {editingNode && (
        <div className={`fixed inset-0 z-50 backdrop-blur-xs flex items-center justify-center p-4 ${
          isLight ? 'bg-slate-900/30' : 'bg-slate-950/70'
        }`}>
          <div className={`border rounded-xl max-w-sm w-full p-5 shadow-xl flex flex-col gap-3.5 ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <h3 className={`text-sm font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <Edit3 size={14} className="text-amber-500" />
              ስም ማስተካከል
            </h3>

            <div>
              <input
                type="text"
                value={newNameInput}
                onChange={e => setNewNameInput(e.target.value)}
                className={`w-full px-3 py-1.5 rounded-lg border text-sm focus:outline-none ${
                  isLight 
                    ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500' 
                    : 'bg-slate-950 border-slate-700 text-white focus:border-amber-400'
                }`}
                autoFocus
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => {
                  setNewNameInput(prev => getCleanName(prev));
                }}
                className={`text-xs ${
                  isLight ? 'text-amber-700 hover:text-amber-800' : 'text-amber-400 hover:text-amber-300'
                }`}
              >
                [?] አንሳ
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingNode(null)}
                  className={`px-3 py-1 rounded-md text-xs border ${
                    isLight 
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' 
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  ሰርዝ
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-3.5 py-1 rounded-md text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs"
                >
                  አስቀምጥ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Export Modal */}
      <PdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        rootNode={treeData}
        flattenedNodes={flattenedList}
        stats={stats}
        theme={theme}
      />

      {/* Footer */}
      <footer className={`py-3 px-6 text-center text-xs transition-colors ${
        isLight ? 'text-slate-400' : 'text-slate-600'
      }`}>
        ደስታ · ፯ ቅርንጫፎች · {stats.totalMembers} አባላት
      </footer>
    </div>
  );
}
