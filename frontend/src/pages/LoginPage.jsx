import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Shield, Lock, User } from 'lucide-react';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('VICTIM'); // VICTIM or OFFICER
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await login(email, password, role);
        if (res.success) {
            navigate(role === 'VICTIM' ? '/victim-dashboard' : '/police-dashboard');
        } else {
            setError(res.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-brand-900 p-6 text-center">
                    <Shield className="w-12 h-12 text-brand-500 mx-auto mb-2" />
                    <h1 className="text-2xl font-bold text-white">Police Complaint Portal</h1>
                    <p className="text-brand-100 text-sm">Secure & Transaparent Justice System</p>
                </div>

                <div className="p-8">
                    <div className="flex justify-center mb-6 bg-gray-100 rounded-lg p-1">
                        <button
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === 'VICTIM' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                            onClick={() => setRole('VICTIM')}
                        >
                            Citizen Login
                        </button>
                        <button
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === 'OFFICER' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                            onClick={() => setRole('OFFICER')}
                        >
                            Officer Login
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <div className="relative">
                                <User className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                                <input
                                    type="email"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <Lock className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                                <input
                                    type="password"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
                        >
                            {role === 'VICTIM' ? 'Login as Citizen' : 'Login as Officer'}
                        </button>

                        {role === 'VICTIM' && (
                            <p className="text-center text-sm text-gray-600 mt-4">
                                Don't have an account? <Link to="/register" className="text-brand-600 font-medium hover:underline">Register here</Link>
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
