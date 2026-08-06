import { PropsWithChildren, useState } from 'react';

interface TabDef {
    key: string;
    day: string;
    date: string;
}

interface Props {
    tabs: TabDef[];
    renderPanel: (tabKey: string) => React.ReactNode;
}

const calendarIcon = (
    <span className="calender">
        <svg xmlns="http://www.w3.org/2000/svg" width="57" height="57" viewBox="0 0 57 57" fill="none">
            <path
                d="M16.4092 0.572266C16.929 0.572266 17.4275 0.778765 17.7951 1.14634C18.1627 1.51391 18.3692 2.01244 18.3692 2.53227V6.19747H39.4168V2.55747C39.4168 2.03764 39.6233 1.53911 39.9908 1.17154C40.3584 0.803965 40.857 0.597466 41.3768 0.597466C41.8966 0.597466 42.3951 0.803965 42.7627 1.17154C43.1303 1.53911 43.3368 2.03764 43.3368 2.55747V6.19747H50.9248C52.4095 6.19747 53.8335 6.78708 54.8836 7.83668C55.9337 8.88628 56.524 10.3099 56.5248 11.7947V50.9751C56.524 52.4598 55.9337 53.8835 54.8836 54.9331C53.8335 55.9827 52.4095 56.5723 50.9248 56.5723H6.12478C4.64005 56.5723 3.21609 55.9827 2.16597 54.9331C1.11585 53.8835 0.525523 52.4598 0.52478 50.9751L0.52478 11.7947C0.525523 10.3099 1.11585 8.88628 2.16597 7.83668C3.21609 6.78708 4.64005 6.19747 6.12478 6.19747H14.4492V2.52947C14.4499 2.01013 14.6567 1.51231 15.0242 1.14535C15.3917 0.77838 15.8898 0.572265 16.4092 0.572266ZM4.44478 22.2499V50.9751C4.44478 51.4165 4.61913 51.8393 4.93684 52.163C5.25455 52.4867 5.68503 52.6551 6.12478 52.6551H50.9248C51.3645 52.6551 51.795 52.4867 52.1127 52.163C52.4304 51.8393 52.6048 51.4165 52.6048 50.9751V22.2891L4.44478 22.2499ZM19.1924 41.5055V46.1703H14.5248V41.5055H19.1924ZM30.8572 41.5055V46.1703H26.1924V41.5055H30.8572ZM42.5248 41.5055V46.1703H37.8572V41.5055H42.5248ZM19.1924 30.3699V35.0347H14.5248V30.3699H19.1924ZM30.8572 30.3699V35.0347H26.1924V30.3699H30.8572ZM42.5248 30.3699V35.0347H37.8572V30.3699H42.5248ZM14.4492 10.1147H6.12478C5.68503 10.1147 5.25455 10.283 4.93684 10.6067C4.61913 10.9304 4.44478 11.3533 4.44478 11.7947V18.3327L52.6048 18.3719V11.7947C52.6048 11.3533 52.4304 10.9304 52.1127 10.6067C51.795 10.283 51.3645 10.1147 50.9248 10.1147H43.3368V12.7159C43.3368 13.2357 43.1303 13.7342 42.7627 14.1018C42.3951 14.4694 41.8966 14.6759 41.3768 14.6759C40.857 14.6759 40.3584 14.4694 39.9908 14.1018C39.6233 13.7342 39.4168 13.2357 39.4168 12.7159V10.1147H18.3692V12.6907C18.3692 13.2105 18.1627 13.709 17.7951 14.0766C17.4275 14.4442 16.929 14.6507 16.4092 14.6507C15.8894 14.6507 15.3908 14.4442 15.0233 14.0766C14.6557 13.709 14.4492 13.2105 14.4492 12.6907V10.1147Z"
                fill="#FF0A9D"
            />
        </svg>
    </span>
);

export function EventTabs({ tabs, renderPanel }: PropsWithChildren<Props>) {
    const [active, setActive] = useState(tabs[0]?.key);

    return (
        <div className="row">
            <div className="col-lg-4">
                <div className="service-tabs-area">
                    <ul className="nav nav-pills mb-3" role="tablist">
                        {tabs.map((tab) => (
                            <li key={tab.key} className="nav-item" role="presentation">
                                <button
                                    type="button"
                                    className={`nav-link ${active === tab.key ? 'active' : ''}`}
                                    onClick={() => setActive(tab.key)}
                                    role="tab"
                                    aria-selected={active === tab.key}
                                >
                                    {calendarIcon}
                                    <span className="pl-8">
                                        <span className="day">{tab.day}</span>
                                        <span className="date">{tab.date}</span>
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="col-lg-8">
                <div className="tab-content">
                    <div className="tab-pane fade show active" role="tabpanel">
                        {active && renderPanel(active)}
                    </div>
                </div>
            </div>
        </div>
    );
}
