import { PropsWithChildren } from 'react';

interface Props {
    title: string;
    subtitle?: string;
}

export function InnerPageHeader({ title, subtitle, children }: PropsWithChildren<Props>) {
    return (
        <div className="inner-page-header">
            <div className="container">
                <div className="row">
                    <div className="col-lg-10 m-auto">
                        <h1>{title}</h1>
                        {subtitle && <p>{subtitle}</p>}
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
