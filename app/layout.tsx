import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/components/AuthProvider';
import { WizardProvider } from '@/components/wizard/WizardContext';
import WizardModal from '@/components/wizard/WizardModal';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ManuPilot – Manufacturing Co-Pilot',
  description:
    'ManuPilot is your AI manufacturing co-pilot for turning product ideas into factory-ready reality.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-50 text-slate-900 flex flex-col min-h-screen`}>
        <AuthProvider>
          <WizardProvider>
            <Navbar />
            <div className="flex-1">
              {children}
            </div>
            <Footer />
            <WizardModal />
          </WizardProvider>
        </AuthProvider>
      </body>
    </html>
  );
}