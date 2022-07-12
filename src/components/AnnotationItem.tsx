import React from "react"
import { ElucidateAnnotation } from "../model/ElucidateAnnotation"
import { appContext } from "../state/context"
import getBodyValue from "../backend/utils/getBodyValue"
import {AnnotationItemContent} from "./AnnotationItemContent"
import mirador from "mirador"
import findImageRegions from "../backend/utils/findImageRegions"
import styled from "styled-components"
import getAttendantInfo from "../backend/utils/getAttendantInfo"
import getResolutionInfo from "../backend/utils/getResolutionInfo"

type AnnotationSnippetProps = {
    annot_id: React.Key,
    annotation: ElucidateAnnotation,
    selected: boolean
    onSelect: (a: ElucidateAnnotation | undefined) => void
}

const AnnSnippet = styled.div`
    margin: 5px 0;
    padding: 10px;
    border-style: solid;
    border-color: darkgray;
    border-width: 1px;
`

const Clickable = styled.div`
    cursor: pointer;
    font-weight: bold;
    user-select: none;
    &:hover {
        text-decoration: underline;
    }
`

export function AnnotationItem(props: AnnotationSnippetProps) {
    const [isOpen, setOpen] = React.useState(false)
    const { state } = React.useContext(appContext)

    function toggleOpen() {
        setOpen(!isOpen)

        if(!isOpen) {
            const region = findImageRegions(props.annotation)
            const [x, y, w, h] = region[0].split(",")
            console.log(x, y, w, h)      
            const boxToZoom = {
                x: parseInt(x),
                y: parseInt(y),
                width: parseInt(w),
                height: parseInt(h)
            }
            const zoomCenter = {
                x: boxToZoom.x + boxToZoom.width / 2,
                y: boxToZoom.y + boxToZoom.height / 2
            }
            state.store.dispatch(mirador.actions.selectAnnotation("republic", props.annotation.id))
            state.store.dispatch(mirador.actions.updateViewport("republic", {
                x: zoomCenter.x,
                y: zoomCenter.y,
                zoom: 0.8 / boxToZoom.width
            }))

        } else {
            state.store.dispatch(mirador.actions.deselectAnnotation("republic", props.annotation.id))
        }
    }

    /**
     * The next two functions might be performance intensive, especially for mobile users.
     * TODO: check performance of both functions
     */

    function selectAnn() {
        state.store.dispatch(mirador.actions.selectAnnotation("republic", props.annotation.id))
    }

    function deselectAnn() {
        state.store.dispatch(mirador.actions.deselectAnnotation("republic", props.annotation.id))
    }

    return (
        <AnnSnippet id="annotation-snippet">
            <Clickable onMouseOver={selectAnn} onMouseLeave={deselectAnn} onClick={toggleOpen} id="clickable">
                {(() => {
                    switch(getBodyValue(props.annotation)) {
                    case("attendant"):
                        return getAttendantInfo(props.annotation, "http://example.org/customwebannotationfield#delegate_name") + " (" + `${getBodyValue(props.annotation)}` + ")"
                    case("resolution"):
                        return getResolutionInfo(props.annotation, "http://example.org/customwebannotationfield#proposition_type") + " (" + `${getBodyValue(props.annotation)}` + ")"
                    case("session"):
                        return "Session: " + getAttendantInfo(props.annotation, "http://example.org/customwebannotationfield#weekday") + ", " + getAttendantInfo(props.annotation, "http://example.org/customwebannotationfield#date")
                    default:
                        return getBodyValue(props.annotation)
                    }
                })()}
            </Clickable>
            {isOpen && <AnnotationItemContent ann={props.annotation} />}
        </AnnSnippet>
    )
}