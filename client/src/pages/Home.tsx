import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, Clock, Calendar, Mic } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { data: tasks = [] } = trpc.tasks.list.useQuery(undefined, {
    enabled: isAuthenticated,
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

  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const inProgressTasks = tasks.filter(t => t.status === "in-progress").length;
  const pendingTasks = tasks.filter(t => t.status === "pending").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-slate-900/50 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Daily Productivity Hub</h1>
            <p className="text-slate-400 text-sm">Manage your tasks and schedule efficiently</p>
          </div>
          <Button
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
            onClick={() => navigate("/tasks")}
          >
            Go to Tasks
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-white mb-2">
            Welcome back, <span className="text-blue-400">{user?.name || "User"}</span>! 👋
          </h2>
          <p className="text-slate-400 text-lg">
            Here's your productivity overview for today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {/* Total Tasks */}
          <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">Total Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{tasks.length}</div>
              <p className="text-xs text-slate-500 mt-1">
                {tasks.length === 0 ? "No tasks yet" : `${tasks.length} task${tasks.length !== 1 ? "s" : ""}`}
              </p>
            </CardContent>
          </Card>

          {/* Pending Tasks */}
          <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-400">{pendingTasks}</div>
              <p className="text-xs text-slate-500 mt-1">Waiting to start</p>
            </CardContent>
          </Card>

          {/* In Progress */}
          <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-blue-500" />
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">{inProgressTasks}</div>
              <p className="text-xs text-slate-500 mt-1">Currently working on</p>
            </CardContent>
          </Card>

          {/* Completed */}
          <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">{completedTasks}</div>
              <p className="text-xs text-slate-500 mt-1">Great job!</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-slate-900 border-slate-800 hover:border-blue-700/50 transition-all cursor-pointer group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white group-hover:text-blue-400 transition-colors">
                <CheckCircle2 className="w-5 h-5" />
                Manage Tasks
              </CardTitle>
              <CardDescription>Add, edit, and track your tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate("/tasks")}
              >
                Go to Tasks
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 hover:border-blue-700/50 transition-all cursor-pointer group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white group-hover:text-blue-400 transition-colors">
                <Calendar className="w-5 h-5" />
                View Calendar
              </CardTitle>
              <CardDescription>See your tasks in calendar view</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate("/calendar")}
              >
                Open Calendar
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 hover:border-blue-700/50 transition-all cursor-pointer group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white group-hover:text-blue-400 transition-colors">
                <Mic className="w-5 h-5" />
                Quick Add
              </CardTitle>
              <CardDescription>Add tasks using voice input</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate("/tasks")}
              >
                Use Voice
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
