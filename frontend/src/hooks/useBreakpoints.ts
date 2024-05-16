import { useState, useEffect } from 'react';

enum Breakpoint {
    'xs',
    'sm',
    'md',
    'lg',
    'xl',
    'xxl'
}

const getBreakpoint = (): Breakpoint => {

    if (window.matchMedia('(min-width: 1400px)').matches) {
        return Breakpoint.xxl;
    } else if (window.matchMedia('(min-width: 1200px)').matches) {
        return Breakpoint.xl;
    } else if (window.matchMedia('(min-width: 992px)').matches) {
        return Breakpoint.lg
    } else if (window.matchMedia('(min-width: 768px)').matches) {
        return Breakpoint.md
    } else if (window.matchMedia('(min-width: 576px)').matches) {
        return Breakpoint.sm
    } else {
        return Breakpoint.xs
    }


}

const useBreakpoint = () => {
    const [breakpoint, setBreakpoint] = useState(getBreakpoint());

    const resizeEvent = () => {
        setBreakpoint(getBreakpoint())
    }

    useEffect(() => {
        window.addEventListener('resize', resizeEvent);
        return () => {
            window.removeEventListener('resize', resizeEvent);
        };
    }, [])

    return breakpoint;
}



export default useBreakpoint;