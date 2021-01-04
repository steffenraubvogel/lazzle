import { ReactElement, ReactNode, useState } from "react"
import styles from "./Tabs.module.scss";

type TabProps = {
    header: string
    children: ReactNode
}

export const Tab: React.FC<TabProps> = () => {
    return <></>
}

export default function Tabs(props: { children: ReactElement<TabProps>[] }) {

    const [activeTab, setActiveTab] = useState<number>(0)

    return <div>
        <ul className="nav nav-tabs">
            {props.children.map((child, index) =>
                <li key={index} className="nav-item">
                    <button className={"btn btn-link nav-link" + (activeTab === index ? ' active' : '')} onClick={() => setActiveTab(index)}>
                        {child.props.header}
                    </button>
                </li>
            )}
        </ul>
        <div className={styles.tabContentWrapper}>
            <div
                className={styles.tabContent}
                style={{ width: props.children.length + '00%' }}
            >
                {props.children.map((child, index) =>
                    <div key={index}
                        className={styles.tabPane + (activeTab === index ? ' ' + styles.tabPaneActive : '')}
                        style={{ transform: 'translateX(-' + (index * 100) + '%)' }}
                    >
                        {child.props.children}
                    </div>
                )}
            </div>
        </div>
    </div>
}
