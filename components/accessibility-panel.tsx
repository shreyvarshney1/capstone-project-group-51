"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Settings,
  Eye,
  Type,
  Volume2,
  Contrast,
  X,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";

export interface AccessibilitySettings {
  highContrast: boolean;
  fontSize: "normal" | "large" | "extra-large";
  reducedMotion: boolean;
  screenReaderOptimized: boolean;
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  fontSize: "normal",
  reducedMotion: false,
  screenReaderOptimized: false,
};

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (updates: Partial<AccessibilitySettings>) => void;
  resetSettings: () => void;
}

const AccessibilityContext = createContext<
  AccessibilityContextType | undefined
>(undefined);

export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] =
    useState<AccessibilitySettings>(defaultSettings);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Load saved settings
    const saved = localStorage.getItem("accessibility_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...defaultSettings, ...parsed });
      } catch {
        // Invalid JSON, use defaults
      }
    }

    // Check system preferences
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (!saved) {
      setSettings((prev) => ({
        ...prev,
        reducedMotion: prefersReducedMotion,
      }));
    }
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Apply settings to document
    const html = document.documentElement;

    // High contrast
    if (settings.highContrast) {
      html.classList.add("high-contrast");
    } else {
      html.classList.remove("high-contrast");
    }

    // Font size
    html.classList.remove("font-normal", "font-large", "font-extra-large");
    html.classList.add(`font-${settings.fontSize}`);

    // Reduced motion
    if (settings.reducedMotion) {
      html.classList.add("reduce-motion");
    } else {
      html.classList.remove("reduce-motion");
    }

    // Screen reader optimizations
    if (settings.screenReaderOptimized) {
      html.setAttribute("aria-live", "polite");
    } else {
      html.removeAttribute("aria-live");
    }

    // Save to localStorage
    localStorage.setItem("accessibility_settings", JSON.stringify(settings));
  }, [settings, isClient]);

  const updateSettings = (updates: Partial<AccessibilitySettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem("accessibility_settings");
  };

  return (
    <AccessibilityContext.Provider
      value={{ settings, updateSettings, resetSettings }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error(
      "useAccessibility must be used within an AccessibilityProvider",
    );
  }
  return context;
}

interface AccessibilityPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccessibilityPanel({
  isOpen,
  onClose,
}: AccessibilityPanelProps) {
  const { settings, updateSettings, resetSettings } = useAccessibility();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen) return null;
  if (!mounted) return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[1999]"
        onClick={onClose}
        aria-hidden="true"
      />
      <Card
        className="fixed right-4 top-20 w-80 z-[2000] shadow-xl"
        role="dialog"
        aria-label="Accessibility Settings"
      >
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Accessibility Settings
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Dark Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {resolvedTheme === "dark" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
              <Label htmlFor="dark-mode">Dark Mode</Label>
            </div>
            <Button
              id="dark-mode"
              variant={resolvedTheme === "dark" ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              aria-pressed={resolvedTheme === "dark"}
            >
              {resolvedTheme === "dark" ? "On" : "Off"}
            </Button>
          </div>

          {/* High Contrast */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Contrast className="h-4 w-4" />
              <Label htmlFor="high-contrast">High Contrast</Label>
            </div>
            <Button
              id="high-contrast"
              variant={settings.highContrast ? "default" : "outline"}
              size="sm"
              onClick={() =>
                updateSettings({ highContrast: !settings.highContrast })
              }
              aria-pressed={settings.highContrast}
            >
              {settings.highContrast ? "On" : "Off"}
            </Button>
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              <Label>Font Size</Label>
            </div>
            <div className="flex gap-2">
              {(["normal", "large", "extra-large"] as const).map((size) => (
                <Button
                  key={size}
                  variant={settings.fontSize === size ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSettings({ fontSize: size })}
                  className="flex-1 capitalize text-xs"
                  aria-pressed={settings.fontSize === size}
                >
                  {size === "extra-large" ? "XL" : size === "large" ? "L" : "A"}
                </Button>
              ))}
            </div>
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <Label htmlFor="reduced-motion">Reduce Motion</Label>
            </div>
            <Button
              id="reduced-motion"
              variant={settings.reducedMotion ? "default" : "outline"}
              size="sm"
              onClick={() =>
                updateSettings({ reducedMotion: !settings.reducedMotion })
              }
              aria-pressed={settings.reducedMotion}
            >
              {settings.reducedMotion ? "On" : "Off"}
            </Button>
          </div>

          {/* Screen Reader */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              <Label htmlFor="screen-reader">Screen Reader Mode</Label>
            </div>
            <Button
              id="screen-reader"
              variant={settings.screenReaderOptimized ? "default" : "outline"}
              size="sm"
              onClick={() =>
                updateSettings({
                  screenReaderOptimized: !settings.screenReaderOptimized,
                })
              }
              aria-pressed={settings.screenReaderOptimized}
            >
              {settings.screenReaderOptimized ? "On" : "Off"}
            </Button>
          </div>

          {/* Reset */}
          <div className="pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetSettings}
              className="w-full text-muted-foreground"
            >
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>
    </>,
    document.body,
  );
}

export function AccessibilityButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        aria-label="Open accessibility settings"
        className="relative"
      >
        <Settings className="h-5 w-5" />
      </Button>
      <AccessibilityPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
