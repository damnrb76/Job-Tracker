
// app.js
const { useState, useEffect } = React;
const { Plus, Briefcase, FileText, Mail, Calendar, CheckCircle, AlertCircle, Search, Download, Clock, X, ChevronRight, Edit2, Trash2 } = lucide;

// Utility functions
const exportToCSV = (data) => {
    const replacer = (key, value) => value === null ? '' : value;
    const header = Object.keys(data[0]);
    let csv = data.map(row => header.map(fieldName => 
        JSON.stringify(row[fieldName], replacer)).join(','));
    csv.unshift(header.join(','));
    return csv.join('\r\n');
};

const calculateATSScore = (text) => {
    const commonKeywords = ['experience', 'skills', 'project', 'team', 'leadership', 'development', 'management'];
    const score = commonKeywords.reduce((acc, keyword) => {
        return acc + (text.toLowerCase().includes(keyword) ? 15 : 0);
    }, 0);
    return Math.min(100, score);
};

// Components
const ExportPreview = ({ data, format, type, onConfirm, onCancel }) => {
    const renderPreviewContent = () => {
        switch (format) {
            case 'csv':
                const csvData = type === 'documents' 
                    ? [...data.cvs.map(cv => ({ type: 'CV', ...cv })), 
                       ...data.coverLetters.map(letter => ({ type: 'Cover Letter', ...letter }))]
                    : type === 'history'
                    ? data.map(app => ({
                        company: app.company,
                        role: app.role,
                        interviewCount: app.interviews.length,
                        lastInterview: app.interviews[app.interviews.length - 1]?.date || 'None',
                        followUpCount: app.followUps.length
                    }))
                    : data.applications.map(app => ({
                        company: app.company,
                        role: app.role,
                        status: app.status,
                        dateApplied: app.dateApplied
                    }));

                return (
                    <div className="overflow-x-auto">
                        <table className="csv-preview-table">
                            <thead>
                                <tr>
                                    {Object.keys(csvData[0] || {}).map((header) => (
                                        <th key={header}>{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {csvData.slice(0, 5).map((row, idx) => (
                                    <tr key={idx}>
                                        {Object.values(row).map((value, i) => (
                                            <td key={i}>
                                                {typeof value === 'object' ? JSON.stringify(value) : value}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );

            case 'pdf':
                return (
                    <div className="prose">
                        <div className="bg-gray-50 p-6 rounded-lg font-mono text-sm">
                            {type === 'documents' ? (
                                <>
                                    <h3>Documents Export Preview</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <h4>CVs ({data.cvs.length})</h4>
                                            {data.cvs.slice(0, 3).map((cv, i) => (
                                                <div key={i} className="ml-4">
                                                    - {cv.name} ({cv.category})
                                                </div>
                                            ))}
                                        </div>
                                        <div>
                                            <h4>Cover Letters ({data.coverLetters.length})</h4>
                                            {data.coverLetters.slice(0, 3).map((letter, i) => (
                                                <div key={i} className="ml-4">
                                                    - {letter.name} ({letter.category})
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : type === 'history' ? (
                                <>
                                    <h3>Interview History Preview</h3>
                                    {data.slice(0, 3).map((app, i) => (
                                        <div key={i} className="mb-4">
                                            <h4>{app.company} - {app.role}</h4>
                                            <div className="ml-4">
                                                <div>Interviews: {app.interviews.length}</div>
                                                <div>Follow-ups: {app.followUps.length}</div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <>
                                    <h3>Applications Preview</h3>
                                    {data.applications.slice(0, 3).map((app, i) => (
                                        <div key={i} className="mb-4">
                                            <h4>{app.company}</h4>
                                            <div className="ml-4">
                                                <div>Role: {app.role}</div>
                                                <div>Status: {app.status}</div>
                                                <div>Applied: {app.dateApplied || 'Not yet applied'}</div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                );

            default:
                return (
                    <pre className="bg-gray-50 p-6 rounded-lg overflow-x-auto">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto preview-modal">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">
                        Export Preview - {type.charAt(0).toUpperCase() + type.slice(1)} ({format.toUpperCase()})
                    </h3>
                    <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
                        <X />
                    </button>
                </div>
                
                <div className="mb-6">
                    {renderPreviewContent()}
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                        Confirm Export
                    </button>
                </div>
            </div>
        </div>
    );
};

const ATSChecker = ({ onClose }) => {
    const [text, setText] = useState('');
    const score = calculateATSScore(text);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">ATS/LPS Checker</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X />
                    </button>
                </div>
                <textarea
                    className="w-full h-64 p-4 border rounded-lg mb-4"
                    placeholder="Paste your CV or cover letter content here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                <div className="flex items-center space-x-4 mb-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div
                            className="bg-purple-600 rounded-full h-4"
                            style={{ width: `${score}%` }}
                        />
                    </div>
                    <span className="font-bold">{score}%</span>
                </div>
                <div className="space-y-2">
                    <h4 className="font-medium">Suggestions:</h4>
                    <ul className="list-disc pl-5
