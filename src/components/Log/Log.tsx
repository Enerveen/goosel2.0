// deprecated logs logic, currently logs are implemented with drawLogs method of Renderer class

import React from "react";
import classes from './Log.module.scss'
import {observer} from "mobx-react-lite";
import {LogItem} from "../../types";

interface ILogProps {
    logs: LogItem[],
    timestamp: number
}

const Log = observer(({logs, timestamp}: ILogProps) => <div className={classes.container}>{
    logs.filter(({timestamp: messageTimestamp}) => timestamp - messageTimestamp < 1000)
        .reverse()
        .map(({message, timestamp: messageTimestamp}, index) =>
            <span
                className={classes.logItem}
                key={message + index}
                style={{opacity: 1 - (timestamp - messageTimestamp) / 1000}}
            >
            {message}
        </span>)}
</div>)

export default Log