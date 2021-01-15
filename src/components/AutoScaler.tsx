import { CSSProperties, PropsWithChildren, useEffect, useRef, useState } from "react";

/**
 * Provides the feature to scale the children to full width of parent element while keeping
 * the aspect ratio.
 */
export default function AutoScaler(props: PropsWithChildren<{
    defaultWidth: number, // usual width of the children's container in px
    defaultHeight: number, // usual height of the children's container in px
    maxScaledHeight: string, // css dimension
    id?: string // id of div container of children
    className?: string // css class to apply to div container of children
    style?: CSSProperties // css styles to apply to div container of children
}>) {

    const wrapperRef = useRef<HTMLDivElement>(null)
    const [scaling, setScaling] = useState<number>(1)

    useEffect(() => {
        function handleResize() {
            if (wrapperRef.current) {
                const targetWidth = wrapperRef.current.offsetHeight * props.defaultWidth / props.defaultHeight
                setScaling(targetWidth / props.defaultWidth)
            }
        }

        window.addEventListener('resize', handleResize)
        handleResize()

        return () => { window.removeEventListener('resize', handleResize) }
    })

    return (
        <div ref={wrapperRef} style={{
            position: 'relative',
            height: '0',
            // scale height of div such that aspect ratio is presevered but do not exceed a maximum height
            paddingBottom: 'min(' + (props.defaultHeight / props.defaultWidth * 100) + '%, ' + props.maxScaledHeight + ')' 
        }}>
            <div id={props.id} className={props.className} style={{
                ...props.style,
                position: 'absolute',
                width: props.defaultWidth + 'px',
                height: props.defaultHeight + 'px',
                transform: 'scale(' + scaling + ') translateX(-50%)',
                transformOrigin: '0 0',
                left: '50%',
            }}>
                {props.children}
            </div>
        </div>
    )
}