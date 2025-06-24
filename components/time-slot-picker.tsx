"use client";

import { Button } from "@/components/ui/button";
import { generateTimeSlots, isTimeSlotAvailable } from "@/lib/utils";

interface TimeSlotPickerProps {
    workingHours: { start: string; end: string };
    selectedDate?: string;
    blockedSlots: Array<{
        startTime?: string;
        endTime?: string;
    }>;
    existingTours: Array<{
        startTime: string;
        endTime: string;
    }>;
    selectedTime: string | null;
    onTimeSelect: (time: string) => void;
}

export function TimeSlotPicker({
                                   workingHours,
                                   blockedSlots,
                                   existingTours,
                                   selectedTime,
                                   onTimeSelect,
                               }: TimeSlotPickerProps) {
    const timeSlots = generateTimeSlots(workingHours.start, workingHours.end, 30);

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Available Time Slots</h3>
            <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((slot) => {
                    const isAvailable = isTimeSlotAvailable(
                        slot,
                        blockedSlots,
                        existingTours,
                        workingHours
                    );

                    return (
                        <Button
                            key={slot}
                            variant={selectedTime === slot ? "default" : "outline"}
                            disabled={!isAvailable}
                            onClick={() => onTimeSelect(slot)}
                            className="w-full shadow-none"
                        >
                            {slot}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}
