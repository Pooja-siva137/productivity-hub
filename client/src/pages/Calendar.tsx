import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2, ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";

export default function Calendar() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");

  const { data: tasks = [] } = trpc.tasks.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: calendarEvents = [], refetch: refetchEvents } = trpc.calendar.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createEventMutation = trpc.calendar.create.useMutation({
    onSuccess: () => {
      refetchEvents();
      setEventTitle("");
      setEventDescription("");
      setIsOpen(false);
      toast.success("Event created successfully!");
    },
    onError: () => {
      toast.error("Failed to create event");
    },
  });

  const deleteEventMutation = trpc.calendar.delete.useMutation({
    onSuccess: () => {
      refetchEvents();
      toast.success("Event deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete event");
    },
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get tasks for selected date
  const selectedDateTasks = selectedDate
    ? tasks.filter((task) => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        return isSameDay(taskDate, selectedDate);
      })
    : [];

  // Get events for selected date
  const selectedDateEvents = selectedDate
    ? calendarEvents.filter((event) => {
        const eventDate = new Date(event.startDate);
        return isSameDay(eventDate, selectedDate);
      })
    : [];

  const handleAddEvent = () => {
    if (!selectedDate || !eventTitle.trim()) {
      toast.error("Please select a date and enter event title");
      return;
    }

    createEventMutation.mutate({
      title: eventTitle.trim(),
      description: eventDescription.trim() || undefined,
      startDate: selectedDate,
      endDate: selectedDate,
    });
  };

  const handleDeleteEvent = (eventId: number) => {
    if (confirm("Are you sure you want to delete this event?")) {
      deleteEventMutation.mutate({ id: eventId });
    }
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return isSameDay(taskDate, date);
    }).length;
  };

  const getEventsForDate = (date: Date) => {
    return calendarEvents.filter((event) => {
      const eventDate = new Date(event.startDate);
      return isSameDay(eventDate, date);
    }).length;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-400";
      case "medium":
        return "bg-orange-500/20 text-orange-400";
      default:
        return "bg-green-500/20 text-green-400";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400";
      case "in-progress":
        return "bg-blue-500/20 text-blue-400";
      default:
        return "bg-yellow-500/20 text-yellow-400";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-slate-900/50 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Calendar</h1>
            <p className="text-slate-400 text-sm">View your tasks and events</p>
          </div>
          <Button
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
            onClick={() => navigate("/")}
          >
            Back to Home
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="md:col-span-2">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="text-slate-400 hover:text-white"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <h2 className="text-xl font-bold text-white">
                    {format(currentMonth, "MMMM yyyy")}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="text-slate-400 hover:text-white"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-center text-sm font-semibold text-slate-400 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {daysInMonth.map((date) => {
                    const isCurrentMonth = isSameMonth(date, currentMonth);
                    const isSelected = selectedDate && isSameDay(date, selectedDate);
                    const taskCount = getTasksForDate(date);
                    const eventCount = getEventsForDate(date);

                    return (
                      <button
                        key={date.toString()}
                        onClick={() => setSelectedDate(date)}
                        className={`aspect-square p-2 rounded-lg border transition-all ${
                          isSelected
                            ? "bg-blue-600 border-blue-500"
                            : isCurrentMonth
                              ? "bg-slate-800 border-slate-700 hover:border-slate-600"
                              : "bg-slate-900 border-slate-800 opacity-50"
                        }`}
                      >
                        <div className="text-sm font-semibold text-white">
                          {format(date, "d")}
                        </div>
                        {(taskCount > 0 || eventCount > 0) && (
                          <div className="text-xs text-slate-300 mt-1">
                            {taskCount > 0 && <div>📋 {taskCount}</div>}
                            {eventCount > 0 && <div>📅 {eventCount}</div>}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Selected Date Details */}
          <div className="space-y-6">
            {selectedDate && (
              <>
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white">
                      {format(selectedDate, "EEEE, MMMM d, yyyy")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Event
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-900 border-slate-800">
                        <DialogHeader>
                          <DialogTitle className="text-white">Add Event</DialogTitle>
                          <DialogDescription className="text-slate-400">
                            {format(selectedDate, "MMMM d, yyyy")}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">
                              Event Title
                            </label>
                            <Input
                              placeholder="Enter event title..."
                              value={eventTitle}
                              onChange={(e) => setEventTitle(e.target.value)}
                              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">
                              Description (Optional)
                            </label>
                            <Input
                              placeholder="Enter event description..."
                              value={eventDescription}
                              onChange={(e) => setEventDescription(e.target.value)}
                              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                            />
                          </div>
                          <Button
                            onClick={handleAddEvent}
                            disabled={createEventMutation.isPending}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            {createEventMutation.isPending && (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            )}
                            Add Event
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>

                {/* Tasks for selected date */}
                {selectedDateTasks.length > 0 && (
                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-white text-sm">Tasks ({selectedDateTasks.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {selectedDateTasks.map((task) => (
                        <div key={task.id} className="p-2 bg-slate-800 rounded border border-slate-700">
                          <p className="text-sm text-white font-medium">{task.title}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge className={`${getPriorityColor(task.priority)} text-xs`}>
                              {task.priority}
                            </Badge>
                            <Badge className={`${getStatusColor(task.status)} text-xs`}>
                              {task.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Events for selected date */}
                {selectedDateEvents.length > 0 && (
                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-white text-sm">Events ({selectedDateEvents.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {selectedDateEvents.map((event) => (
                        <div key={event.id} className="p-2 bg-slate-800 rounded border border-slate-700 flex justify-between items-start gap-2">
                          <div className="flex-1">
                            <p className="text-sm text-white font-medium">{event.title}</p>
                            {event.description && (
                              <p className="text-xs text-slate-400 mt-1">{event.description}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="text-slate-400 hover:text-red-400 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
