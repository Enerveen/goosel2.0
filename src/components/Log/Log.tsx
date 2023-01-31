import React from "react";
import classes from './Log.module.scss'
import {observer} from "mobx-react-lite";
import useLogStore from "../../stores/logStore";

interface ILogProps {
    timestamp: number
}

const Log = observer(({timestamp}:ILogProps) => {
    const {logs} = useLogStore()
    return <div className={classes.container}>
        {logs.slice(0, 10)
            .filter(({timestamp: messageTimestamp}) => timestamp - messageTimestamp < 1000)
            .reverse()
            .map(({message, timestamp: messageTimestamp}, index) =>
            <span
                className={classes.logItem}
                key={message+index}
                style={{opacity: 1 - (timestamp - messageTimestamp) / 1000}}
            >
                {message}
            </span>)}
    </div>
})

export default Log