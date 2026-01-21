import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import api from '../api/axios';
import { LogOut, CheckCircle, Clock, AlertTriangle, FileText, Upload, Send } from 'lucide-react';

const PoliceDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [complaints, setComplaints] = useState([]);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [updates, setUpdates] = useState([]);

    // Actions
    const [statusNote, setStatusNote] = useState('');
    const [newStatus, setNewStatus] = useState('');
    const [updateText, setUpdateText] = useState('');
    const [evidenceUrl, setEvidenceUrl] = useState('');

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const res = await api.get('/complaints/station');
            setComplaints(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchDetails = async (id) => {
        try {
            const res = await api.get(`/complaints/${id}`);
            setSelectedComplaint(res.data);
            setUpdates(res.data.timeline || []);
            setNewStatus(res.data.current_status);
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdateStatus = async () => {
        if (!statusNote) return alert('Please add remarks');
        try {
            await api.put(`/complaints/${selectedComplaint.complaint_id}/status`, {
                status: newStatus,
                remarks: statusNote
            });
            alert('Status Updated');
            fetchDetails(selectedComplaint.complaint_id);
            fetchComplaints(); // Refresh list
            setStatusNote('');
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const handleAddUpdate = async () => {
        if (!updateText) return;
        try {
            await api.post(`/complaints/${selectedComplaint.complaint_id}/updates`, {
                text: updateText,
                visibility: 'VICTIM'
            });
            setUpdateText('');
            fetchDetails(selectedComplaint.complaint_id);
        } catch (error) {
            alert('Failed to post update');
        }
    };

    const handleUploadEvidence = async () => {
        if (!evidenceUrl) return;
        try {
            await api.post(`/complaints/${selectedComplaint.complaint_id}/evidence`, {
                file_url: evidenceUrl,
                evidence_type: 'IMAGE',
                description: 'Evidence uploaded by officer'
            });
            setEvidenceUrl('');
            alert('Evidence Added');
            fetchDetails(selectedComplaint.complaint_id);
        } catch (error) {
            alert('Failed to upload evidence');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <header className="bg-brand-900 shadow-lg text-white sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <span className="text-brand-500">Officer</span> Console
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-300 hidden sm:block">Officer {user?.full_name}</span>
                        <button onClick={logout} className="bg-brand-800 hover:bg-brand-700 px-3 py-1 rounded text-sm font-medium flex items-center gap-1 transition-colors">
                            <LogOut className="w-4 h-4" /> Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Panel: Complaint List */}
                <div className="lg:col-span-1 bg-white rounded-xl shadow-sm overflow-hidden h-fit">
                    <div className="p-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700">
                        Assigned Complaints
                    </div>
                    <div className="divide-y divide-gray-100 max-h-[80vh] overflow-y-auto">
                        {complaints.map(complaint => (
                            <div
                                key={complaint.complaint_id}
                                onClick={() => fetchDetails(complaint.complaint_id)}
                                className={`p-4 cursor-pointer hover:bg-blue-50 transition-colors ${selectedComplaint?.complaint_id === complaint.complaint_id ? 'bg-blue-50 border-l-4 border-brand-500' : ''}`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-bold text-gray-500">#{complaint.complaint_id}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${complaint.current_status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                        {complaint.current_status}
                                    </span>
                                </div>
                                <h4 className="text-sm font-bold text-gray-800 line-clamp-1">{complaint.title}</h4>
                                <p className="text-xs text-gray-500 mt-1">{new Date(complaint.created_at).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel: Details & Actions */}
                <div className="lg:col-span-2 space-y-6">
                    {selectedComplaint ? (
                        <>
                            {/* Complaint Header */}
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedComplaint.title}</h2>
                                <div className="text-sm text-gray-600 mb-4">
                                    <p>Victim: <span className="font-semibold">{selectedComplaint.victim?.full_name}</span></p>
                                    <p>Contact: {selectedComplaint.victim?.phone_number}</p>
                                    <p>Location: {selectedComplaint.incident_location}</p>
                                </div>
                                <p className="text-gray-800 bg-gray-50 p-4 rounded-lg text-sm">{selectedComplaint.description}</p>
                            </div>

                            {/* Action Panel */}
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Status Update */}
                                <div className="bg-white p-6 rounded-xl shadow-sm">
                                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-brand-600" /> Update Status</h3>
                                    <div className="space-y-3">
                                        <select
                                            className="w-full p-2 border rounded-lg text-sm"
                                            value={newStatus}
                                            onChange={(e) => setNewStatus(e.target.value)}
                                        >
                                            <option>PENDING</option>
                                            <option>INVESTIGATION</option>
                                            <option>RESOLVED</option>
                                            <option>CLOSED</option>
                                        </select>
                                        <textarea
                                            className="w-full p-2 border rounded-lg text-sm h-20"
                                            placeholder="Remarks (Required)"
                                            value={statusNote}
                                            onChange={(e) => setStatusNote(e.target.value)}
                                        />
                                        <button
                                            onClick={handleUpdateStatus}
                                            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2 rounded-lg text-sm"
                                        >
                                            Update Status
                                        </button>
                                    </div>
                                </div>

                                {/* Evidence Upload */}
                                <div className="bg-white p-6 rounded-xl shadow-sm">
                                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Upload className="w-5 h-5 text-brand-600" /> Add Evidence</h3>
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            placeholder="Paste File URL (Demo)"
                                            className="w-full p-2 border rounded-lg text-sm"
                                            value={evidenceUrl}
                                            onChange={(e) => setEvidenceUrl(e.target.value)}
                                        />
                                        {/* In real app, this would be a file uploader */}
                                        <button
                                            onClick={handleUploadEvidence}
                                            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 rounded-lg text-sm"
                                        >
                                            Link Evidence
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline / Updates */}
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-brand-600" /> Case Timeline</h3>

                                <div className="flex gap-2 mb-6">
                                    <input
                                        type="text"
                                        className="flex-1 border rounded-lg px-3 py-2 text-sm"
                                        placeholder="Post a generic update..."
                                        value={updateText}
                                        onChange={(e) => setUpdateText(e.target.value)}
                                    />
                                    <button
                                        onClick={handleAddUpdate}
                                        className="bg-brand-600 text-white p-2 rounded-lg hover:bg-brand-700"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                                    {updates.slice().reverse().map((update, idx) => (
                                        <div key={idx} className="flex gap-3">
                                            <div className="flex-col items-center hidden sm:flex">
                                                <div className="w-2 h-2 rounded-full bg-gray-300 mt-2"></div>
                                                <div className="w-0.5 flex-1 bg-gray-100 my-1"></div>
                                            </div>
                                            <div className="flex-1 bg-gray-50 rounded-lg p-3 text-sm">
                                                <div className="flex justify-between mb-1">
                                                    <span className="font-bold text-gray-700">{update.author_role}</span>
                                                    <span className="text-gray-400 text-xs">{new Date(update.timestamp).toLocaleTimeString()}</span>
                                                </div>
                                                <p className="text-gray-800">{update.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Evidence List */}
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-brand-600" /> Attached Evidence</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {selectedComplaint.evidence && selectedComplaint.evidence.length > 0 ? selectedComplaint.evidence.map((ev, i) => (
                                        <div key={i} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500 overflow-hidden relative group">
                                            <img src={ev.file_url} alt="Evidence" className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Evidence' }} />
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center text-white opacity-0 group-hover:opacity-100">
                                                External Link
                                            </div>
                                        </div>
                                    )) : <p className="text-gray-400 text-sm">No evidence attached.</p>}
                                </div>
                            </div>

                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full bg-white rounded-xl shadow-sm text-gray-400">
                            Select a complaint to view details
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default PoliceDashboard;
