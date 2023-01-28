import {useEffect, useState} from 'react'

const preloadImage = (src: string) => {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = function () {
            resolve(img)
        }
        img.onerror = img.onabort = function () {
            reject(src)
        }
        img.src = src
    })
}

const useImagePreload = (imageList: string[]) => {
    const [imagesPreloaded, setImagesPreloaded] = useState<boolean>(false)

    useEffect(() => {
        let isCancelled = false

        const preload = async () => {
            console.log('textures preload started')

            if (isCancelled) {
                return
            }

            const imagesPromiseList: Promise<any>[] = []
            for (const i of imageList) {
                imagesPromiseList.push(preloadImage(i))
            }

            await Promise.all(imagesPromiseList)

            if (isCancelled) {
                return
            }

            setImagesPreloaded(true)
        }

        preload()

        return () => {
            isCancelled = true
        }
    }, [imageList])

    return imagesPreloaded
}

export default useImagePreload