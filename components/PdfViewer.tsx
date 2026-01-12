'use client';

interface PdfViewerProps {
    fileId: string;
}

export default function PdfViewer({ fileId }: PdfViewerProps) {
    // Use Google Drive viewer in embedded mode
    const src = `https://docs.google.com/viewer?srcid=${fileId}&pid=explorer&efh=false&a=v&chrome=false&embedded=true`;

    return (
        <div className="w-full h-full min-h-[600px] border border-gray-300 rounded-lg overflow-hidden">
            <iframe
                src={src}
                className="w-full h-full"
                style={{ minHeight: '80vh' }}
                allow="autoplay"
                title="Problem Statement"
            />
        </div>
    );
}
