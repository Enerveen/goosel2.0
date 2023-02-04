class Timer {
    timeStart: number = 0
    timerStop: number = 0

    constructor() {

    }

    start() {
        return this.timeStart = performance.now()
    }


    delta() {
        return performance.now() - this.timeStart;
    }


    stop() {
        this.timerStop = performance.now();

        return this.timerStop - this.timeStart
    }
}


export const performanceTimer = new Timer();