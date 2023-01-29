import classes from './App.module.scss'
import simulationStore from "./stores/simulationStore";
import Main from "./stages/Main/Main";
import Simulation from "./stages/Simulation/Simulation";
import Results from "./stages/Results/Results";
import {useState} from "react";
import {appPhase} from "./types";
import useImagePreload from "./hooks/useImagePreload";
import bgSrc from "./img/background.jpg";
import plantSrc from "./img/plant.png";
import animalTextureAtlasSrc from "./img/animalTextureAtlas.png";
import eggSrc from "./img/egg.png";
import heartSrc from "./img/heart.png";
import egg2Src from "../public/egg2.png";
import Loader from "./components/Loader/Loader";

const App = () => {
    const [phase, setPhase] = useState<appPhase>('NOT_STARTED')
    const isImagesPreloaded = useImagePreload([bgSrc, plantSrc, animalTextureAtlasSrc, eggSrc, heartSrc, egg2Src])
    return isImagesPreloaded ? <div className={classes.container}>
        {phase === 'NOT_STARTED' && <Main setAppPhase={setPhase}/>}
        {phase === 'STARTED' && <Simulation store={simulationStore} setAppPhase={setPhase}/>}
        {phase === 'FINISHED' && <Results statistics={simulationStore.getStatistics}/>}
    </div> : <Loader/>
}

export default App
