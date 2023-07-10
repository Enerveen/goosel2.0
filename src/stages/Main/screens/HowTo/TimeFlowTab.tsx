import classes from "./HowTo.module.scss";
import React from "react";

const TimeFlowInfo = ({setTab}: {setTab: (id:string) => void}) => {

    return <div className={classes.infoContent}>
        <p>
            As in real life, time is constantly flowing from the start of the simulation till its end.
            Though, the simulation process can be sped up using the Speed slider which can be found in the simulation control panel.
        </p>
        <p>
            On the same panel, you may find some sort of a clock, which is meant to inform you about the current date.
            One day lasts 1/12 of a second of real-time, one month consists of 30 days and one year consists of 4 months
            (Beakuary, Flapril, Honkgust, and Feathember. So, by default, 1 year lasts 10 seconds.
        </p>
        <p>
            Time affects different processes in simulation, the most important examples are provided below:
        </p>
        <ul>
            <li>
                Every 1/5 of a day there is a chance of spawning a <span className={classes.special}>Plant</span>. That
                chance can be configured in pre-start simulation settings or right during it's process
                with <span className={classes.special}>Plant spawn chance slider</span>.
            </li>
            <li>
                As <span className={classes.special}>Geese</span> grow up and then get old, they have
                various possibilities and behaviour depending on their age. It is described with more details
                in <span className={classes.link} onClick={() => setTab('plants')} >Geese behaviour</span> tab.
            </li>
            <li>At the end of each year, statistics is gathered to later be represented in simulation report</li>
        </ul>
    </div>
}

export default TimeFlowInfo