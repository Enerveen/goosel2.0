import classes from './App.module.scss'
import simulationStore from "./stores/simulationStore";
import Main from "./stages/Main/Main";
import Simulation from "./stages/Simulation/Simulation";
import Results from "./stages/Results/Results";
import {useState} from "react";
import {appPhase} from "./types";

const App = () => {
    const [phase, setPhase] = useState<appPhase>('NOT_STARTED')


    return <div className={classes.container}>
        {phase === 'NOT_STARTED' && <Main setAppPhase={setPhase}/>}
        {phase === 'STARTED' && <Simulation store={simulationStore} setAppPhase={setPhase}/>}
        {phase === 'FINISHED' && <Results statistics={simulationStore.getStatistics}/>}
    </div>
}

export default App
