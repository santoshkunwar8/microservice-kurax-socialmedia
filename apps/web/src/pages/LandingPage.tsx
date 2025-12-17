import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Users, Shield, Zap, Lock, Globe, ChevronRight, Menu, X } from 'lucide-react';

export default function KuraXLanding() {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeTab, setActiveTab] = useState('public');

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        {
            icon: <MessageCircle className="w-6 h-6" />,
            title: "Real-time Chat",
            description: "Connect instantly with friends and communities in lightning-fast chat rooms."
        },
        {
            icon: <Users className="w-6 h-6" />,
            title: "Community Rooms",
            description: "Create public or private spaces for your communities to gather and share."
        },
        {
            icon: <Shield className="w-6 h-6" />,
            title: "Privacy First",
            description: "Your conversations are protected with end-to-end encryption and privacy controls."
        },
        {
            icon: <Zap className="w-6 h-6" />,
            title: "Lightning Fast",
            description: "Experience seamless real-time messaging with no lag, no delays."
        }
    ];

    const rooms = [
        { title: "Tech Enthusiasts", members: 1247, type: "public", gradient: "from-purple-500 to-pink-500" },
        { title: "Gaming Hub", members: 856, type: "public", gradient: "from-cyan-500 to-blue-500" },
        { title: "Design Studio", members: 543, type: "private", gradient: "from-orange-500 to-red-500" },
        { title: "Startup Founders", members: 329, type: "private", gradient: "from-green-500 to-emerald-500" }
    ];

    return (
        <div className="min-h-screen bg-black text-white overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Navigation */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/10' : ''}`}>
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <img src="/transparent-logo.png" alt="kuraX" className="h-16 w-auto" />
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#features" className="text-gray-300 hover:text-white transition">Features</a>
                            <a href="#rooms" className="text-gray-300 hover:text-white transition">Rooms</a>
                            <a href="#about" className="text-gray-300 hover:text-white transition">About</a>
                            <a href="#pricing" className="text-gray-300 hover:text-white transition">Pricing</a>
                        </div>

                        <div className="hidden md:flex items-center space-x-4">
                            <button onClick={() => navigate('/login')} className="px-5 py-2 text-gray-300 hover:text-white transition">Login</button>
                            <button onClick={() => navigate('/login')} className="px-5 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-xl border border-white/20 transition">
                                Sign up
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10">
                        <div className="px-6 py-4 space-y-4">
                            <a href="#features" className="block text-gray-300 hover:text-white transition">Features</a>
                            <a href="#rooms" className="block text-gray-300 hover:text-white transition">Rooms</a>
                            <a href="#about" className="block text-gray-300 hover:text-white transition">About</a>
                            <a href="#pricing" className="block text-gray-300 hover:text-white transition">Pricing</a>
                            <button onClick={() => navigate('/login')} className="w-full px-5 py-2 text-left text-gray-300 hover:text-white transition">Login</button>
                            <button onClick={() => navigate('/login')} className="w-full px-5 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-xl border border-white/20 transition text-left">
                                Sign up
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="inline-block mb-6">
                            <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-sm text-purple-300 backdrop-blur-xl">
                                Connect AI agents to apps and APIs → Get started
                            </div>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
                            Built for what<br />
                            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                                you're building
                            </span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
                            Experience the future of social connection. Create rooms, share moments, and build communities in real-time.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 rounded-xl font-semibold transition-all transform hover:scale-105 flex items-center gap-2">
                                Get Started <ChevronRight className="w-5 h-5" />
                            </button>
                            <button className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-xl border border-white/20 font-semibold transition-all">
                                View Demo
                            </button>
                        </div>
                    </div>

                    {/* Feature Tabs */}
                    <div className="mt-20">
                        <div className="flex gap-4 mb-8 border-b border-white/10">
                            <button
                                onClick={() => setActiveTab('public')}
                                className={`px-6 py-3 transition-all ${activeTab === 'public' ? 'text-white border-b-2 border-purple-500' : 'text-gray-500'}`}
                            >
                                PUBLIC ROOMS
                            </button>
                            <button
                                onClick={() => setActiveTab('private')}
                                className={`px-6 py-3 transition-all ${activeTab === 'private' ? 'text-white border-b-2 border-purple-500' : 'text-gray-500'}`}
                            >
                                PRIVATE SPACES
                            </button>
                            <button
                                onClick={() => setActiveTab('community')}
                                className={`px-6 py-3 transition-all ${activeTab === 'community' ? 'text-white border-b-2 border-purple-500' : 'text-gray-500'}`}
                            >
                                COMMUNITIES
                            </button>
                        </div>

                        {/* Interactive Demo Area */}
                        <div className="bg-gradient-to-br from-purple-900/20 to-cyan-900/20 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12">
                            <div className="grid md:grid-cols-2 gap-8 items-center">
                                <div>
                                    <h2 className="text-4xl font-bold mb-4">Connect Instantly</h2>
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-sm font-mono text-purple-400 mb-2">CREATE YOUR SPACE</h3>
                                            <p className="text-gray-300">Build communities around your passions. Public rooms for open discussions or private spaces for close-knit groups.</p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-mono text-cyan-400 mb-2">REAL-TIME ENGAGEMENT</h3>
                                            <p className="text-gray-300">Share media, react to messages, and connect with your community in real-time with zero latency.</p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-mono text-pink-400 mb-2">SECURE & PRIVATE</h3>
                                            <p className="text-gray-300">End-to-end encryption ensures your conversations stay private and secure.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Chat Mockup */}
                                <div className="relative">
                                    <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
                                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"></div>
                                            <div>
                                                <div className="font-semibold">Design Studio</div>
                                                <div className="text-sm text-gray-400">124 members online</div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex gap-3">
                                                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex-shrink-0"></div>
                                                <div className="bg-white/5 rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs">
                                                    <div className="text-sm text-gray-300">Hey team! Check out this new design concept</div>
                                                </div>
                                            </div>

                                            <div className="flex gap-3 justify-end">
                                                <div className="bg-gradient-to-br from-purple-600/30 to-cyan-600/30 border border-purple-500/30 rounded-2xl rounded-tr-sm px-4 py-3 max-w-xs">
                                                    <div className="text-sm">Love it! The gradient is perfect 🎨</div>
                                                </div>
                                                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex-shrink-0"></div>
                                            </div>

                                            <div className="flex gap-3">
                                                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex-shrink-0"></div>
                                                <div className="bg-white/5 rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs">
                                                    <div className="text-sm text-gray-300">When can we start implementing?</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2">
                                            <input
                                                type="text"
                                                placeholder="Type a message..."
                                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-purple-500/50 transition"
                                            />
                                            <button className="w-10 h-10 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-xl flex items-center justify-center hover:scale-105 transition">
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
                        You're in <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">great company</span>
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Large Featured Card */}
                        <div className="lg:col-span-2 bg-gradient-to-br from-purple-600/40 via-blue-600/40 to-cyan-600/40 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-12 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-cyan-500/20"></div>
                            <div className="relative z-10">
                                <div className="text-3xl font-bold mb-6">🎨 Signify</div>
                                <p className="text-2xl md:text-3xl font-semibold mb-8 leading-relaxed">
                                    kuraX lets creative teams focus on design, not infrastructure
                                </p>
                            </div>
                        </div>

                        {/* Testimonial Card 1 */}
                        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-white/30 transition-all">
                            <div className="mb-6">
                                <div className="w-12 h-12 bg-white rounded-lg mb-4 flex items-center justify-center">
                                    <span className="text-black font-bold">B</span>
                                </div>
                                <div className="text-xl font-bold">Browse AI</div>
                            </div>
                            <p className="text-gray-300 mb-8 leading-relaxed">
                                "We used kuraX from day one to be able to spend our limited time on innovating and creating new user experiences rather than building another chat system."
                            </p>
                            <div>
                                <div className="font-semibold">Ardy Naghshineh</div>
                                <div className="text-sm text-gray-400">Founder and CEO</div>
                            </div>
                        </div>

                        {/* Testimonial Card 2 */}
                        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-white/30 transition-all">
                            <div className="mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg mb-4 flex items-center justify-center">
                                    <span className="text-white font-bold">S</span>
                                </div>
                                <div className="text-xl font-bold">SafeBase</div>
                            </div>
                            <p className="text-gray-300 mb-8 leading-relaxed">
                                "As we're growing with these customers, something that's very clear is that big customers really care about identity management and security."
                            </p>
                            <div>
                                <div className="font-semibold">Adar Arnon</div>
                                <div className="text-sm text-gray-400">CTO & Co-Founder</div>
                            </div>
                        </div>

                        {/* Large Featured Card 2 */}
                        <div className="lg:col-span-2 bg-gradient-to-br from-blue-600/40 via-purple-600/40 to-pink-600/40 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-12 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-pink-500/20"></div>
                            <div className="relative z-10">
                                <div className="text-3xl font-bold mb-6">⚡ Snyk</div>
                                <p className="text-2xl md:text-3xl font-semibold mb-8 leading-relaxed">
                                    Why teams trust kuraX to deliver security from the ground up
                                </p>
                            </div>
                        </div>

                        {/* Testimonial Card 3 */}
                        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-white/30 transition-all">
                            <div className="mb-6">
                                <div className="w-12 h-12 bg-white rounded-lg mb-4 flex items-center justify-center">
                                    <span className="text-black font-bold">R</span>
                                </div>
                                <div className="text-xl font-bold">Recidiviz</div>
                            </div>
                            <p className="text-gray-300 mb-8 leading-relaxed">
                                "We were able to get a working setup going within a couple of hours – and it has successfully flexed with us through countless iterations."
                            </p>
                            <div>
                                <div className="font-semibold">Joshua Essex</div>
                                <div className="text-sm text-gray-400">Co-Founder and CTO</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Resources Section */}
            <section id="resources" className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center gap-4 mb-12">
                        <button className="px-6 py-2 bg-white text-black rounded-full font-semibold">
                            Community
                        </button>
                        <button className="px-6 py-2 text-gray-400 hover:text-white transition">
                            Real-time Chat
                        </button>
                        <button className="px-6 py-2 text-gray-400 hover:text-white transition">
                            Product Innovation
                        </button>
                        <button className="px-6 py-2 text-gray-400 hover:text-white transition">
                            &lt;/secure smarter&gt;
                        </button>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Resource Card 1 */}
                        <div className="group bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 transition-all cursor-pointer">
                            <div className="relative h-48 bg-gradient-to-br from-purple-600/30 to-pink-600/30 overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-full h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl transform -rotate-6 scale-90"></div>
                                </div>
                                <div className="absolute top-4 left-4">
                                    <div className="px-3 py-1 bg-black/50 backdrop-blur-xl rounded-full text-xs font-mono">
                                        📄 WHITEPAPER
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-lg font-semibold mb-2">Community Trends Report 2025</h3>
                                <p className="text-sm text-gray-400">Securing user trust in the age of real-time communication...</p>
                            </div>
                        </div>

                        {/* Resource Card 2 */}
                        <div className="group bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 transition-all cursor-pointer">
                            <div className="relative h-48 bg-gradient-to-br from-blue-600/30 to-purple-600/30 overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-full h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl transform rotate-6 scale-90"></div>
                                </div>
                                <div className="absolute top-4 left-4">
                                    <div className="px-3 py-1 bg-black/50 backdrop-blur-xl rounded-full text-xs font-mono">
                                        📄 WHITEPAPER
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-lg font-semibold mb-2">Introducing kuraX for Teams</h3>
                                <p className="text-sm text-gray-400">The future of collaborative communication...</p>
                            </div>
                        </div>

                        {/* Resource Card 3 */}
                        <div className="group bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 transition-all cursor-pointer">
                            <div className="relative h-48 bg-gradient-to-br from-cyan-600/30 to-blue-600/30 p-6">
                                <div className="absolute top-4 left-4">
                                    <div className="px-3 py-1 bg-black/50 backdrop-blur-xl rounded-full text-xs font-mono">
                                        📄 WHITEPAPER
                                    </div>
                                </div>
                                <div className="relative z-10 h-full flex flex-col justify-end">
                                    <h3 className="text-xl font-semibold">Securing your communities: A technical demo</h3>
                                </div>
                            </div>
                            <div className="p-6 border-t border-white/10">
                                <p className="text-sm text-gray-400 mb-4">
                                    In this session, we dive deeper with a technical demo showcasing how kuraX helps you design secure applications...
                                </p>
                                <a href="#" className="text-sm text-cyan-400 hover:text-cyan-300 transition inline-flex items-center gap-2">
                                    Learn more <ChevronRight className="w-4 h-4" />
                                </a>
                            </div>
                        </div>

                        {/* Resource Card 4 */}
                        <div className="group bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 transition-all cursor-pointer">
                            <div className="relative h-48 bg-gradient-to-br from-purple-600/30 to-pink-600/30 overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-full h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl transform -rotate-6 scale-90"></div>
                                </div>
                                <div className="absolute top-4 left-4">
                                    <div className="px-3 py-1 bg-black/50 backdrop-blur-xl rounded-full text-xs font-mono">
                                        🎙️ PODCAST
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-lg font-semibold mb-2">Unlock the future of community & connection</h3>
                                <p className="text-sm text-gray-400">How modern teams are building engagement...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 px-6">
                <div className="max-w-5xl mx-auto text-center">
                    <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
                        Ready to start connecting, sharing,<br />
                        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                            and building communities?
                        </span>
                    </h2>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
                        <button className="px-10 py-5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 rounded-xl font-semibold text-lg transition-all transform hover:scale-105">
                            Get Started Free
                        </button>
                        <button className="px-10 py-5 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-xl border border-white/20 font-semibold text-lg transition-all">
                            Schedule Demo
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10 py-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <img src="/transparent-logo.png" alt="kuraX" className="h-8 w-auto" />
                            </div>
                            <p className="text-gray-400 text-sm">Building the future of social connection.</p>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Product</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-white transition">Features</a></li>
                                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                                <li><a href="#" className="hover:text-white transition">Security</a></li>
                                <li><a href="#" className="hover:text-white transition">Updates</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Resources</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-white transition">Documentation</a></li>
                                <li><a href="#" className="hover:text-white transition">API</a></li>
                                <li><a href="#" className="hover:text-white transition">Support</a></li>
                                <li><a href="#" className="hover:text-white transition">Community</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-white transition">About</a></li>
                                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
                        <p>© 2024 kuraX. All rights reserved.</p>
                        <div className="flex gap-6 mt-4 md:mt-0">
                            <a href="#" className="hover:text-white transition">Privacy</a>
                            <a href="#" className="hover:text-white transition">Terms</a>
                            <a href="#" className="hover:text-white transition">Cookies</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}