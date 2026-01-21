import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Shield, User, Mail, Phone, MapPin, Lock } from 'lucide-react';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        full_name: '', email: '', password: '', phone_number: '', address: ''
    });
    const { registerVictim } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await registerVictim(formData);
        if (res.success) {
            navigate('/victim-dashboard');
        } else {
            setError(res.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900 px-4 py-8">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-brand-900 p-6 text-center">
                    <Shield className="w-12 h-12 text-brand-500 mx-auto mb-2" />
                    <h1 className="text-2xl font-bold text-white">Citizen Registration</h1>
                    <p className="text-brand-100 text-sm">Create your secure account</p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}

                        {[
                            { name: 'full_name', placeholder: 'Full Name', icon: User, type: 'text' },
                            { name: 'email', placeholder: 'Email Address', icon: Mail, type: 'email' },
                            { name: 'password', placeholder: 'Password', icon: Lock, type: 'password' },
                            { name: 'phone_number', placeholder: 'Phone Number', icon: Phone, type: 'text' },
                            { name: 'address', placeholder: 'Full Address', icon: MapPin, type: 'text' },
                        ].map((field) => (
                            <div key={field.name}>
                                <div className="relative">
                                    <field.icon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                                    <input
                                        type={field.type}
                                        name={field.name}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                                        placeholder={field.placeholder}
                                        value={formData[field.name]}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        ))}

                        <button
                            type="submit"
                            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
                        >
                            Register
                        </button>

                        <p className="text-center text-sm text-gray-600 mt-4">
                            Already have an account? <Link to="/" className="text-brand-600 font-medium hover:underline">Login here</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
