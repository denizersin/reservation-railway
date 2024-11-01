import { useRef, useEffect } from 'react';

const useFirstRender = (callback?: () => void) => {
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            callback?.();
            isFirstRender.current = false;
        }
    }, [callback]);

    return isFirstRender.current
};

export default useFirstRender;