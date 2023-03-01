import React, {useCallback, useRef} from "react";
import {observer} from "mobx-react-lite";
import Button from "../Button/Button";
import classes from './DownloadSaveButton.module.scss'
import simulationStore from "../../stores/simulationStore";

interface IDownloadSaveButtonProps {
    className: string
}

const DownloadSaveButton = observer(({className}: IDownloadSaveButtonProps) => {
    const downloadRef = useRef<HTMLAnchorElement>(null)

    const onSave = useCallback(() => {
        const fileName = "goosel-save.json";
        const json = JSON.stringify(simulationStore, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const href = URL.createObjectURL(blob);
        if (downloadRef.current) {
            downloadRef.current.href = href
            downloadRef.current.download = fileName
            downloadRef.current.click()
        }

    }, [simulationStore])

    return <>
        <a className={classes.invisibleLink} ref={downloadRef}/>
        <Button onClick={onSave} className={className}>
            Save
        </Button>
    </>
})

export default DownloadSaveButton