import { FamilyNode } from './destaFamilyData';

export interface TreeStats {
  totalMembers: number;
  uncertainCount: number;
  confirmedCount: number;
  maxGenerations: number;
  directChildrenCount: number;
}

export function computeTreeStats(root: FamilyNode): TreeStats {
  let total = 0;
  let uncertain = 0;
  let maxGen = 0;

  function traverse(node: FamilyNode, currentGen: number) {
    total++;
    if (node.name.includes('[?]')) {
      uncertain++;
    }
    if (currentGen > maxGen) {
      maxGen = currentGen;
    }
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        traverse(child, currentGen + 1);
      }
    }
  }

  traverse(root, 1);

  return {
    totalMembers: total,
    uncertainCount: uncertain,
    confirmedCount: total - uncertain,
    maxGenerations: maxGen,
    directChildrenCount: root.children ? root.children.length : 0,
  };
}

export interface FlattenedNode {
  id: string;
  name: string;
  isUncertain: boolean;
  generation: number;
  path: string[];
  parentId: string | null;
  childrenCount: number;
  nodeRef: FamilyNode;
}

export function flattenTree(root: FamilyNode): FlattenedNode[] {
  const result: FlattenedNode[] = [];

  function traverse(node: FamilyNode, gen: number, path: string[], parentId: string | null, index: number) {
    const id = `${path.join('-')}-${index}-${node.name}`;
    const currentPath = [...path, node.name];
    
    result.push({
      id,
      name: node.name,
      isUncertain: node.name.includes('[?]'),
      generation: gen,
      path: currentPath,
      parentId,
      childrenCount: node.children ? node.children.length : 0,
      nodeRef: node,
    });

    if (node.children) {
      node.children.forEach((child, idx) => {
        traverse(child, gen + 1, currentPath, id, idx);
      });
    }
  }

  traverse(root, 1, [], null, 0);
  return result;
}

export function getCleanName(name: string): string {
  return name.replace(/\[\?\]/g, '').trim();
}
