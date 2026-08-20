import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export type FaqItem = { question: string; answer: string };

/**
 * Template accordion: gradient frame, white question row with a round
 * gradient toggle; the open item reveals the gradient behind white text.
 */
export function FaqAccordion({
    items,
    defaultOpen = 0,
}: {
    items: FaqItem[];
    defaultOpen?: number | null;
}) {
    const [open, setOpen] = useState<number | null>(defaultOpen);

    return (
        <div className="space-y-4">
            {items.map((item, index) => {
                const isOpen = open === index;
                const panelId = `faq-panel-${index}`;

                return (
                    <div
                        key={item.question}
                        className="rounded-xl bg-brand p-[2px]"
                    >
                        <div
                            className={cn(
                                'rounded-[calc(0.75rem-2px)] transition-colors',
                                isOpen
                                    ? 'bg-transparent text-white'
                                    : 'bg-white text-ink',
                            )}
                        >
                            <button
                                type="button"
                                aria-expanded={isOpen}
                                aria-controls={panelId}
                                onClick={() => setOpen(isOpen ? null : index)}
                                className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left font-semibold md:px-7 md:py-5 md:text-lg"
                            >
                                <span>{item.question}</span>
                                <span
                                    className={cn(
                                        'flex size-10 shrink-0 items-center justify-center rounded-full transition-transform',
                                        isOpen
                                            ? 'rotate-180 bg-white text-pink'
                                            : 'bg-brand text-white',
                                    )}
                                >
                                    <ChevronDown
                                        className="size-5"
                                        aria-hidden
                                    />
                                </span>
                            </button>
                            <div
                                id={panelId}
                                hidden={!isOpen}
                                className="px-5 pb-5 text-[15px] leading-7 text-white/85 md:px-7 md:pb-6"
                            >
                                {item.answer}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
