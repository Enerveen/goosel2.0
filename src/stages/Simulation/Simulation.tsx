import React, {useCallback, useState} from "react";
import classes from './Simulation.module.scss'
import simulationStore from "../../stores/simulationStore";
import Scene from "../../components/Scene/Scene";
import {clsSum} from "../../utils/utils";
import Menu from "../../icons/Menu";
import Drawer from "../../components/Drawer/Drawer";
import Controls from "../../components/Controls/Controls";
import ActiveEntityInfo from "../../components/ActiveEntityInfo/ActiveEntityInfo";
import {appPhase} from "../../types";

interface ISimulationProps {
    setAppPhase: (phase: appPhase) => void
}

const Simulation = ({setAppPhase}: ISimulationProps) => {
    const [drawerOpen, setDrawerOpen] = useState(false)
    const onDrawerClose = useCallback(() => {
        setDrawerOpen(false)
    }, [])

    const onDrawerOpen = useCallback(() => {
        setDrawerOpen(true)
    }, [])

    return <div className={classes.container}>
        <Scene store={simulationStore} setAppPhase={setAppPhase}/>
        <div className={clsSum(classes.menuOpenBtn, drawerOpen ? classes.active : null)} onClick={onDrawerOpen}>
            <Menu/>
        </div>
        <Drawer open={drawerOpen} onClose={onDrawerClose}>
            <div className={classes.aside}>
                <Controls setAppPhase={setAppPhase}/>
            </div>
        </Drawer>
        <ActiveEntityInfo/>
    </div>
}

export default Simulation