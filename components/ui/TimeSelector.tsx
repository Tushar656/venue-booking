import React, { useState, useRef, useEffect } from 'react';

interface TimeRange {
    start: number;
    end: number;
}

interface TimeSlotSelectorProps {
    venueId?: string;
    courtId: string;
    date: string;
    onTimeChange: (startTime: string, endTime: string) => void;
    isLoading?: boolean;
}

export const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({ courtId, date, onTimeChange, isLoading: externalLoading }) => {
    const [startTime, setStartTime] = useState<number | null>(null);
    const [endTime, setEndTime] = useState<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [hoverTime, setHoverTime] = useState<number | null>(null);
    const [error, setError] = useState('');
    const [bookedRanges, setBookedRanges] = useState<TimeRange[]>([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const timelineRef = useRef<HTMLDivElement>(null);

    // Helpers
    const hoursToTime = (hours: number) => {
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        const ampm = h >= 12 && h < 24 ? 'PM' : 'AM';
        const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
        const displayM = m < 10 ? `0${m}` : m;
        return `${displayH}:${displayM} ${ampm}`;
    };

    const timeToISO = (hours: number, dateStr: string) => {
        const d = new Date(dateStr);
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        d.setHours(h, m, 0, 0);
        return d.toTimeString().slice(0, 5); 
    };

    const getTimelineTime = (e: React.MouseEvent | React.TouchEvent) => {
        if (!timelineRef.current) return 0;
        const rect = timelineRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const x = clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        return percentage * 24;
    };

    const isOverlapping = (start: number, end: number) => {
        return bookedRanges.some(range =>
            (start < range.end && end > range.start)
        );
    };

    const validateSelection = (start: number, end: number) => {
        if (start >= end) return "Invalid time range";
        if (isOverlapping(start, end)) return "Selected time overlaps with an existing booking";
        return "";
    };

    useEffect(() => {
        const fetchAvailability = async () => {
            if (!courtId || !date) return;

            setIsLoadingSlots(true);
            setBookedRanges([]);
            try {
                const token = localStorage.getItem("token");

                // Calculate UTC range for the selected local date (00:00 to 24:00 local time)
                const startOfDay = new Date(date);
                startOfDay.setHours(0, 0, 0, 0); // Local start of day
                const endOfDay = new Date(date);
                endOfDay.setHours(23, 59, 59, 999); // Local end of day

                const res = await fetch(`/api/availability`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        courtId,
                        startTime: startOfDay.toISOString(),
                        endTime: endOfDay.toISOString()
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    // Map timestamps (ISO) to local hours (0-24) for visualization
                    const ranges = (data.bookings || []).map((b: { startTime: string; endTime: string }) => {
                        const s = new Date(b.startTime);
                        const e = new Date(b.endTime);
                        return {
                            start: s.getHours() + s.getMinutes() / 60,
                            end: e.getHours() + e.getMinutes() / 60
                        };
                    });
                    setBookedRanges(ranges);
                }
            } catch (err) {
                console.error("Failed to fetch availability", err);
            } finally {
                setIsLoadingSlots(false);
            }
        };

        fetchAvailability();
        // Reset selection on context change
        setStartTime(null);
        setEndTime(null);
        setError("");
        if (onTimeChange) onTimeChange("", "");
    }, [courtId, date]);


    // Handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        if (bookedRanges.length > 0 && isLoadingSlots) return;
        const time = getTimelineTime(e);
        const snap = 0.5;
        const snappedTime = Math.round(time / snap) * snap;
        setStartTime(snappedTime);
        setEndTime(snappedTime);
        setIsDragging(true);
        setError("");
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const time = getTimelineTime(e);
        // Snap hover to 30 mins for cleaner UX
        const snap = 0.5;
        const snappedTime = Math.round(time / snap) * snap;
        setHoverTime(snappedTime);

        if (isDragging && startTime !== null) {
            setEndTime(snappedTime);
        }
    };

    const handleMouseUp = () => {
        if (isDragging && startTime !== null && endTime !== null) {
            const start = Math.min(startTime, endTime);
            const end = Math.max(startTime, endTime);

            // Snap to 30 mins (0.5 hours)
            const snap = 0.5;
            const snappedStart = Math.round(start / snap) * snap;
            const snappedEnd = Math.max(snappedStart + snap, Math.round(end / snap) * snap);

            const validationError = validateSelection(snappedStart, snappedEnd);

            if (validationError) {
                setError(validationError);
                setStartTime(null);
                setEndTime(null);
                if (onTimeChange) onTimeChange("", "");
            } else {
                setStartTime(snappedStart);
                setEndTime(snappedEnd);
                setError("");
                // Convert to HH:MM format for parent
                if (onTimeChange) {
                    onTimeChange(timeToISO(snappedStart, date), timeToISO(snappedEnd, date));
                }
            }
        }
        setIsDragging(false);
    };

    const handleMouseLeave = () => {
        if (isDragging) {
            handleMouseUp();
        }
        setHoverTime(null);
    };

    const handleTimelineClick = (e: React.MouseEvent) => {
        // TODO: click to set start, another click to set end? 
    };

    const clearSelection = () => {
        setStartTime(null);
        setEndTime(null);
        setError("");
        if (onTimeChange) onTimeChange("", "");
    };

    const displayStart = startTime !== null && endTime !== null ? Math.min(startTime, endTime) : null;
    const displayEnd = startTime !== null && endTime !== null ? Math.max(startTime, endTime) : null;
    const duration = displayEnd !== null && displayStart !== null ? displayEnd - displayStart : 0;

    if (!courtId || !date) {
        return (
            <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
                <p className="text-amber-800 text-sm">
                    Please select a court and date to view available time slots.
                </p>
            </div>
        );
    }

    return (
        <div className="">
            <div className="">
                {isLoadingSlots && (
                    <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                        <p className="text-blue-800 text-sm">Loading available slots...</p>
                    </div>
                )}

                {/* Timeline */}
                <div className="mb-4 select-none">
                    <div className="flex justify-between mb-2 px-1 text-xs font-medium text-gray-600">
                        {[0, 6, 12, 18, 24].map((hour) => (
                            <div key={hour}>
                                {hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                            </div>
                        ))}
                    </div>

                    <div
                        ref={timelineRef}
                        className="relative h-24 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 rounded-2xl cursor-pointer shadow-inner overflow-hidden"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
                        onClick={handleTimelineClick}
                        style={{ touchAction: 'none' }}
                    >
                        {/* Hour grid */}
                        {Array.from({ length: 25 }, (_, i) => i).map((hour) => (
                            <div
                                key={hour}
                                className="absolute top-0 bottom-0 border-l border-gray-300/50"
                                style={{ left: `${(hour / 24) * 100}%` }}
                            />
                        ))}

                        {/* Hover indicator */}
                        {hoverTime !== null && !isDragging && (
                            <div
                                className="absolute top-0 bottom-0 w-0.5 bg-purple-400 pointer-events-none"
                                style={{ left: `${(hoverTime / 24) * 100}%` }}
                            >
                                <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                                    {hoursToTime(hoverTime)}
                                </div>
                            </div>
                        )}

                        {/* Booked ranges */}
                        {bookedRanges.map((range, idx) => (
                            <div
                                key={idx}
                                className="absolute top-0 bottom-0 bg-red-500/70 backdrop-blur-sm border-2 border-red-600"
                                style={{
                                    left: `${(range.start / 24) * 100}%`,
                                    width: `${((range.end - range.start) / 24) * 100}%`
                                }}
                            >
                                <div className="h-full flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white drop-shadow">
                                        <path d="M18 6 6 18" />
                                        <path d="m6 6 12 12" />
                                    </svg>
                                </div>
                            </div>
                        ))}

                        {/* Selected range */}
                        {displayStart !== null && displayEnd !== null && (
                            <div
                                className={`absolute top-0 bottom-0 border-2 backdrop-blur-sm ${error
                                    ? 'bg-orange-400/80 border-orange-600'
                                    : 'bg-green-400/80 border-green-600 shadow-lg'
                                    }`}
                                style={{
                                    left: `${(displayStart / 24) * 100}%`,
                                    width: `${((displayEnd - displayStart) / 24) * 100}%`
                                }}
                            >
                                <div className="h-full flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white drop-shadow">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="m9 12 2 2 4-4" />
                                    </svg>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Selected time display */}
                {displayStart !== null && displayEnd !== null && (
                    <div className={`p-6 rounded-2xl border-2 ${error ? 'bg-orange-50 border-orange-300' : 'bg-green-50 border-green-300'
                        }`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-1">Selected Time</h3>
                                <p className="text-3xl font-bold text-gray-900 mb-1">
                                    {hoursToTime(displayStart)} - {hoursToTime(displayEnd)}
                                </p>
                                <p className="text-gray-600">
                                    {Math.floor(duration)}h {Math.round((duration % 1) * 60)}m
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={clearSelection}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors text-sm"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="mt-4 p-4 bg-red-100 border-2 border-red-300 rounded-xl">
                        <p className="text-red-800 font-semibold text-sm">⚠️ {error}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TimeSlotSelector;
