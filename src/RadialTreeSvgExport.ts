import { FamilyNode } from './destaFamilyData';
import { getCleanName } from './familyUtils';
import { HERITAGE_BRANCH_THEMES } from './RadialHeritageTree';

/**
 * Generates an authoritative, luxury, standalone, high-resolution vector SVG poster
 * for "የደስታ የቤተሰብ ዛፍ ሙሉ ሪፖርት / Desta Family Lineage"
 * Built with 5 concentric rings (Ring 0 to Ring 5), 8 Primary Branches,
 * muted dashed arcs for documented blank slots [ስም ያልተሞላ], and 168 nodes.
 */
export function generateRadialTreeSvg(rootNode: FamilyNode): string {
  const size = 1800;
  const center = size / 2;

  // Concentric ring radii
  const rCenter = 135;
  const rRing1 = 265;
  const rRing2 = 425;
  const rRing3 = 585;
  const rRing4 = 725;
  const rRing5 = 850;

  function countDescendantLeaves(n: FamilyNode): number {
    if (!n.children || n.children.length === 0) return 1;
    return n.children.reduce((acc, c) => acc + countDescendantLeaves(c), 0);
  }

  const branches = rootNode.children || [];
  const branchWeights = branches.map(b => Math.max(countDescendantLeaves(b), 4));
  const totalWeight = branchWeights.reduce((a, b) => a + b, 0) || 1;

  function escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  }

  function createSectorPath(rIn: number, rOut: number, a1: number, a2: number): string {
    const span = a2 - a1;
    const inset = span > 0.05 ? 0.002 : 0;
    const effA1 = a1 + inset;
    const effA2 = a2 - inset;

    const p1x = center + rIn * Math.cos(effA1);
    const p1y = center + rIn * Math.sin(effA1);
    const p2x = center + rOut * Math.cos(effA1);
    const p2y = center + rOut * Math.sin(effA1);
    const p3x = center + rOut * Math.cos(effA2);
    const p3y = center + rOut * Math.sin(effA2);
    const p4x = center + rIn * Math.cos(effA2);
    const p4y = center + rIn * Math.sin(effA2);
    const largeArc = (effA2 - effA1) > Math.PI ? 1 : 0;

    return `M ${p1x.toFixed(2)} ${p1y.toFixed(2)} L ${p2x.toFixed(2)} ${p2y.toFixed(2)} A ${rOut} ${rOut} 0 ${largeArc} 1 ${p3x.toFixed(2)} ${p3y.toFixed(2)} L ${p4x.toFixed(2)} ${p4y.toFixed(2)} A ${rIn} ${rIn} 0 ${largeArc} 0 ${p1x.toFixed(2)} ${p1y.toFixed(2)} Z`;
  }

  function createSectorText(name: string, rIn: number, rOut: number, a1: number, a2: number, fontSize: number): string {
    const midAngle = (a1 + a2) / 2;
    const midR = (rIn + rOut) / 2;
    let deg = (midAngle * 180) / Math.PI;

    let display = getCleanName(name);
    let fill = '#2B2421';
    if (name.includes('[ስም ያልተሞላ]')) {
      display = '— ያልተሞላ —';
      fill = '#8C7D70';
    } else if (name === '[?]') {
      display = '?';
      fill = '#7D6F63';
    }

    let x = center + midR * Math.cos(midAngle);
    let y = center + midR * Math.sin(midAngle);

    // Flip text in left hemisphere so it's always readable upright
    if (deg > 90 && deg < 270) {
      deg += 180;
    } else if (deg < -90) {
      deg += 180;
    }

    const span = a2 - a1;
    if (span < 0.05) {
      fontSize = Math.max(7, fontSize - 2);
    }

    return `<text x="${x.toFixed(2)}" y="${y.toFixed(2)}" font-family="'Noto Serif Ethiopic', 'Noto Sans Ethiopic', serif" font-size="${fontSize}" font-weight="600" fill="${fill}" text-anchor="middle" dominant-baseline="central" transform="rotate(${deg.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)})">${escapeXml(display)}</text>`;
  }

  let sectorsSvg = '';
  let labelsSvg = '';

  function renderChildrenRecursive(
    node: FamilyNode,
    bIdx: number,
    startA: number,
    endA: number,
    currentGen: number
  ) {
    const children = node.children || [];
    if (children.length === 0) return;

    const totalChildWeight = children.reduce((acc, c) => acc + Math.max(1, countDescendantLeaves(c)), 0);
    let childAngle = startA;

    children.forEach((childNode) => {
      const cWeight = Math.max(1, countDescendantLeaves(childNode));
      const cSweep = (cWeight / totalChildWeight) * (endA - startA);
      const cStart = childAngle;
      const cEnd = childAngle + cSweep;
      childAngle = cEnd;

      let inR = rRing1;
      let outR = rRing2;
      let fontSz = 11;
      let fill = '#FAF8F4';

      // Concentric ring radii allocation (NO HOLLOW RINGS):
      // Ring 2 (Grandchildren): rRing1 to rRing2 (Immediately borders Ring 1, zero gap!)
      // Ring 3 (Great-grandchildren): rRing2 to rRing3
      // Ring 4 (Great-great-grandchildren): rRing3 to rRing4
      // Ring 5 (Outer Rim): rRing4 to rRing5
      if (currentGen === 2) {
        inR = rRing1;
        outR = rRing2;
        fontSz = 11;
        fill = '#FAF8F4';
      } else if (currentGen === 3) {
        inR = rRing2;
        outR = rRing3;
        fontSz = 10;
        fill = '#FDFBF7';
      } else if (currentGen === 4) {
        inR = rRing3;
        outR = rRing4;
        fontSz = 9;
        fill = '#FFFFFF';
      } else if (currentGen >= 5) {
        inR = rRing4;
        outR = rRing5;
        fontSz = 8.5;
        fill = '#FFFFFF';
      }

      let stroke = '#8C7D70';
      let strokeW = '0.6';
      let strokeDash = '';

      if (childNode.name.includes('[ስም ያልተሞላ]')) {
        fill = '#EED9C4'; // Distinct warm beige/tan placeholder as required
        stroke = '#B8A898';
        strokeDash = ' stroke-dasharray="3,3"';
      } else if (childNode.name === '[?]' || childNode.reviewRequired) {
        fill = '#F7F3EB';
        stroke = '#A8998A';
        strokeDash = ' stroke-dasharray="2,2"';
      }

      sectorsSvg += `<path d="${createSectorPath(inR, outR, cStart, cEnd)}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeW}"${strokeDash} />\n`;
      labelsSvg += createSectorText(childNode.name, inR, outR, cStart, cEnd, fontSz) + '\n';

      if (childNode.children && childNode.children.length > 0) {
        renderChildrenRecursive(childNode, bIdx, cStart, cEnd, currentGen + 1);
      }
    });
  }

  // Ring 1 (8 Primary Children)
  let currentAngle = -Math.PI / 2;
  branches.forEach((branch, bIdx) => {
    const sweep = (branchWeights[bIdx] / totalWeight) * 2 * Math.PI;
    const startA = currentAngle;
    const endA = currentAngle + sweep;
    currentAngle = endA;

    const bTheme = HERITAGE_BRANCH_THEMES[bIdx] || HERITAGE_BRANCH_THEMES[0];

    // Sector for Ring 1
    sectorsSvg += `<path d="${createSectorPath(rCenter, rRing1, startA, endA)}" fill="${bTheme.bg}" stroke="${bTheme.border}" stroke-width="1.4" />\n`;
    labelsSvg += createSectorText(branch.name, rCenter, rRing1, startA, endA, 14.5) + '\n';

    // Direct Grandchildren (Ring 2 - fully populated, directly borders Ring 1)
    if (branch.children && branch.children.length > 0) {
      renderChildrenRecursive(branch, bIdx, startA, endA, 2);
    }
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size + 280}" width="${size}" height="${size + 280}">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&amp;family=Noto+Serif+Ethiopic:wght@400;600;700;800&amp;display=swap');
    </style>
  </defs>

  <!-- Background Warm Heritage Parchment Canvas -->
  <rect width="${size}" height="${size + 280}" fill="#FAF8F5" />

  <!-- Top Metric Header -->
  <g id="header-metrics">
    <text x="60" y="55" font-family="'Noto Serif Ethiopic', serif" font-size="16" font-weight="700" fill="#5C2027">የደስታ የቤተሰብ ዛፍ ሙሉ ሪፖርት / Desta Family Lineage</text>
    <text x="${size - 60}" y="55" font-family="'Noto Serif Ethiopic', serif" font-size="14" font-weight="700" fill="#2B2421" text-anchor="end">ጠቅላላ አባላት፡ 168 (168 Listed Nodes / 8 Primary Branches / 5 Generations)</text>
    <line x1="60" y1="72" x2="${size - 60}" y2="72" stroke="#C5A059" stroke-width="1" opacity="0.6" />
  </g>

  <!-- Outer Concentric Guide Rings -->
  <circle cx="${center}" cy="${center}" r="${rRing1}" fill="none" stroke="#2B2421" stroke-width="0.8" opacity="0.25" />
  <circle cx="${center}" cy="${center}" r="${rRing2}" fill="none" stroke="#8C7D70" stroke-width="0.6" stroke-dasharray="3 3" opacity="0.3" />
  <circle cx="${center}" cy="${center}" r="${rRing3}" fill="none" stroke="#8C7D70" stroke-width="0.6" stroke-dasharray="3 3" opacity="0.3" />
  <circle cx="${center}" cy="${center}" r="${rRing4}" fill="none" stroke="#8C7D70" stroke-width="0.6" stroke-dasharray="3 3" opacity="0.3" />
  <circle cx="${center}" cy="${center}" r="${rRing5 + 10}" fill="none" stroke="#C5A059" stroke-width="1.4" opacity="0.75" />
  <circle cx="${center}" cy="${center}" r="${rRing5 + 18}" fill="none" stroke="#2B2421" stroke-width="0.6" opacity="0.35" />
  <circle cx="${center}" cy="${center}" r="${rRing5 + 26}" fill="none" stroke="#8C7D70" stroke-width="0.4" stroke-dasharray="4 4" opacity="0.4" />

  <!-- Radial Sectors -->
  <g id="sectors">
    ${sectorsSvg}
  </g>

  <!-- Sector Text Labels -->
  <g id="labels">
    ${labelsSvg}
  </g>

  <!-- Center Founding Ancestor Medallion (ደስታ - DESTA ROOT ANCESTOR) -->
  <g id="center-medallion">
    <circle cx="${center}" cy="${center}" r="${rCenter}" fill="#FAF8F5" stroke="#2B2421" stroke-width="3" />
    <circle cx="${center}" cy="${center}" r="${rCenter - 5}" fill="none" stroke="#C5A059" stroke-width="1.5" />
    <circle cx="${center}" cy="${center}" r="${rCenter - 11}" fill="none" stroke="#2B2421" stroke-width="0.6" opacity="0.4" />

    <text x="${center}" y="${center - 26}" font-family="'Noto Serif Ethiopic', 'Noto Sans Ethiopic', serif" font-size="38" font-weight="800" fill="#2B2421" text-anchor="middle">ደስታ</text>
    <text x="${center}" y="${center + 12}" font-family="'EB Garamond', Georgia, serif" font-size="17" font-weight="600" letter-spacing="0.4em" fill="#5C2027" text-anchor="middle">D E S T A</text>
    <text x="${center}" y="${center + 36}" font-family="'EB Garamond', Georgia, serif" font-size="11.5" font-weight="500" letter-spacing="0.25em" fill="#8C7D70" text-anchor="middle">ROOT ANCESTOR</text>
  </g>

  <!-- Corner Legend -->
  <g id="legend" transform="translate(60, ${size + 30})">
    <rect x="0" y="8" width="16" height="16" fill="#FAF8F4" stroke="#8C7D70" stroke-width="0.8" rx="2" />
    <text x="26" y="21" font-family="'Noto Serif Ethiopic', serif" font-size="12" fill="#2B2421">የተመዘገቡ አባላት (Documented Members)</text>

    <rect x="0" y="34" width="16" height="16" fill="#EED9C4" stroke="#B8A898" stroke-dasharray="3 3" stroke-width="0.8" rx="2" />
    <text x="26" y="47" font-family="'Noto Serif Ethiopic', serif" font-size="12" fill="#7D6857" font-weight="600">■ = ያልተሞላ ስም (Documented Placeholder)</text>
  </g>

  <!-- Poster Title Section at Bottom -->
  <g id="footer-title" transform="translate(0, ${size + 30})">
    <line x1="220" y1="0" x2="${size - 220}" y2="0" stroke="#C5A059" stroke-width="1" opacity="0.6" />
    
    <text x="${center}" y="52" font-family="'Noto Serif Ethiopic', serif" font-size="28" font-weight="800" fill="#5C2027" text-anchor="middle">የደስታ የቤተሰብ ዛፍ ሙሉ ሪፖርት</text>
    <text x="${center}" y="92" font-family="'EB Garamond', Georgia, serif" font-size="22" font-weight="700" letter-spacing="0.1em" fill="#2B2421" text-anchor="middle">Desta Family Lineage · Circular Radial Family Tree</text>
    
    <text x="${center}" y="128" font-family="'Noto Serif Ethiopic', serif" font-size="14" font-weight="600" fill="#8C7D70" text-anchor="middle">፰ ዋና ዋና ቅርንጫፎች • ፭ ትውልዶች (Ring 0 እስከ Ring 5) • ጠቅላላ አባላት: 168</text>
    
    <line x1="420" y1="150" x2="${size - 420}" y2="150" stroke="#E0D7CA" stroke-width="0.8" />
    
    <text x="${center}" y="178" font-family="'EB Garamond', Georgia, serif" font-size="13" font-weight="600" letter-spacing="0.2em" fill="#2B2421" text-anchor="middle">8 PRIMARY BRANCHES • 168 LISTED NODES • 5 CONCENTRIC GENERATIONS</text>
    <text x="${center}" y="204" font-family="'EB Garamond', Georgia, serif" font-size="11" font-style="italic" fill="#8C7D70" text-anchor="middle">Official Heritage Archive Record · Complete master transcription with documented blank slots</text>
  </g>
</svg>`;
}
