import { PropsWithChildren, ReactElement, useEffect, useState } from "react"

type AccordionItemProps = PropsWithChildren<{
    header: string
}>

export const AccordionItem: React.FC<AccordionItemProps> = () => {
    return <></>
}

export default function Accordion(props: { initialOpened?: number, children: ReactElement<AccordionItemProps>[] }) {

    const [openedItem, setOpenedItem] = useState<number | undefined>()

    useEffect(() => {
        setOpenedItem(props.initialOpened)
    }, [props.initialOpened])

    function handleItemClick(itemIndex: number) {
        setOpenedItem(prev => prev === itemIndex ? undefined : itemIndex)
    }

    return <div className="accordion mb-3" id="laserAccordion">
        {props.children.map((child, index) =>
            <div key={index} className="accordion-item">
                <h2 className="accordion-header">
                    <button className={"accordion-button" + (openedItem !== index ? ' collapsed' : '')} type="button" onClick={() => handleItemClick(index)}>
                        {child.props.header}
                    </button>
                </h2>

                <div className={"accordion-collapse collapse" + (openedItem === index ? ' show' : '')}>
                    <div className="accordion-body">
                        {child.props.children}
                    </div>
                </div>
            </div>
        )}
    </div>
}