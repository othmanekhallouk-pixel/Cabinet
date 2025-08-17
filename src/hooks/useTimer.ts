import { useState, useEffect, useRef } from 'react';
import { TimeEntry } from '../types';

export interface TimerState {
  isRunning: boolean;
  elapsedTime: number; // in seconds
  startTime?: Date;
  currentEntry?: Partial<TimeEntry>;
}

export function useTimer() {
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    elapsedTime: 0,
  });

  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timerState.isRunning && timerState.startTime) {
      intervalRef.current = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - timerState.startTime!.getTime()) / 1000);
        setTimerState(prev => ({ ...prev, elapsedTime: elapsed }));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState.isRunning, timerState.startTime]);

  const startTimer = (entry: Partial<TimeEntry>) => {
    const startTime = new Date();
    setTimerState({
      isRunning: true,
      elapsedTime: 0,
      startTime,
      currentEntry: { ...entry, startTime },
    });
  };

  const stopTimer = () => {
    if (timerState.startTime && timerState.currentEntry) {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - timerState.startTime.getTime()) / 60000); // in minutes
      
      const completedEntry: Partial<TimeEntry> = {
        ...timerState.currentEntry,
        endTime,
        duration,
        isRunning: false,
      };

      setTimerState({
        isRunning: false,
        elapsedTime: 0,
      });

      return completedEntry;
    }
    return null;
  };

  const pauseTimer = () => {
    if (timerState.isRunning) {
      setTimerState(prev => ({ ...prev, isRunning: false }));
    }
  };

  const resumeTimer = () => {
    if (timerState.startTime && !timerState.isRunning) {
      setTimerState(prev => ({ ...prev, isRunning: true }));
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    timerState,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    formatTime: (seconds?: number) => formatTime(seconds ?? timerState.elapsedTime),
  };
}