import React, {useState, DragEvent, ChangeEvent, useCallback} from 'react';
import classes from './DndUpload.module.scss'
import {clsSum} from "../../utils/utils";

interface IDndUploaderProps {
    onFileLoad: (jsonData:any) => void
    onError: (errorMessage: string) => void
}
const DragAndDropUploader = ({onFileLoad, onError}: IDndUploaderProps) => {
    const [dragging, setDragging] = useState(false);

    const processLoadedFiles = useCallback((files: FileList | null) => {
        if (files && files.length === 1 && files[0].type === 'application/json') {
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const jsonData = JSON.parse(reader.result as string);
                    onFileLoad(jsonData)
                } catch (error: unknown) {
                    onError((error as Error).message)
                }
            }
            reader.readAsText(files[0])
        } else {
            if (files && files[0].type !== 'application/json') {
                onError('Provided file has incorrect extension!')
            }
            if (files && files.length > 1) {
                onError('You have to provide a single file!')
            }

        }
    }, [onError, onFileLoad])

    const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setDragging(false);
    }, []);

    const handleDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragging(false);

        const files = event.dataTransfer.files;
        processLoadedFiles(files)
    }, [processLoadedFiles]);

    const handleFileInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        processLoadedFiles(files)
    }, [processLoadedFiles]);

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={clsSum(classes.dndUploader, dragging ? classes.dragging : null)}
        >
            <input className={classes.input} type="file" onChange={handleFileInputChange} accept=".json" />
            <span>Upload save file</span>
        </div>
    );
};

export default DragAndDropUploader;