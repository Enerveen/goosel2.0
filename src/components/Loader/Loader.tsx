import React, {useEffect, useState} from "react";
import classes from './Loader.module.scss'
import loadingGif from '../../img/goose.gif'
import {loadingTexts} from "../../constants/loading";
import {coinFlip} from "../../utils/utils";

const Loader = () => {
    const [texts, setTexts] = useState([...loadingTexts].sort(() => coinFlip() ? 1 : -1))
    const [currentText, setCurrentText] = useState(texts.at(-1))

    useEffect(() => {
            const timeout = setTimeout(() => {
                const value = texts[0]
                setCurrentText(value)
                setTexts(prevValue => [...prevValue.filter(elem => elem !== value), value])
            }, 2000);
            return () => clearTimeout(timeout)
    },[currentText]);

    return <div className={classes.container}>
        <div className={classes.innerContainer}>
            <img src={loadingGif} alt={'Running goose'}/>
            <div className={classes.loadingTextContainer}>
                <span className={classes.loadingText}>{currentText}</span>
                <span className={classes.loadingTextProgress}>{currentText}</span>
            </div>
        </div>
    </div>
}

export default Loader