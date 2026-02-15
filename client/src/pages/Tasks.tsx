import { useState, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { toast } from "sonner";

export default function Tasks() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");

  const { data: tasks = [], refetch } = trpc.tasks.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createMutation = trpc.tasks.create.useMutation({
    onSuccess: () => {
      refetch();
      setTitle("");
      setDescription("");
      setPriority("medium");
      setIsOpen(false);
      toast.success("Task created successfully!");
    },
    onError: () => {
      toast.error("Failed to create task");
    },
  });

  const updateMutation = trpc.tasks.update.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Task updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update task");
    },
  });

  const deleteMutation = trpc.tasks.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Task deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete task");
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

  const handleAddTask = () => {
    if (!title.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    createMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      priority: priority as "low" | "medium" | "high",
    });
  };

  const handleStatusChange = (taskId: number, newStatus: "pending" | "in-progress" | "completed") => {
    updateMutation.mutate({
      id: taskId,
      status: newStatus,
    });
  };

  const handleDeleteTask = (taskId: number) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteMutation.mutate({ id: taskId });
    }
  };

  const handleCheckboxChange = (task: any) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    handleStatusChange(task.id, newStatus);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "in-progress":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-slate-900/50 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">My Tasks</h1>
            <p className="text-slate-400 text-sm">Manage and track your daily tasks</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
              onClick={() => navigate("/")}
            >
              Back to Home
            </Button>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-800">
                <DialogHeader>
                  <DialogTitle className="text-white">Add New Task</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Create a new task to manage your productivity
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">
                      Task Title
                    </label>
                    <Input
                      placeholder="Enter task title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">
                      Description (Optional)
                    </label>
                    <Input
                      placeholder="Enter task description..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">
                      Priority
                    </label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="low" className="text-slate-300">Low</SelectItem>
                        <SelectItem value="medium" className="text-slate-300">Medium</SelectItem>
                        <SelectItem value="high" className="text-slate-300">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleAddTask}
                    disabled={createMutation.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Add Task
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {tasks.length === 0 ? (
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No tasks yet</h3>
              <p className="text-slate-400 mb-4">Create your first task to get started</p>
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Task
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {tasks.map((task) => (
              <Card 
                key={task.id} 
                className={`bg-slate-900 border-slate-800 hover:border-slate-700 transition-all ${
                  task.status === "completed" ? "opacity-75" : ""
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    {/* Checkbox and Task Content */}
                    <div className="flex items-start gap-4 flex-1">
                      <input
                        type="checkbox"
                        checked={task.status === "completed"}
                        onChange={() => handleCheckboxChange(task)}
                        className="w-5 h-5 mt-1 cursor-pointer accent-blue-500 rounded"
                      />
                      <div className="flex-1">
                        <h3 
                          className={`text-lg font-semibold ${
                            task.status === "completed" 
                              ? "text-slate-500 line-through" 
                              : "text-white"
                          }`}
                        >
                          {task.title}
                        </h3>
                        {task.description && (
                          <p 
                            className={`text-sm mt-1 ${
                              task.status === "completed" 
                                ? "text-slate-600 line-through" 
                                : "text-slate-400"
                            }`}
                          >
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-3">
                          <Badge className={`${getPriorityColor(task.priority)} border`}>
                            {task.priority}
                          </Badge>
                          <Badge className={`${getStatusColor(task.status)} border`}>
                            {task.status === "completed" ? "✓ Completed" : task.status === "in-progress" ? "In Progress" : "Pending"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Status Selector and Delete Button */}
                    <div className="flex gap-2 items-start">
                      <Select
                        value={task.status}
                        onValueChange={(value) =>
                          handleStatusChange(task.id, value as "pending" | "in-progress" | "completed")
                        }
                      >
                        <SelectTrigger className={`w-40 ${getStatusColor(task.status)} border`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="pending" className="text-slate-300">
                            Pending
                          </SelectItem>
                          <SelectItem value="in-progress" className="text-slate-300">
                            In Progress
                          </SelectItem>
                          <SelectItem value="completed" className="text-slate-300">
                            Completed
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-red-400 hover:bg-slate-800"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
