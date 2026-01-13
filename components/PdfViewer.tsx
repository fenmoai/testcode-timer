'use client';

interface PdfViewerProps {
    fileId: string;
}

export default function PdfViewer({ fileId }: PdfViewerProps) {
    // Use modern Google Drive preview URL
    const src = `https://drive.google.com/file/d/${fileId}/preview`;

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
