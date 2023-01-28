import React from "react";
import classes from './Log.module.scss'
import {observer} from "mobx-react-lite";

interface ILogProps {
    logs: string[]
}

const Log = observer(({logs}:ILogProps) => <div className={classes.container}>
    {logs.map((logItem, index) => <span className={classes.logItem} key={logItem+index}>{logItem}</span>)}
</div>)

export default Log