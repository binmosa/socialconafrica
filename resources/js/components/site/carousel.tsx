import useEmblaCarousel from 'embla-carousel-react';
import { PropsWithChildren, useCallback, useEffect, useState } from 'react';

interface CarouselProps {
    slideBasis?: string;
    gap?: number;
    loop?: boolean;
    autoplayMs?: number;
    align?: 'start' | 'center';
    className?: string;
}

export function Carousel({
    children,
    slideBasis = '25%',
    gap = 24,
    loop = true,
    autoplayMs,
    align = 'start',
    className,
}: PropsWithChildren<CarouselProps>) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop, align, dragFree: false });
    const [selected, setSelected] = useState(0);
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!emblaApi) return;
        const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
        setCount(emblaApi.scrollSnapList().length);
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);
        return () => {
            emblaApi.off('select', onSelect);
            emblaApi.off('reInit', onSelect);
        };
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi || !autoplayMs) return;
        const id = window.setInterval(() => emblaApi.scrollNext(), autoplayMs);
        return () => window.clearInterval(id);
    }, [emblaApi, autoplayMs]);

    const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

    return (
        <div className={className}>
            <div ref={emblaRef} style={{ overflow: 'hidden' }}>
                <div style={{ display: 'flex', gap: `${gap}px` }}>
                    {Array.isArray(children)
                        ? children.map((child, i) => (
                              <div
                                  key={i}
                                  style={{ flex: `0 0 var(--slide-basis, ${slideBasis})`, minWidth: 0 }}
                              >
                                  {child}
                              </div>
                          ))
                        : children}
                </div>
            </div>
            {count > 1 && (
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 24 }}>
                    {Array.from({ length: count }).map((_, i) => (
                        <button
                            type="button"
                            key={i}
                            onClick={() => scrollTo(i)}
                            aria-label={`Go to slide ${i + 1}`}
                            style={{
                                width: 10,
                                height: 10,
                                borderRadius: 5,
                                border: 'none',
                                background: i === selected ? '#FF0A9D' : 'rgba(255,255,255,0.3)',
                                cursor: 'pointer',
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
