import { TOCNode, Chunk } from '../types/document';

export interface RawTOCSection {
    title: string;
    chapters?: RawTOCSection[];
    sections?: RawTOCSection[];
    subsections?: RawTOCSection[];
    subsubsections?: RawTOCSection[];
    subsubsubsections?: RawTOCSection[];
    children?: RawTOCSection[];
    [key: string]: any;
}

export interface RawTOCRoot {
    title?: string;
    chapters?: RawTOCSection[];
    sections?: RawTOCSection[];
    subsections?: RawTOCSection[];
    subsubsections?: RawTOCSection[];
    subsubsubsections?: RawTOCSection[];
    children?: RawTOCSection[];
    [key: string]: any;
}

// Backend Chunk Format
export interface BackendChunkNode {
    title: string;
    start_char: number | null;
    end_char: number | null;
    page_start: number | null;
    page_end: number | null;
    content: string | null;
    // Possible recursive children fields
    chapters?: BackendChunkNode[];
    sections?: BackendChunkNode[];
    subsections?: BackendChunkNode[];
    subsubsections?: BackendChunkNode[];
    subsubsubsections?: BackendChunkNode[];
}

export interface BackendChunkRoot {
    title: string;
    chapters?: BackendChunkNode[];
    sections?: BackendChunkNode[];
    // ...other metadata
}

const generateId = (text: string, level: number, index: number): string => {
    let hash = 0;
    const str = `${text}-${level}-${index}`;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }
    return `node-${Math.abs(hash)}`;
};

const CHILD_KEYS = ["chapters", "sections", "subsections", "subsubsections", "subsubsubsections", "children"];

export const processBackendChunks = (
    markdownText: string,
    rawTOC: RawTOCRoot,
    rawChunks: BackendChunkRoot
): { tocNodes: Record<string, TOCNode>, rootIds: string[], chunks: Chunk[] } => {
    const tocNodes: Record<string, TOCNode> = {};
    const rootIds: string[] = [];
    const chunks: Chunk[] = [];
    let nodeCounter = 0;

    // Both rawTOC and rawChunks contain an identical nested tree structure.
    // We traverse them IN PARALLEL to link the IDs.
    const processNode = (rawNode: RawTOCSection, chunkNode: BackendChunkNode | undefined, level: number): string => {
        nodeCounter++;
        const title = rawNode.title || 'Untitled';
        const id = generateId(title, level, nodeCounter);
        const childrenIds: string[] = [];

        // 1. Create the chunk from the backend chunkNode data
        const chunkId = `chunk-${id}`;
        if (chunkNode && chunkNode.start_char !== null && chunkNode.end_char !== null) {
            chunks.push({
                id: chunkId,
                title: chunkNode.title,
                startChar: chunkNode.start_char,
                endChar: chunkNode.end_char,
                pageNumber: chunkNode.page_start || undefined,
                content: markdownText.substring(chunkNode.start_char, chunkNode.end_char),
                mappingStatus: 'auto_mapped'
            });
        }

        // 2. Map TOC to the Chunk
        const node: TOCNode = {
            id,
            title,
            level,
            children: [],
            chunkIds: chunkNode && chunkNode.start_char !== null ? [chunkId] : [],
            expanded: level <= 1,
        };

        tocNodes[id] = node;

        // 3. Process children recursively
        // Since we don't know the exact key used at this level (chapters, sections, etc.), we extract all children.
        const tocChildren: RawTOCSection[] = [];
        for (const key of CHILD_KEYS) {
            const arr = (rawNode as any)[key];
            if (Array.isArray(arr)) {
                tocChildren.push(...arr);
            }
        }

        const chunkChildren: BackendChunkNode[] = [];
        if (chunkNode) {
            for (const key of CHILD_KEYS) {
                const arr = (chunkNode as any)[key];
                if (Array.isArray(arr)) {
                    chunkChildren.push(...arr);
                }
            }
        }

        // Assuming 1:1 correspondence between TOC children and Chunk children arrays
        for (let i = 0; i < tocChildren.length; i++) {
            const cNode = chunkChildren.length > i ? chunkChildren[i] : undefined;
            childrenIds.push(processNode(tocChildren[i], cNode, level + 1));
        }

        node.children = childrenIds;
        return id;
    };

    const topTOCNodes: RawTOCSection[] = [];
    for (const key of CHILD_KEYS) {
        const arr = (rawTOC as any)[key];
        if (Array.isArray(arr)) {
            topTOCNodes.push(...arr);
        }
    }

    const topChunkNodes: BackendChunkNode[] = [];
    for (const key of CHILD_KEYS) {
        const arr = (rawChunks as any)[key];
        if (Array.isArray(arr)) {
            topChunkNodes.push(...arr);
        }
    }

    for (let i = 0; i < topTOCNodes.length; i++) {
        const cNode = topChunkNodes.length > i ? topChunkNodes[i] : undefined;
        rootIds.push(processNode(topTOCNodes[i], cNode, 1));
    }

    return { tocNodes, rootIds, chunks };
};
