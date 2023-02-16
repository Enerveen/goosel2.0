import classes from './App.module.scss'
import Main from "./stages/Main/Main";
import Simulation from "./stages/Simulation/Simulation";
import {lazy, Suspense, useState} from "react";
import {appPhase} from "./types";
import Loader from "./components/Loader/Loader";
import imagesSrc from "./img";
import usePreloadedImages from "./hooks/useImagePreload";
import ImageContext from './stores/ImageContext';

const LazyResults = lazy(() => import("./stages/Results/Results"))

const App = () => {
    const [phase, setPhase] = useState<appPhase>('NOT_STARTED')
    const [images, isImagesPreloaded] = usePreloadedImages(imagesSrc)
    return isImagesPreloaded ? <ImageContext.Provider value={images}>
        <div className={classes.container}>
            {phase === 'NOT_STARTED' && <Main setAppPhase={setPhase}/>}
            {phase === 'STARTED' && <Simulation setAppPhase={setPhase}/>}
            <Suspense fallback={<Loader/>}>
                {phase === 'FINISHED' && <LazyResults/>}
            </Suspense>
        </div>
    </ImageContext.Provider> : <Loader/>
}

export default App
