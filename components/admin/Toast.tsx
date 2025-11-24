import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

type ToastProps = {
    type: ToastType;
    message: string;
    onClose: () => void;
};

export default function Toast({ type, message, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for fade animation
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const config = {
        success: {
            icon: <CheckCircle className="w-5 h-5" />,
            bg: 'bg-green-50',
            border: 'border-green-200',
            text: 'text-green-800',
            iconColor: 'text-green-500'
        },
        error: {
            icon: <XCircle className="w-5 h-5" />,
            bg: 'bg-red-50',
            border: 'border-red-200',
            text: 'text-red-800',
            iconColor: 'text-red-500'
        },
        info: {
            icon: <AlertCircle className="w-5 h-5" />,
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            text: 'text-blue-800',
            iconColor: 'text-blue-500'
        }
    };

    const styles = config[type];

    return (
        <div
            className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                } ${styles.bg} ${styles.border}`}
        >
            <div className={styles.iconColor}>{styles.icon}</div>
            <p className={`text-sm font-medium ${styles.text}`}>{message}</p>
            <button
                onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 300);
                }}
                className={`${styles.text} hover:opacity-70`}
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
