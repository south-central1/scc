import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { RocketIcon } from "./Icons";
import { getUpdateStatus, setUpdateStatus, getCountdownToFriday, formatCountdown } from "@/lib/api";

export function UpdateProgress() {
  const [percentage, setPercentage] = useState(0);
  const [targetPercentage, setTargetPercentage] = useState(89);
  const [countdown, setCountdown] = useState(formatCountdown(getCountdownToFriday()));
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    setUpdateStatus(89);
    setTargetPercentage(89);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(formatCountdown(getCountdownToFriday()));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const animationDuration = 1500;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(easeOut * targetPercentage);
      
      setPercentage(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setAnimationComplete(true);
      }
    };
    
    const timer = setTimeout(() => {
      requestAnimationFrame(animate);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [targetPercentage]);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/30 mb-6 animate-float">
            <RocketIcon className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="text-gaming-red" style={{ textShadow: "0 0 30px rgba(200, 30, 30, 0.5)" }}>
              Next
            </span>{" "}
            <span className="text-foreground">Update</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Track the development progress of our upcoming update
          </p>
        </div>

        <Card
          className="p-8 bg-gradient-to-br from-card via-card to-background border-card-border shadow-3d animate-pop-in"
          style={{ animationDelay: "0.3s" }}
          data-testid="update-progress-card"
        >
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full mb-4">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-foreground">Status: Launching Soon</span>
            </div>
            <div
              className="text-6xl sm:text-7xl font-bold text-primary mb-4"
              style={{
                textShadow: "0 0 40px rgba(0, 117, 255, 0.5), 0 0 80px rgba(0, 117, 255, 0.3)",
              }}
              data-testid="text-countdown"
            >
              {countdown}
            </div>
            <div
              className="text-5xl sm:text-6xl font-bold text-gaming-red"
              style={{
                textShadow: "0 0 40px rgba(200, 30, 30, 0.5), 0 0 80px rgba(200, 30, 30, 0.3)",
              }}
              data-testid="text-percentage"
            >
              {percentage}%
            </div>
          </div>

          <div className="relative mb-6">
            <div className="h-6 rounded-full bg-secondary overflow-hidden border border-border">
              <div
                className={`h-full rounded-full bg-gradient-to-r from-primary via-primary to-blue-400 transition-all duration-100 ${
                  animationComplete ? "animate-glow-pulse" : ""
                }`}
                style={{
                  width: `${percentage}%`,
                  boxShadow: "0 0 20px rgba(0, 117, 255, 0.5)",
                }}
                data-testid="progress-bar"
              />
            </div>
            <div
              className="absolute top-1/2 -translate-y-1/2 text-xs font-bold text-white pointer-events-none"
              style={{ left: `${Math.max(percentage / 2, 10)}%` }}
            >
              {percentage > 10 && `${percentage}%`}
            </div>
          </div>

          <div className="text-center">
            <p className="text-lg text-muted-foreground" data-testid="text-progress-message">
              Release in: <span className="font-bold text-primary">{countdown}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Friday at 8PM - Development at {percentage}%
            </p>
          </div>
        </Card>

        <div
          className="mt-8 grid grid-cols-3 gap-4 animate-fade-in-up"
          style={{ animationDelay: "0.5s" }}
        >
          {[
            { label: "Features", value: "New Content" },
            { label: "Testing", value: "In Progress" },
            { label: "ETA", value: "Soon" },
          ].map((item, index) => (
            <Card
              key={item.label}
              className="p-4 text-center bg-card border-card-border"
              style={{ animationDelay: `${0.6 + index * 0.1}s` }}
            >
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                {item.label}
              </div>
              <div className="font-semibold text-foreground">{item.value}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
