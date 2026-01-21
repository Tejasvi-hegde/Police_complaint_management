import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import api from '../api/axios';
import { PlusCircle, List, LogOut, Clock, MapPin, Search } from 'lucide-react';

const VictimDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [view, setView] = useState('list'); // 'list', 'lodge', 'details'
    const [complaints, setComplaints] = useState([]);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [updates, setUpdates] = useState([]);

    // Lodge Form
    const [formData, setFormData] = useState({
        title: '', description: '', incident_location: '', category: 'General', station_id: 1 // Default
    });

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const res = await api.get('/complaints/my');
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
            setView('details');
        } catch (error) {
            console.error(error);
        }
    };

    const handleLodge = async (e) => {
        e.preventDefault();
        try {
            await api.post('/complaints', formData);
            alert('Complaint Lodged Successfully');
            setFormData({ title: '', description: '', incident_location: '', category: 'General', station_id: 1 });
            fetchComplaints();
            setView('list');
        } catch (error) {
            alert('Failed to lodge complaint');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-brand-900 flex items-center gap-2">
                        <span className="text-brand-500">CMS</span> Citizen Portal
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600 hidden sm:block">Welcome, {user?.full_name}</span>
                        <button onClick={logout} className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1">
                            <LogOut className="w-4 h-4" /> Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {view === 'list' && (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-800">My Complaints</h2>
                            <button
                                onClick={() => setView('lodge')}
                                className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <PlusCircle className="w-5 h-5" /> Lodge New Complaint
                            </button>
                        </div>

                        {complaints.length === 0 ? (
                            <div className="text-center py-20 text-gray-500">
                                <List className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p>No complaints found. Lodge one to get started.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {complaints.map(complaint => (
                                    <div key={complaint.complaint_id} className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 cursor-pointer" onClick={() => fetchDetails(complaint.complaint_id)}>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${complaint.current_status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                                {complaint.current_status}
                                            </span>
                                            <span className="text-xs text-gray-400">{new Date(complaint.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-900 mb-1">{complaint.title}</h3>
                                        <p className="text-sm text-gray-600 line-clamp-2">{complaint.description}</p>
                                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                                            <MapPin className="w-3.5 h-3.5" /> {complaint.incident_location || 'No Location'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {view === 'lodge' && (
                    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900">Lodge a Complaint</h2>
                        <form onSubmit={handleLodge} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Complaint Title</label>
                                <input type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" required
                                    value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select className="w-full p-2 border rounded-lg outline-none bg-white"
                                    value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                    <option>General</option>
                                    <option>Theft</option>
                                    <option>Assault</option>
                                    <option>Cybercrime</option>
                                    <option>Traffic</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Incident Location</label>
                                <input type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" required
                                    value={formData.incident_location} onChange={e => setFormData({ ...formData, incident_location: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Station ID (Dummy)</label>
                                <input type="number" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                    value={formData.station_id} onChange={e => setFormData({ ...formData, station_id: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none h-32" required
                                    value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setView('list')} className="flex-1 py-2 text-gray-600 border rounded-lg hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="flex-1 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700">Submit Complaint</button>
                            </div>
                        </form>
                    </div>
                )}

                {view === 'details' && selectedComplaint && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <button onClick={() => setView('list')} className="text-sm text-brand-600 hover:underline mb-4">&larr; Back to List</button>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedComplaint.title}</h1>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-700">ID: #{selectedComplaint.complaint_id}</span>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded ${selectedComplaint.current_status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                        {selectedComplaint.current_status}
                                    </span>
                                </div>
                                <p className="text-gray-700 whitespace-pre-wrap">{selectedComplaint.description}</p>
                                <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-600">
                                    <div>
                                        <span className="block font-medium text-gray-900">Location</span>
                                        {selectedComplaint.incident_location}
                                    </div>
                                    <div>
                                        <span className="block font-medium text-gray-900">Station</span>
                                        Station ID: {selectedComplaint.station_id}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-gray-500" /> Case Timeline
                                </h3>
                                <div className="space-y-4">
                                    {updates.length === 0 ? <p className="text-gray-500 italic">No updates available yet.</p> :
                                        updates.map((update, idx) => (
                                            <div key={idx} className={`p-3 rounded-lg ${update.author_role === 'POLICE' ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-gray-50 border-l-4 border-gray-400'}`}>
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-xs font-bold text-gray-700">{update.author_role}</span>
                                                    <span className="text-xs text-gray-400">{new Date(update.timestamp).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-sm text-gray-800">{update.text}</p>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
                            <h3 className="font-bold text-gray-900 mb-4">Assigned Officer</h3>
                            {selectedComplaint.assigned_officer ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold">
                                        {selectedComplaint.assigned_officer.full_name[0]}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{selectedComplaint.assigned_officer.full_name}</p>
                                        <p className="text-xs text-gray-500">Badge: {selectedComplaint.assigned_officer.badge_number}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No officer assigned yet.</p>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default VictimDashboard;
