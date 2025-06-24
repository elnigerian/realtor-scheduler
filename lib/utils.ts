import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, addMinutes, isBefore } from "date-fns";


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
    existingMeetings: Array<{
      startTime: string;
      endTime: string;
    }>
): boolean {
  // Check blocked slots
  const isBlocked = blockedSlots.some((slot) => {
    if (!slot.startTime || !slot.endTime) return true; // Entire day blocked
    return timeSlot >= slot.startTime && timeSlot < slot.endTime;
  });

  if (isBlocked) return false;

  // Check existing meetings
  const hasConflict = existingMeetings.some((meeting) => {
    return timeSlot >= meeting.startTime && timeSlot < meeting.endTime;
  });

  return !hasConflict;
}
