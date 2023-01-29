import {useEffect, useState} from 'react'

const usePreloadedImages = (imageSources: { [key: string]: string }) => {
    const [loadedImages, setLoadedImages] = useState({});
    const [loadingFinished, setLoadingFinished] = useState(false);

    useEffect(() => {

        const promises = Object.keys(imageSources).map((key) => {
            return new Promise<[string, HTMLImageElement]>((resolve, reject) => {
                const img = new Image();
                img.src = imageSources[key];
                img.onload = () => resolve([key, img]);
                img.onerror = reject;
            });
        });

        Promise.all(promises).then((images) => {
            const loadedImagesObject: { [key: string]: HTMLImageElement } = {};
            images.forEach(([key, image]) => {
                loadedImagesObject[key] = image;
            });
            setLoadedImages(loadedImagesObject);
            setLoadingFinished(true);
        });
    }, [JSON.stringify(imageSources)]);

    return [loadedImages, loadingFinished];
};

export default usePreloadedImages