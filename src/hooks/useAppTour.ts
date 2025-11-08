// hooks/useAppTour.ts
"use client";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export function useAppTour() {
  const startHomeTour = () => {
    const driverObj = driver({
      showProgress: true,
      showButtons: ["next", "previous", "close"],
      progressText: "{{current}} of {{total}}",
      nextBtnText: "Next →",
      prevBtnText: "← Previous",
      doneBtnText: "Got it!",
      popoverClass: "healthcare-tour-popover",

      onDestroyStarted: () => {
        // Mark tour as completed
        if (typeof window !== "undefined") {
          localStorage.setItem("home-tour-completed", "true");
        }
        driverObj.destroy();
      },

      steps: [
        {
          popover: {
            title: "Welcome to Healthcare TestGen! 👋",
            description:
              "Your AI-powered test generation platform for healthcare applications",
            side: "top",
            align: "center",
          },
        },
        {
          element: ".feature-cards-section",
          popover: {
            title: "Key Features",
            description:
              "Explore key features: HIPAA compliance, AI automation, precise testing, and team collaboration",
            side: "bottom",
            align: "end",
          },
        },
        {
          element: ".step-cards-section",
          popover: {
            title: "Simple 3-Step Process",
            description:
              "How it works: Provide your prompt → AI analyzes → Get comprehensive test cases",
            side: "bottom",
            align: "end",
          },
        },
        {
          element: ".hero-cta-button",
          popover: {
            title: "Ready to Start? 🚀",
            description:
              "Create your first healthcare testing session and experience AI-powered test generation!",
            side: "bottom",
            align: "end",
          },
        },
      ],
    });

    driverObj.drive();
  };

  const startDashboardTour = () => {
    const driverObj = driver({
      showProgress: true,
      showButtons: ["next", "previous", "close"],
      progressText: "{{current}} of {{total}}",
      nextBtnText: "Next →",
      prevBtnText: "← Previous",
      doneBtnText: "Got it!",
      popoverClass: "healthcare-tour-popover",

      onDestroyStarted: () => {
        if (typeof window !== "undefined") {
          localStorage.setItem("dashboard-tour-completed", "true");
        }
        driverObj.destroy();
      },
      steps: [
        {
          element: ".new-session-button",
          popover: {
            title: "Create New Session",
            description:
              "Create new sessions here. Each session represents a healthcare application or module.",
            side: "bottom",
            align: "end",
          },
        },
        {
          element: ".stats-cards-row",
          popover: {
            title: "Session Statistics",
            description:
              "Track your testing progress across all sessions at a glance",
            side: "bottom",
            align: "center",
          },
        },
        {
          element: ".search-bar",
          popover: {
            title: "Quick Search",
            description: "Search through your healthcare applications quickly",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: ".sessions-grid > div:first-child",
          popover: {
            title: "Your Sessions",
            description:
              "Each card shows project name, status, and last activity. Click to open the workflow.",
            side: "top",
            align: "center",
          },
        },
      ],
    });

    driverObj.drive();
  };

  return { startHomeTour, startDashboardTour };
}
