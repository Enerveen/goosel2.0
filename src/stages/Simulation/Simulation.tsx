import React, {useCallback, useState} from "react";
import classes from './Simulation.module.scss'
import simulationStore, {SimulationStore} from "../../stores/simulationStore";
import {observer} from "mobx-react-lite";
import Scene from "../../components/Scene/Scene";
import {clsSum} from "../../utils/utils";
import Menu from "../../icons/Menu";
import Drawer from "../../components/Drawer/Drawer";
import Controls from "../../components/Controls/Controls";
import ActiveEntityInfo from "../../components/ActiveEntityInfo/ActiveEntityInfo";
import {appPhase} from "../../types";
import Log from "../../components/Log/Log";

interface ISimulationProps {
    store: SimulationStore
    setAppPhase: (phase: appPhase) => void
}

const Simulation = observer(({store, setAppPhase}: ISimulationProps) => {
    const [drawerOpen, setDrawerOpen] = useState(false)
    const onDrawerClose = useCallback(() => {
        setDrawerOpen(false)
    }, [])

    const onDrawerOpen = useCallback(() => {
        setDrawerOpen(true)
    }, [])

    return <div className={classes.container}>
        <Scene store={simulationStore} setAppPhase={setAppPhase}/>
        <Log logs={simulationStore.getLog}/>
        <div className={clsSum(classes.menuOpenBtn, drawerOpen ? classes.active : null)} onClick={onDrawerOpen}>
            <Menu/>
        </div>
        <Drawer open={drawerOpen} onClose={onDrawerClose}>
            <div className={classes.aside}>
                <Controls
                    simulationSpeed={store.simulationSpeed}
                    setSimulationSpeed={store.setSimulationSpeed}
                    timestamp={store.getTimestamp}
                    setAppPhase={setAppPhase}
                    addAnimal={store.addAnimal}
                    animalMaxEnergy={store.getSimulationConstants.animalMaxEnergy}
                />
            </div>
        </Drawer>
        <ActiveEntityInfo
            activeEntity={store.getActiveEntity}
            energy={store.getActiveEntity?.energy.current}
        />
    </div>
})

export default Simulation