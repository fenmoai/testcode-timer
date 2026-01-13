'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    selectedFile: File | null;
    error?: string;
    label?: string;
}

export default function FileUpload({ onFileSelect, selectedFile, error, label = "Drag & drop an image here, or click to select" }: FileUploadProps) {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            onFileSelect(acceptedFiles[0]);
        }
    }, [onFileSelect]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif']
        },
        maxFiles: 1,
        multiple: false
    });

    return (
        <div className="w-full">
            <div
                {...getRootProps()}
                className={`
                    flex flex-col items-center justify-center w-full h-40 
                    border-2 border-dashed rounded-lg cursor-pointer 
                    transition-all duration-200 ease-in-out
                    ${isDragActive ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}
                    ${error ? 'border-red-500 bg-red-50' : ''}
                    ${selectedFile ? 'border-green-500 bg-green-50' : ''}
                `}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                    {selectedFile ? (
                        <>
                            <svg className="w-8 h-8 mb-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <p className="mb-1 text-sm text-green-700 font-semibold">{selectedFile.name}</p>
                            <p className="text-xs text-green-600">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                            <p className="mt-2 text-xs text-green-600 underline">Click to change</p>
                        </>
                    ) : (
                        <>
                            <svg className={`w-8 h-8 mb-3 ${isDragActive ? 'text-blue-500' : (error ? 'text-red-500' : 'text-gray-500')}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                            </svg>
                            <p className={`mb-2 text-sm ${isDragActive ? 'text-blue-700' : 'text-gray-500'}`}>
                                <span className="font-semibold">{isDragActive ? "Drop to upload" : "Click to upload"}</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-400">PNG, JPG or JPEG (MAX. 1 file)</p>
                        </>
                    )}
                </div>
            </div>
            {error && <p className="mt-2 text-xs text-red-600 font-medium">{error}</p>}
        </div>
    );
}
