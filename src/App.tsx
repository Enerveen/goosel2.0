import classes from './App.module.scss'
import Main from "./stages/Main/Main";
import Simulation from "./stages/Simulation/Simulation";
import React, {lazy, Suspense, useState} from "react";
import {appPhase} from "./types";
import Loader from "./components/Loader/Loader";
import imagesSrc from "./img";
import usePreloadedImages from "./hooks/useImagePreload";
import ImageContext from './stores/ImageContext';
import Soundtrack from "./components/Soundtrack/Soundtrack";

const LazyResults = lazy(() => import("./stages/Results/Results"))

const App = () => {
    const [phase, setPhase] = useState<appPhase>('NOT_STARTED')
    const [images, isImagesPreloaded] = usePreloadedImages(imagesSrc)
    return isImagesPreloaded ? <ImageContext.Provider value={images}>
        <div className={classes.container}>
            <Soundtrack/>
            {phase === 'NOT_STARTED' && <Main setAppPhase={setPhase}/>}
            {phase === 'STARTED' && <Simulation setAppPhase={setPhase}/>}
            <Suspense fallback={<Loader fullscreen={true}/>}>
                {phase === 'FINISHED' && <LazyResults setAppPhase={setPhase}/>}
            </Suspense>
        </div>
    </ImageContext.Provider> : <Loader fullscreen={true}/>
}

export default App
