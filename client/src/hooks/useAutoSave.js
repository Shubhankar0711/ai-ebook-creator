import { useEffect, useRef, useCallback } from 'react'

const useAutoSave = (value, saveFn, delay = 30000) => {
 const timerRef = useRef(null)
 const prevRef = useRef(value)
 const saveFnRef = useRef(saveFn)

 useEffect(() => { saveFnRef.current = saveFn }, [saveFn])

 const save = useCallback(() => {
 if (prevRef.current !== value) {
 saveFnRef.current()
 prevRef.current = value
 }
 }, [value])

 useEffect(() => {
 timerRef.current = setInterval(save, delay)
 return () => clearInterval(timerRef.current)
 }, [save, delay])

 // Also save on unmount
 useEffect(() => {
 return () => { if (prevRef.current !== value) saveFnRef.current() }
 }, [value])

 const forceSave = useCallback(() => {
 clearInterval(timerRef.current)
 saveFnRef.current()
 prevRef.current = value
 timerRef.current = setInterval(save, delay)
 }, [value, save, delay])

 return { forceSave }
}

export default useAutoSave

