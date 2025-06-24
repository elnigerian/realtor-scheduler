import {type ClassValue, clsx} from "clsx"
import {twMerge} from "tailwind-merge"
import {addMinutes, format, isBefore, setMilliseconds, setSeconds} from "date-fns";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to parse time string "HH:mm" to Date object
export function parseTimeString(timeString: string): Date {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

/**
 * Generates time slots in 30-minute increments from the current time to the specified end time
 *
 * @param endTime - End time in "HH:mm" format (24-hour)
 * @param intervalMinutes - Time interval in minutes (default: 30)
 * @returns Array of available time slots in "HH:mm" format
 */
export function isTimeSlotDisabled(endTime: string, intervalMinutes: number = 30): string[] {
  // Get the current date and time
  const now = new Date();

  // Round up to the next 30-minute slot
  const currentMinutes = now.getMinutes();
  const minutesToAdd = currentMinutes % intervalMinutes === 0
      ? intervalMinutes
      : intervalMinutes - (currentMinutes % intervalMinutes);

  // Create a starting time (next available slot)
  let startTime = addMinutes(now, minutesToAdd);
  startTime = setSeconds(setMilliseconds(startTime, 0), 0); // Reset seconds and milliseconds

  // Parse end time
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  const endTimeDate = new Date(now);
  endTimeDate.setHours(endHours, endMinutes, 0, 0);

  // If end time is before the calculated start time, assume it's for the next day
  if (isBefore(endTimeDate, startTime)) {
    endTimeDate.setDate(endTimeDate.getDate() + 1);
  }

  // Generate time slots
  const timeSlots: string[] = [];
  let currentSlot = startTime;

  while (isBefore(currentSlot, endTimeDate)) {
    timeSlots.push(format(currentSlot, "HH:mm"));
    currentSlot = addMinutes(currentSlot, intervalMinutes);
  }

  return timeSlots;
}


export function generateTimeSlots(
    start: string,
    end: string,
    intervalMinutes: number = 30
): string[] {
  const slots: string[] = [];
  // const startTime = parse(start, "HH:mm", new Date());
  // const endTime = parse(end, "HH:mm", new Date());
  const startTime = parseTimeString(start);
  const endTime = parseTimeString(end);

  let current = startTime;

  while (isBefore(current, endTime)) {
    slots.push(format(current, "HH:mm"));
    current = addMinutes(current, intervalMinutes);
  }

  return slots;
}

export function isTimeSlotAvailable(
    timeSlot: string,
    blockedSlots: Array<{
      startTime?: string;
      endTime?: string;
    }>,
    existingTours: Array<{
      startTime: string;
      endTime: string;
    }>,
    workingHours: {start: string; end: string}
): boolean {
  // Check blocked slots
  const isBlocked = blockedSlots.some((slot) => {
    if (!slot.startTime || !slot.endTime) return true; // Entire day blocked
    return timeSlot >= slot.startTime && timeSlot < slot.endTime;
  });

  if (isBlocked) return false;

  // Check existing meetings
  const hasConflict = existingTours.some((tours) => {
    return timeSlot >= tours.startTime && timeSlot < tours.endTime;
  });

  // return !hasConflict;
  if (hasConflict) return false;

  // Check to ensure previous time slots are not included
  const availableTimeSlotsToday = isTimeSlotDisabled(workingHours.end);
  return availableTimeSlotsToday.some((slot) => timeSlot >= slot);
}
