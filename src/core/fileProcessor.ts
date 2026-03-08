import { DocumentState } from '../types/document';
import { processBackendChunks, RawTOCRoot, BackendChunkRoot } from './chunkLoader';

export const processUploadedFiles = async (
    pdfFile: File,
    markdownFile: File,
    tocFile: File,
    chunksFile: File
): Promise<DocumentState> => {
    const markdownText = (await markdownFile.text()).replace(/\r\n/g, '\n');
    const tocText = await tocFile.text();
    const chunksText = await chunksFile.text();

    const rawTOC: RawTOCRoot = JSON.parse(tocText);
    const rawChunks: BackendChunkRoot = JSON.parse(chunksText);

    const { tocNodes, rootIds, chunks } = processBackendChunks(markdownText, rawTOC, rawChunks);

    const pdfUrl = URL.createObjectURL(pdfFile);

    return {
        id: `doc-${Date.now()}`,
        name: pdfFile.name,
        pdfUrl,
        markdown: markdownText,
        tocNodes,
        tocRootIds: rootIds,
        chunks
    };
};
