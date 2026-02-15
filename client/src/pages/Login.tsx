import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { CheckCircle2, Clock, Calendar, Zap } from "lucide-react";

export default function Login() {
  const loginUrl = getLoginUrl();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left side - Features */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Daily Productivity Hub
              </h1>
              <p className="text-lg text-slate-400">
                Manage your tasks, reminders, and schedule all in one place
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <CheckCircle2 className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Smart Task Management</h3>
                  <p className="text-slate-400 text-sm">
                    Create, track, and organize your tasks with status updates
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <Zap className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Voice Input</h3>
                  <p className="text-slate-400 text-sm">
                    Add tasks using voice-to-text for hands-free productivity
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <Clock className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Daily Reminders</h3>
                  <p className="text-slate-400 text-sm">
                    Get notified about important tasks at the right time
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <Calendar className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Integrated Calendar</h3>
                  <p className="text-slate-400 text-sm">
                    View all your tasks and events in a beautiful calendar view
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Login Card */}
          <div className="flex justify-center">
            <Card className="w-full max-w-sm bg-slate-900 border-slate-800 shadow-2xl">
              <CardHeader className="space-y-2">
                <CardTitle className="text-2xl text-white">Welcome</CardTitle>
                <CardDescription className="text-slate-400">
                  Sign in to start managing your productivity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => window.location.href = loginUrl}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base font-semibold rounded-lg transition-all duration-200"
                >
                  Sign in with Manus
                </Button>
                <p className="text-xs text-slate-500 text-center">
                  Secure login powered by Manus OAuth
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
