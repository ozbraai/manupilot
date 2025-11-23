import LegalPageLayout from '@/components/legal/LegalPageLayout';

export default function TermsPage() {
    return (
        <LegalPageLayout title="Terms of Service" lastUpdated="November 23, 2025">
            <p>
                Welcome to ManuPilot. By accessing or using our website and services, you agree to be bound
                by these Terms of Service.
            </p>

            <h3>1. Acceptance of Terms</h3>
            <p>
                By accessing or using our services, you agree to be bound by these Terms. If you disagree
                with any part of the terms, then you may not access the service.
            </p>

            <h3>2. Use of Service</h3>
            <p>
                You are responsible for your use of the service and for any content you provide, including
                compliance with applicable laws, rules, and regulations.
            </p>

            <h3>3. Intellectual Property</h3>
            <p>
                The service and its original content, features, and functionality are and will remain the
                exclusive property of ManuPilot and its licensors.
            </p>

            <h3>4. Termination</h3>
            <p>
                We may terminate or suspend access to our service immediately, without prior notice or
                liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>

            <h3>5. Changes</h3>
            <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time.
                What constitutes a material change will be determined at our sole discretion.
            </p>
        </LegalPageLayout>
    );
}
