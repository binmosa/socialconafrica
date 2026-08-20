import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';

/**
 * Creator avatar wrapped in the spotlight "story ring" — every nominee
 * reads like an unopened story; voting is tapping the story.
 */
export function NomineeAvatar({
    name,
    imagePath,
    className,
    ring = true,
}: {
    name: string;
    imagePath: string | null;
    className?: string;
    ring?: boolean;
}) {
    const getInitials = useInitials();

    const face = imagePath ? (
        <img
            src={imagePath}
            alt={name}
            className={cn('rounded-full object-cover', ring && 'ring-2 ring-card', className)}
        />
    ) : (
        <div
            aria-hidden
            className={cn(
                'flex items-center justify-center rounded-full bg-veil font-display font-bold text-violet',
                ring && 'ring-2 ring-card',
                className,
            )}
        >
            {getInitials(name)}
        </div>
    );

    if (!ring) {
        return face;
    }

    return <span className="bg-spotlight inline-flex rounded-full p-[2.5px]">{face}</span>;
}
