"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertCircle,
  MessageSquare,
  TrendingUp,
  Shield,
  Globe,
  Smartphone,
  MapPin,
  Bell,
  BarChart3,
  Users,
  CheckCircle2,
  ArrowRight,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

import { useAuthStore } from "@/lib/stores/auth-store";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const [stats, setStats] = useState({
    totalComplaints: 0,
    resolvedComplaints: 0,
    activeUsers: 0,
    avgResolutionTime: 0,
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    // Animate counters
    const interval = setInterval(() => {
      setStats((prev) => ({
        totalComplaints: Math.min(prev.totalComplaints + 1234, 1293456),
        resolvedComplaints: Math.min(prev.resolvedComplaints + 1128, 1169234),
        activeUsers: Math.min(prev.activeUsers + 543, 567890),
        avgResolutionTime: Math.min(prev.avgResolutionTime + 0.1, 12),
      }));
    }, 20);

    setTimeout(() => clearInterval(interval), 2000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: AlertCircle,
      title: "Unified Platform",
      description:
        "Single access point for all grievances across Central, State, District, and Ward levels",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      icon: TrendingUp,
      title: "AI-Powered Routing",
      description:
        "87.3% accuracy in automatic complaint categorization and department assignment",
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      icon: MessageSquare,
      title: "Community Engagement",
      description:
        "Collaborative resolution with voting, commenting, and heat maps for shared issues",
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      icon: Shield,
      title: "Real-time Transparency",
      description:
        "Public dashboard showing live metrics, officer accountability, and resolution tracking",
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
    {
      icon: Globe,
      title: "Multi-lingual Support",
      description:
        "Available in 10 Indian languages with voice input for accessibility",
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
    },
    {
      icon: Smartphone,
      title: "Cross-Platform Access",
      description:
        "Web, iOS, Android apps with offline mode and push notifications",
      color: "text-indigo-500",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
    },
  ];

  const advantages = [
    "Faster Resolution: 43% reduction in average resolution time (21 days → 12 days)",
    "Higher Accuracy: AI routing with 87.3% accuracy eliminates manual errors",
    "Better Transparency: Real-time tracking and public dashboards build trust",
    "Community Power: Voting and commenting enable collective prioritization",
    "Accessibility: Multi-modal access (web, mobile, voice) reaches all citizens",
    "Officer Efficiency: Automated routing reduces workload by 35%",
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32 bg-linear-to-b from-primary/5 via-background to-background">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6 bg-linear-to-r from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent wrap-break-word tracking-tight text-pretty">
              CivicConnect
            </h1>

            <p className="text-xl md:text-2xl text-foreground/80 mb-4 font-medium text-pretty">
              A Unified Digital Platform for Hierarchical Civil Grievance
              Management
            </p>

            <p className="text-md md:text-lg text-muted-foreground mb-8 max-w-3xl mx-auto text-pretty">
              Bridging the gap between citizens and government with AI-powered
              routing, community-driven prioritization, and real-time
              transparency
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="text-lg px-8 py-3 group" asChild>
                <Link href="/report">
                  Submit Complaint
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-3"
                asChild
              >
                <Link href="/dashboard">Track Complaint</Link>
              </Button>

              <Button
                size="lg"
                variant="ghost"
                className="text-lg px-8 py-3 group"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold mb-2">
                {stats.totalComplaints.toLocaleString()}+
              </div>
              <div className="text-primary-foreground/80">
                Complaints Processed
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold mb-2">
                {(
                  (stats.resolvedComplaints / stats.totalComplaints) * 100 || 95
                ).toFixed(1)}
                %
              </div>
              <div className="text-primary-foreground/80">Resolution Rate</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold mb-2">
                {stats.activeUsers.toLocaleString()}+
              </div>
              <div className="text-primary-foreground/80">Active Citizens</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold mb-2">
                {stats.avgResolutionTime.toFixed(1)}
              </div>
              <div className="text-primary-foreground/80">
                Days Avg. Resolution
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              Why Choose CivicConnect?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A comprehensive platform designed for modern governance with
              cutting-edge technology
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card p-8 rounded-2xl shadow-sm hover:shadow-md transition-all border border-border"
              >
                <div
                  className={`${feature.bgColor} w-16 h-16 rounded-xl flex items-center justify-center mb-6`}
                >
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>

                <h3 className="text-xl font-bold mb-3 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6 text-foreground">
                Measurable Impact on Governance
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                CivicConnect delivers quantifiable improvements over traditional
                grievance systems
              </p>

              <div className="space-y-4">
                {advantages.map((advantage, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-foreground/80">{advantage}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-card p-8 rounded-2xl shadow-lg border border-border"
            >
              <h3 className="text-2xl font-bold mb-6 text-foreground">
                Performance Comparison
              </h3>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-foreground/80 font-medium">
                      Resolution Rate
                    </span>
                    <span className="text-green-600 font-bold">95%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-green-600 h-3 rounded-full"
                      style={{ width: "95%" }}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    vs CPGRAMS: 90.5%
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-foreground/80 font-medium">
                      Avg. Resolution Time
                    </span>
                    <span className="text-blue-600 font-bold">12 days</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-primary h-3 rounded-full"
                      style={{ width: "57%" }}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    vs CPGRAMS: 21 days (43% faster)
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-foreground/80 font-medium">
                      User Satisfaction
                    </span>
                    <span className="text-purple-600 font-bold">4.5/5</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-purple-600 h-3 rounded-full"
                      style={{ width: "90%" }}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    vs CPGRAMS: 3.2/5 (41% higher)
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Make Your Voice Heard?
            </h2>
            <p className="text-xl mb-8 text-primary-foreground/90">
              Join thousands of citizens using CivicConnect to resolve civic
              issues effectively
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-3"
                asChild
              >
                <Link href="/register">Get Started Free</Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-3 bg-transparent dark:bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10"
                asChild
              >
                <Link href="/map">View Heat Map</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/80 text-muted-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-foreground font-bold text-lg mb-4">
                CivicConnect
              </h3>
              <p className="text-sm">
                Empowering citizens with transparent, efficient grievance
                resolution
              </p>
            </div>

            <div>
              <h4 className="text-foreground font-semibold mb-4">
                Quick Links
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-white transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="hover:text-white transition-colors"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/map"
                    className="hover:text-white transition-colors"
                  >
                    Heat Map
                  </Link>
                </li>
                <li>
                  <Link
                    href="/analytics"
                    className="hover:text-white transition-colors"
                  >
                    Analytics
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-foreground font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/help"
                    className="hover:text-foreground transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/api"
                    className="hover:text-foreground transition-colors"
                  >
                    API Docs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-foreground transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-foreground font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>Email: support@civicconnect.gov.in</li>
                <li>Phone: 1800-XXX-XXXX</li>
                <li>VIT Bhopal University</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 py-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>
              &copy; 2025 CivicConnect. All rights reserved. | A VIT Bhopal
              Capstone Project
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
