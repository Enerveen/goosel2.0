import classes from './App.module.scss'
import simulationStore from "./stores/simulationStore";
import Main from "./stages/Main/Main";
import Simulation from "./stages/Simulation/Simulation";
import Results from "./stages/Results/Results";
import {useState} from "react";
import {appPhase} from "./types";
import Loader from "./components/Loader/Loader";
import imagesSrc from "./img";
import usePreloadedImages from "./hooks/useImagePreload";
import ImageContext from './stores/ImageContext';

const App = () => {
    const [phase, setPhase] = useState<appPhase>('NOT_STARTED')
    const [images, isImagesPreloaded] = usePreloadedImages(imagesSrc)
    return isImagesPreloaded ? <ImageContext.Provider value={images}>
        <div className={classes.container}>
            {phase === 'NOT_STARTED' && <Main setAppPhase={setPhase}/>}
            {phase === 'STARTED' && <Simulation store={simulationStore} setAppPhase={setPhase}/>}
            {phase === 'FINISHED' && <Results statistics={simulationStore.getStatistics}/>}
        </div>
    </ImageContext.Provider> : <Loader/>
}

export default App
