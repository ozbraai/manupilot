import LegalPageLayout from '@/components/legal/LegalPageLayout';

export default function SecurityPage() {
    return (
        <LegalPageLayout title="Security" lastUpdated="November 23, 2025">
            <p>
                Security is a top priority at ManuPilot. We are committed to protecting your data and
                ensuring that our platform is secure and reliable.
            </p>

            <h3>Data Encryption</h3>
            <p>
                All data transmitted between your browser and our servers is encrypted using TLS 1.2 or
                higher. Data at rest is encrypted using industry-standard AES-256 encryption.
            </p>

            <h3>Infrastructure Security</h3>
            <p>
                Our infrastructure is hosted on world-class cloud providers with robust physical and
                network security controls. We regularly update and patch our systems to protect against
                vulnerabilities.
            </p>

            <h3>Access Control</h3>
            <p>
                We employ strict access controls to limit access to your data to only those employees who
                need it to perform their job duties. We use multi-factor authentication and audit logs to
                monitor access.
            </p>

            <h3>Reporting Issues</h3>
            <p>
                If you believe you have found a security vulnerability in our platform, please report it to
                us immediately at{' '}
                <a href="mailto:security@manupilot.com" className="text-sky-600 hover:underline">
                    security@manupilot.com
                </a>
                .
            </p>
        </LegalPageLayout>
    );
}
