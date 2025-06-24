"use client";

import * as React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Calendar } from "@/components/ui/calendar";
import { TimeSlotPicker } from "@/components/time-slot-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, addDays, startOfDay } from "date-fns";
import { CalendarDays, Clock, User } from "lucide-react";

export function MeetingScheduler() {
    const [selectedRealtor, setSelectedRealtor] = React.useState<Id<"realtors"> | null>(null);
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
    const [selectedTime, setSelectedTime] = React.useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);

    // Form state
    const [clientName, setClientName] = React.useState("");
    const [clientEmail, setClientEmail] = React.useState("");
    const [clientPhone, setClientPhone] = React.useState("");
    const [notes, setNotes] = React.useState("");

    // Queries
    const realtors = useQuery(api.realtors.list);
    const selectedRealtorData = useQuery(
        api.realtors.getById,
        selectedRealtor ? { id: selectedRealtor } : "skip"
    );

    const blockedSlots = useQuery(
        api.blockedSlots.getByRealtorAndDateRange,
        selectedRealtor && selectedDate
            ? {
                realtorId: selectedRealtor,
                startDate: format(selectedDate, "yyyy-MM-dd"),
                endDate: format(addDays(selectedDate, 1), "yyyy-MM-dd"),
            }
            : "skip"
    );

    const existingMeetings = useQuery(
        api.tours.getByRealtorAndDate,
        selectedRealtor && selectedDate
            ? {
                realtorId: selectedRealtor,
                date: format(selectedDate, "yyyy-MM-dd"),
            }
            : "skip"
    );

    // Mutations
    const scheduleMeeting = useMutation(api.tours.schedule);

    const handleScheduleMeeting = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedRealtor || !selectedDate || !selectedTime) return;

        try {
            const endTime = format(
                new Date(`2000-01-01T${selectedTime}:00`).getTime() + 30 * 60 * 1000,
                "HH:mm"
            );

            await scheduleMeeting({
                realtorId: selectedRealtor,
                clientName,
                clientEmail,
                clientPhone,
                date: format(selectedDate, "yyyy-MM-dd"),
                startTime: selectedTime,
                endTime,
                notes: notes || undefined,
            });

            // Reset form
            setClientName("");
            setClientEmail("");
            setClientPhone("");
            setNotes("");
            setSelectedTime(null);
            setIsDialogOpen(false);

            alert("Meeting scheduled successfully!");
        } catch (error) {
            alert("Failed to schedule meeting. Please try again.");
            console.error(error);
        }
    };

    const isDateDisabled = (date: Date) => {
        if (!selectedRealtorData) return true;

        const dayOfWeek = date.getDay();
        const isWorkingDay = selectedRealtorData.realtor.workingDays.includes(dayOfWeek);
        const isPastDate = date < startOfDay(new Date());

        return !isWorkingDay || isPastDate;
    };

    const isDayCompletelyBlocked = (date: Date) => {
        if (!blockedSlots) return false;

        const dateStr = format(date, "yyyy-MM-dd");
        return blockedSlots.some(
            (slot) => slot.date === dateStr && (!slot.startTime || !slot.endTime)
        );
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Schedule a Meeting</h1>
                <p className="text-muted-foreground">
                    Book a consultation with one of our experienced realtors
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Realtor Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Select Realtor
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Select
                            value={selectedRealtor || ""}
                            onValueChange={(value) => {
                                setSelectedRealtor(value as Id<"realtors">);
                                setSelectedDate(new Date());
                                setSelectedTime(null);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a realtor" />
                            </SelectTrigger>
                            <SelectContent>
                                {realtors?.map((realtor) => (
                                    <SelectItem key={realtor.realtor._id} value={realtor.realtor._id}>
                                        {realtor?.user?.name ?? "Unknown Realtor" }
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {selectedRealtorData && (
                            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                                <p>📧 {selectedRealtorData.user?.email}</p>
                                <p>📞 {selectedRealtorData.user?.phone}</p>
                                <p>
                                    🕒 {selectedRealtorData.realtor.workingHours.start} - {selectedRealtorData.realtor.workingHours.end}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Date Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarDays className="h-5 w-5" />
                            Select Date
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => {
                                setSelectedDate(date);
                                setSelectedTime(null);
                            }}
                            disabled={(date) =>
                                isDateDisabled(date) || isDayCompletelyBlocked(date)
                            }
                            className="rounded-md border"
                        />
                    </CardContent>
                </Card>

                {/* Time Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Select Time
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {selectedRealtorData && selectedDate ? (
                            <TimeSlotPicker
                                workingHours={selectedRealtorData.realtor.workingHours}
                                selectedDate={format(selectedDate, "yyyy-MM-dd")}
                                blockedSlots={blockedSlots || []}
                                existingMeetings={existingMeetings || []}
                                selectedTime={selectedTime}
                                onTimeSelect={setSelectedTime}
                            />
                        ) : (
                            <p className="text-muted-foreground text-center py-8">
                                Please select a realtor and date first
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Booking Summary and Form */}
            {selectedRealtor && selectedDate && selectedTime && (
                <Card>
                    <CardHeader>
                        <CardTitle>Booking Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                            <div>
                                <p className="font-medium">Realtor</p>
                                <p className="text-muted-foreground">{selectedRealtorData?.user?.name}</p>
                            </div>
                            <div>
                                <p className="font-medium">Date</p>
                                <p className="text-muted-foreground">
                                    {format(selectedDate, "EEEE, MMMM d, yyyy")}
                                </p>
                            </div>
                            <div>
                                <p className="font-medium">Time</p>
                                <p className="text-muted-foreground">
                                    {selectedTime} (30 minutes)
                                </p>
                            </div>
                        </div>

                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="w-full" size="lg">
                                    Complete Booking
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Your Information</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleScheduleMeeting} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name *</Label>
                                        <Input
                                            id="name"
                                            value={clientName}
                                            onChange={(e) => setClientName(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={clientEmail}
                                            onChange={(e) => setClientEmail(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number *</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={clientPhone}
                                            onChange={(e) => setClientPhone(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Additional Notes</Label>
                                        <Textarea
                                            id="notes"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Any specific requirements or questions..."
                                        />
                                    </div>

                                    <Button type="submit" className="w-full">
                                        Confirm Meeting
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
