'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FileUpload from './FileUpload';

interface SubmissionFormProps {
    testCode: string;
}

export default function SubmissionForm({ testCode }: SubmissionFormProps) {
    const [link1, setLink1] = useState('');
    const [link2, setLink2] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError('Please upload the proof image.');
            return;
        }
        setUploading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('testCode', testCode);
            formData.append('link1', link1);
            formData.append('link2', link2);
            formData.append('file', file);

            const res = await fetch('/api/testcode/submit', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                router.refresh();
                // Do NOT set uploading to false here, to prevent double submission during refresh
            } else {
                setError(data.error || 'Submission failed');
                setUploading(false);
            }
        } catch (e) {
            setError('Network error occurred.');
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 font-sans">
            <div className="bg-white shadow-lg rounded-lg px-8 pt-8 pb-8 mb-4 max-w-2xl w-full border-t-4 border-blue-600">
                <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">Assignment Submission Form</h1>

                <div className="mb-8 text-gray-700 text-sm space-y-4 bg-blue-50 p-6 rounded-md border border-blue-100">
                    <p className="font-medium">You are required to submit your solution for the assignment using this form. Please read all instructions carefully and ensure your submission is complete before sending.</p>

                    <div>
                        <p className="font-bold mb-1">Required items:</p>
                        <ol className="list-decimal pl-5 space-y-3">
                            <li>
                                <span className="font-semibold">Public GitHub repository link</span>
                                <ul className="list-disc pl-5 mt-1 text-gray-600 space-y-1">
                                    <li>The repository must be public at the time of submission.</li>
                                    <li>The code you submit should match what is currently deployed (same commit history).</li>
                                    <li>Paste the full HTTPS URL to the repository (for example, <code>https://github.com/username/repo-name</code>).</li>
                                </ul>
                            </li>
                            <li>
                                <span className="font-semibold">Deployment link (Vercel or equivalent)</span>
                                <ul className="list-disc pl-5 mt-1 text-gray-600 space-y-1">
                                    <li>Provide a live deployment URL where the app can be accessed (for example, Vercel, Netlify, Render, etc.).</li>
                                    <li>The deployment must use the same repository you shared above.</li>
                                    <li>Ensure the deployment is working and publicly accessible at the time of submission.</li>
                                </ul>
                            </li>
                            <li>
                                <span className="font-semibold">Screenshot of GitHub commit history (Commits page)</span>
                                <ul className="list-disc pl-5 mt-1 text-gray-600 space-y-1">
                                    <li>Go to your GitHub repository’s Commits page for the default branch (e.g., main or master).</li>
                                    <li>Take a screenshot showing the commit history as it exists at the time of submission, including commit messages and timestamps visible in the list.</li>
                                    <li>Upload this screenshot in the file-upload question below.</li>
                                    <li>This screenshot will be used to verify the timeline and integrity of your work.</li>
                                </ul>
                            </li>
                        </ol>
                    </div>

                    <p className="text-xs text-gray-500 italic mt-4 pt-4 border-t border-blue-200">
                        By submitting this form, you confirm that: The GitHub repository link, deployment link, and screenshot all correspond to the same project. The work is your own, and the commit history accurately reflects your development process.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-gray-100 p-4 rounded mb-6">
                        <label className="block text-gray-600 text-xs font-bold uppercase tracking-wide mb-1">
                            Test Code
                        </label>
                        <input
                            type="text"
                            value={testCode}
                            disabled
                            className="w-full bg-transparent text-lg font-mono font-bold text-gray-700 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-800 text-base font-semibold mb-2" htmlFor="link1">
                            Public GitHub repository link <span className="text-red-600">*</span>
                        </label>
                        <input
                            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-300 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
                            id="link1"
                            type="url"
                            placeholder="https://github.com/username/project"
                            value={link1}
                            onChange={(e) => setLink1(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-800 text-base font-semibold mb-2" htmlFor="link2">
                            Live deployment link <span className="text-gray-400 font-normal text-sm">(Optional)</span>
                        </label>
                        <input
                            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-300 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
                            id="link2"
                            type="url"
                            placeholder="https://project.vercel.app"
                            value={link2}
                            onChange={(e) => setLink2(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-gray-800 text-base font-semibold mb-2" htmlFor="proof">
                            Screenshot of GitHub commit history <span className="text-red-600">*</span>
                        </label>
                        <div className="flex items-center justify-center w-full">
                            <FileUpload
                                onFileSelect={(selectedFile) => setFile(selectedFile)}
                                selectedFile={file}
                                error={!file ? "" : undefined} // Only show error if submitting or handled by state
                            />
                        </div>
                    </div>

                    {error && <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 text-center" role="alert">{error}</div>}

                    <button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-lg shadow-md focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                        type="submit"
                        disabled={uploading}
                    >
                        {uploading ? 'Submitting...' : 'Submit Answers'}
                    </button>
                </form>
            </div>
        </div>
    );
}
