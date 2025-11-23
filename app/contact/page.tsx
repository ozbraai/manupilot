import React from 'react';

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-slate-50 text-slate-900 pb-20">
            {/* HERO */}
            <section className="bg-white border-b border-slate-200 py-16 md:py-20">
                <div className="max-w-3xl mx-auto px-6 md:px-8 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">
                        Contact Us
                    </h1>
                    <p className="text-lg text-slate-600">
                        We&apos;d love to hear from you. Whether you have a question about features, pricing, or
                        need a demo, our team is ready to answer all your questions.
                    </p>
                </div>
            </section>

            {/* CONTENT */}
            <section className="max-w-5xl mx-auto px-6 md:px-8 py-12">
                <div className="grid md:grid-cols-2 gap-12">

                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Chat with us</h3>
                            <p className="text-slate-600 mb-2">Speak to our friendly team via live chat.</p>
                            <a href="#" className="text-sky-600 font-medium hover:underline">Start a live chat &rarr;</a>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Email us</h3>
                            <p className="text-slate-600 mb-2">Shoot us an email and we&apos;ll get back to you.</p>
                            <a href="mailto:hello@manupilot.com" className="text-sky-600 font-medium hover:underline">hello@manupilot.com</a>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Visit us</h3>
                            <p className="text-slate-600 mb-2">Come say hello at our office HQ.</p>
                            <p className="text-slate-600">
                                100 Startup Way<br />
                                Innovation District, NSW 2000<br />
                                Australia
                            </p>
                        </div>
                    </div>

                    {/* Contact Form Placeholder */}
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <form className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                <input type="text" id="name" className="w-full rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500" placeholder="Your name" />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input type="email" id="email" className="w-full rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500" placeholder="you@company.com" />
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                                <textarea id="message" rows={4} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500" placeholder="How can we help?"></textarea>
                            </div>
                            <button type="button" className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-colors">
                                Send Message
                            </button>
                        </form>
                    </div>

                </div>
            </section>
        </main>
    );
}
