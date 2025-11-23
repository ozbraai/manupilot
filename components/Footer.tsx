import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-zinc-950 border-t border-zinc-800 text-zinc-400 py-16 md:py-20">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-16">

                    {/* Brand Column */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="inline-block mb-6 group">
                            <span className="text-xl font-bold text-white tracking-tight group-hover:text-zinc-200 transition-colors">ManuPilot</span>
                        </Link>
                        <p className="text-sm leading-relaxed mb-6 text-zinc-500 max-w-xs">
                            Your AI manufacturing co-pilot. Turn product ideas into factory-ready reality with confidence.
                        </p>
                        <div className="flex gap-4">
                            {/* Social Placeholders */}
                            <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 hover:border-zinc-700 transition-all cursor-pointer">
                                <span className="text-xs font-bold">𝕏</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 hover:border-zinc-700 transition-all cursor-pointer">
                                <span className="text-xs font-bold">in</span>
                            </div>
                        </div>
                    </div>

                    {/* Product Column */}
                    <div>
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-6">Product</h3>
                        <ul className="space-y-4 text-sm">
                            <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                            <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                            <li><Link href="/enterprise" className="hover:text-white transition-colors">Enterprise</Link></li>
                            <li><Link href="/changelog" className="hover:text-white transition-colors">Changelog</Link></li>
                        </ul>
                    </div>

                    {/* Company Column */}
                    <div>
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-6">Company</h3>
                        <ul className="space-y-4 text-sm">
                            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                            <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                            <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                            <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Legal Column */}
                    <div>
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-6">Legal</h3>
                        <ul className="space-y-4 text-sm">
                            <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                            <li><Link href="/security" className="hover:text-white transition-colors">Security</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-600">
                    <p>&copy; {new Date().getFullYear()} ManuPilot Inc. All rights reserved.</p>
                    <div className="flex gap-6">
                        <span className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            All systems operational
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
