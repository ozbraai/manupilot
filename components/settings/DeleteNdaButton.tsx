'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteNdaButton() {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to reset your NDA status? This is for testing purposes only.')) {
            return;
        }

        setIsDeleting(true);
        try {
            const res = await fetch('/api/nda/status', {
                method: 'DELETE',
            });

            if (res.ok) {
                const data = await res.json();
                alert(`Reset successful. Deleted ${data.count} records. Reloading...`);
                // Force hard reload to ensure server state is reflected
                window.location.reload();
            } else {
                const data = await res.json();
                console.error('Reset failed:', data);
                alert('Failed to reset NDA status: ' + (data.error || 'Unknown error'));
            }
        } catch (e) {
            console.error(e);
            alert('An error occurred');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-xs text-red-600 hover:text-red-700 hover:underline disabled:opacity-50"
        >
            {isDeleting ? 'Resetting...' : 'Reset NDA (Testing)'}
        </button>
    );
}
