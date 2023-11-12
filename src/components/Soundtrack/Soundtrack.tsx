import soundtrack from '../../audio/soundtrack.mp3'
import classes from './Soundtrack.module.scss'
import {useCallback, useEffect, useMemo, useState} from "react";
import Sound from "../../icons/Sound";
import Mute from "../../icons/Mute";

const Soundtrack = () => {
    const [isSoundOn, setSoundOn] = useState(false)
    const audio = useMemo(() => {
        const audio = new Audio(soundtrack)
        audio.muted = true
        audio.loop = true
        audio.volume = 0.6
        return audio
    }, [])
    const toggleSound = useCallback(() => setSoundOn(prevState => !prevState), [])
    useEffect(() => {
        if (isSoundOn) {
            audio.muted = false
            audio.play()
        } else {
            audio.muted = true
            audio.pause()
        }
        return () => audio.pause()
    }, [isSoundOn])
    return <div className={classes.soundtrackBtnContainer} onClick={toggleSound}>{isSoundOn ? <Sound className={classes.soundIcon}/> : <Mute/>}</div>
}

export default Soundtrack