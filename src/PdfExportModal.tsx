import React, { useState, useRef } from 'react';
import { FamilyNode } from './destaFamilyData';
import { FlattenedNode, TreeStats } from './familyUtils';
import { PdfPrintDocument } from './PdfPrintDocument';
import { downloadElementAsPdf } from './pdfGenerator';
import { 
  FileDown, 
  Printer, 
  X, 
  Check, 
  Loader2, 
  Layers, 
  GitFork, 
  FileText,
  Sparkles
} from 'lucide-react';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  rootNode: FamilyNode;
  flattenedNodes: FlattenedNode[];
  stats: TreeStats;
  theme?: 'dark' | 'light';
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  rootNode,
  flattenedNodes,
  stats,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [exportType, setExportType] = useState<'all' | 'summary' | 'tree'>('all');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const printDocRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    if (!printDocRef.current) return;
    setIsGenerating(true);
    setDownloadSuccess(false);

    try {
      const fileName = exportType === 'all' 
        ? 'Desta-Family-Tree-Complete-Report.pdf'
        : exportType === 'summary'
          ? 'Desta-Summary-Dashboard.pdf'
          : 'Desta-Family-Tree-Lineage.pdf';

      await downloadElementAsPdf(printDocRef.current, {
        fileName,
        orientation,
      });

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 ${
      isLight ? 'bg-slate-900/40' : 'bg-slate-950/80'
    }`}>
      <div className={`border rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden transition-colors ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        {/* Modal Header */}
        <div className={`px-5 py-3.5 border-b flex items-center justify-between transition-colors ${
          isLight ? 'border-slate-200 bg-slate-50/70' : 'border-slate-800 bg-slate-950/40'
        }`}>
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20">
              <FileDown size={17} />
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-bold tracking-tight">
                PDF አውርድ (Export PDF Report)
              </h2>
              <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                የቤተሰብ ዛፍ፣ ማጠቃለያ ወይም ሙሉ ሪፖርት በPDF ያውርዱ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body: Controls & Document Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-5">
          {/* Export Scope Selector */}
          <div className="flex flex-col gap-2">
            <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              የሚወርደውን ይምረጡ (Select Content):
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Option 1: All */}
              <button
                type="button"
                onClick={() => setExportType('all')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  exportType === 'all'
                    ? (isLight ? 'bg-sky-50 border-sky-500 text-sky-950 ring-1 ring-sky-500' : 'bg-sky-500/15 border-sky-400 text-white ring-1 ring-sky-400')
                    : (isLight ? 'bg-slate-50/70 hover:bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-800/50 hover:bg-slate-800 border-slate-750 text-slate-300')
                }`}
              >
                <FileText size={16} className="mt-0.5 text-sky-500 shrink-0" />
                <div>
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <span>ሙሉ ሪፖርት (All)</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-600 dark:text-sky-300 font-normal">
                      ምርጥ
                    </span>
                  </div>
                  <div className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    ማጠቃለያ ዳሽቦርድ + ሙሉ የ፹፭ አባላት የዘር ዛፍ
                  </div>
                </div>
              </button>

              {/* Option 2: Summary Only */}
              <button
                type="button"
                onClick={() => setExportType('summary')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  exportType === 'summary'
                    ? (isLight ? 'bg-sky-50 border-sky-500 text-sky-950 ring-1 ring-sky-500' : 'bg-sky-500/15 border-sky-400 text-white ring-1 ring-sky-400')
                    : (isLight ? 'bg-slate-50/70 hover:bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-800/50 hover:bg-slate-800 border-slate-750 text-slate-300')
                }`}
              >
                <Layers size={16} className="mt-0.5 text-amber-500 shrink-0" />
                <div>
                  <div className="font-bold text-xs">ማጠቃለያ ዳሽቦርድ (Summary)</div>
                  <div className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    ዋና ዋና መረጃዎች፣ የ፯ ቅርንጫፎች እና የትውልድ ስርጭት
                  </div>
                </div>
              </button>

              {/* Option 3: Tree Only */}
              <button
                type="button"
                onClick={() => setExportType('tree')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  exportType === 'tree'
                    ? (isLight ? 'bg-sky-50 border-sky-500 text-sky-950 ring-1 ring-sky-500' : 'bg-sky-500/15 border-sky-400 text-white ring-1 ring-sky-400')
                    : (isLight ? 'bg-slate-50/70 hover:bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-800/50 hover:bg-slate-800 border-slate-750 text-slate-300')
                }`}
              >
                <GitFork size={16} className="mt-0.5 text-emerald-500 shrink-0" />
                <div>
                  <div className="font-bold text-xs">የቤተሰብ ዛፍ ብቻ (Tree)</div>
                  <div className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    የደስታና የ፯ቱ ቅርንጫፎች ሙሉ ተዋረድ ዝርዝር
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Orientation Selector */}
          <div className="flex items-center gap-4 text-xs">
            <span className={`font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              ገጽ አቀማመጥ (Orientation):
            </span>
            <div className={`flex items-center p-0.5 rounded-lg border ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800 border-slate-700'
            }`}>
              <button
                type="button"
                onClick={() => setOrientation('portrait')}
                className={`px-3 py-1 rounded-md transition-all font-medium ${
                  orientation === 'portrait'
                    ? (isLight ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'bg-slate-900 text-white shadow-2xs font-bold')
                    : (isLight ? 'text-slate-600' : 'text-slate-400')
                }`}
              >
                ቁመት (Portrait)
              </button>
              <button
                type="button"
                onClick={() => setOrientation('landscape')}
                className={`px-3 py-1 rounded-md transition-all font-medium ${
                  orientation === 'landscape'
                    ? (isLight ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'bg-slate-900 text-white shadow-2xs font-bold')
                    : (isLight ? 'text-slate-600' : 'text-slate-400')
                }`}
              >
                አግድም (Landscape)
              </button>
            </div>
          </div>

          {/* Document Preview Box */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className={`font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                ቅድመ እይታ (Print Document Preview):
              </span>
              <span className={`text-[11px] font-mono ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                A4 · {stats.totalMembers} አባላት
              </span>
            </div>

            <div className={`border rounded-xl p-3 sm:p-5 overflow-auto max-h-[380px] transition-colors ${
              isLight ? 'bg-slate-100/70 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              {/* Document Wrapper that will be captured by html2canvas */}
              <div ref={printDocRef} className="rounded-lg shadow-sm overflow-hidden bg-white">
                <PdfPrintDocument
                  rootNode={rootNode}
                  flattenedNodes={flattenedNodes}
                  stats={stats}
                  exportType={exportType}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer / Action Buttons */}
        <div className={`px-5 py-3 border-t flex items-center justify-between gap-3 transition-colors ${
          isLight ? 'border-slate-200 bg-slate-50/70' : 'border-slate-800 bg-slate-950/40'
        }`}>
          <div className="flex items-center gap-2">
            {downloadSuccess && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <Check size={14} />
                PDF በተሳካ ሁኔታ ወርዷል!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrint}
              disabled={isGenerating}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all duration-150 active:scale-95 shadow-2xs ${
                isLight 
                  ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700' 
                  : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
              }`}
            >
              <Printer size={14} />
              <span>በቀጥታ አትም (Print)</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all duration-150 active:scale-95 shadow-sm ${
                isGenerating
                  ? 'bg-sky-400 text-white cursor-wait'
                  : isLight 
                    ? 'bg-slate-900 hover:bg-slate-800 text-white' 
                    : 'bg-white hover:bg-slate-100 text-slate-950'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>PDF እየተዘጋጀ ነው...</span>
                </>
              ) : (
                <>
                  <FileDown size={14} className={isLight ? 'text-amber-400' : 'text-sky-600'} />
                  <span>PDF አውርድ (Download PDF)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
