import { motion, useReducedMotion } from 'framer-motion';
import { PropsWithChildren } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right' | 'zoom';

interface Props {
    direction?: Direction;
    duration?: number;
    delay?: number;
    className?: string;
    as?: 'div' | 'section' | 'h1' | 'h2' | 'h3' | 'h5' | 'p' | 'span';
}

const offsets: Record<Direction, { x: number; y: number; scale?: number }> = {
    up: { x: 0, y: 40 },
    down: { x: 0, y: -40 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
    zoom: { x: 0, y: 0, scale: 0.9 },
};

export function Reveal({
    children,
    direction = 'up',
    duration = 0.8,
    delay = 0,
    className,
    as = 'div',
}: PropsWithChildren<Props>) {
    const reduced = useReducedMotion();
    const offset = offsets[direction];

    if (reduced) {
        const Tag = as as 'div';
        return <Tag className={className}>{children}</Tag>;
    }

    const MotionTag = motion[as] as typeof motion.div;

    return (
        <MotionTag
            className={className}
            initial={{ opacity: 0, x: offset.x, y: offset.y, scale: offset.scale ?? 1 }}
            whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration, delay, ease: 'easeOut' }}
        >
            {children}
        </MotionTag>
    );
}
