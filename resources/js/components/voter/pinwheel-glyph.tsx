import { cn } from '@/lib/utils';

/**
 * Four-petal "pinwheel" mark — the recurring eyebrow/logo glyph.
 */
export function PinwheelGlyph({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 44 44"
            className={cn('size-5', className)}
            aria-hidden
            fill="currentColor"
        >
            <path d="M5.96 5.96a16.04 16.04 0 0 0 16.04 16.04V5.96H5.96ZM22 22h16.04V5.96A16.04 16.04 0 0 0 22 22Zm0 0v16.04h16.04A16.04 16.04 0 0 0 22 22Zm0 0H5.96v16.04A16.04 16.04 0 0 0 22 22Z" />
        </svg>
    );
}
