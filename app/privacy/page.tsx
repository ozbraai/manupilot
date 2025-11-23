import LegalPageLayout from '@/components/legal/LegalPageLayout';

export default function PrivacyPage() {
    return (
        <LegalPageLayout title="Privacy Policy" lastUpdated="November 23, 2025">
            <p>
                At ManuPilot, we take your privacy seriously. This Privacy Policy explains how we collect,
                use, disclose, and safeguard your information when you visit our website or use our
                services.
            </p>

            <h3>1. Information We Collect</h3>
            <p>
                We collect information that you provide directly to us, such as when you create an account,
                subscribe to our newsletter, or contact us for support. This may include your name, email
                address, and company details.
            </p>

            <h3>2. How We Use Your Information</h3>
            <p>
                We use the information we collect to provide, maintain, and improve our services, to
                communicate with you, and to monitor and analyze trends and usage.
            </p>

            <h3>3. Data Security</h3>
            <p>
                We implement appropriate technical and organizational measures to protect the security of
                your personal information. However, please be aware that no method of transmission over the
                internet is 100% secure.
            </p>

            <h3>4. Contact Us</h3>
            <p>
                If you have any questions about this Privacy Policy, please contact us at{' '}
                <a href="mailto:privacy@manupilot.com" className="text-sky-600 hover:underline">
                    privacy@manupilot.com
                </a>
                .
            </p>
        </LegalPageLayout>
    );
}
