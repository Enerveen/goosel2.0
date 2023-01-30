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

const App = () => {
    const [phase, setPhase] = useState<appPhase>('NOT_STARTED')
    const [images, isImagesPreloaded] = usePreloadedImages(imagesSrc)
    return isImagesPreloaded ? <div className={classes.container}>
        {phase === 'NOT_STARTED' && <Main setAppPhase={setPhase}/>}
        {phase === 'STARTED' && <Simulation store={simulationStore} setAppPhase={setPhase} images={images}/>}
        {phase === 'FINISHED' && <Results statistics={simulationStore.getStatistics}/>}
    </div> : <Loader/>
}

export default App
