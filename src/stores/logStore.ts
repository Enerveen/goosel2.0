import {create} from "zustand";
import {LogItem} from "../types";

interface ILogStore {
    logs: LogItem[]
    addLogItem: (log:LogItem) => void
}

const useLogStore = create<ILogStore>((set) => ({
    logs: [],
    addLogItem: (log: LogItem) => set(state => ({
        logs: [log, ...state.logs]
    }))
}))

export default useLogStore