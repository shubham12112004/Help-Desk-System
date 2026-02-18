import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  ChevronDown,
  Hospital,
  Heart,
  Users,
  Clock,
  Shield,
  Zap,
  Calendar,
  Search,
  ArrowRight,
  Check,
  MessageCircle,
  TrendingUp,
  Award,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import Footer from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const handleGetStarted = () => {
    // If user is already logged in, go to dashboard
    if (user) {
      console.log("User already authenticated, navigating to dashboard");
      navigate("/dashboard");
    } else {
      console.log("User not authenticated, navigating to sign-up/sign-in");
      navigate("/auth");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/auth?issue=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Statistics
  const stats = [
    { label: "Active Patients", value: "15,000+", icon: Users, color: "text-blue-500" },
    { label: "Support Tickets", value: "2,500+", icon: Heart, color: "text-red-500" },
    { label: "Staff Members", value: "500+", icon: Award, color: "text-yellow-500" },
    { label: "Avg Response Time", value: "2 hours", icon: Clock, color: "text-green-500" },
  ];

  // Services
  const services = [
    {
      icon: Calendar,
      title: "Appointment Booking",
      description: "Schedule appointments with doctors through our online portal",
      color: "from-blue-500/20 to-blue-500/5",
    },
    {
      icon: MessageCircle,
      title: "Patient Support",
      description: "Chat with healthcare professionals about your concerns",
      color: "from-purple-500/20 to-purple-500/5",
    },
    {
      icon: Zap,
      title: "Quick Services",
      description: "Fast-track access to emergency and urgent care services",
      color: "from-orange-500/20 to-orange-500/5",
    },
    {
      icon: Shield,
      title: "Prescription Management",
      description: "Manage and refill prescriptions securely online",
      color: "from-green-500/20 to-green-500/5",
    },
    {
      icon: TrendingUp,
      title: "Health Records",
      description: "Access your complete medical history and test results",
      color: "from-pink-500/20 to-pink-500/5",
    },
    {
      icon: Users,
      title: "Specialists",
      description: "Connect with specialized medical departments and experts",
      color: "from-indigo-500/20 to-indigo-500/5",
    },
  ];

  // Departments
  const departments = [
    {
      name: "Emergency",
      emoji: "🚨",
      description: "24/7 emergency care",
      specialists: "50+ Doctors",
    },
    {
      name: "Cardiology",
      emoji: "❤️",
      description: "Heart & vascular care",
      specialists: "15+ Cardiologists",
    },
    {
      name: "Pediatrics",
      emoji: "👶",
      description: "Child health care",
      specialists: "25+ Pediatricians",
    },
    {
      name: "Orthopedics",
      emoji: "🦴",
      description: "Bone & joint specialist",
      specialists: "18+ Surgeons",
    },
    {
      name: "General Surgery",
      emoji: "🏥",
      description: "Surgical procedures",
      specialists: "30+ Surgeons",
    },
    {
      name: "Neurology",
      emoji: "🧠",
      description: "Nervous system care",
      specialists: "12+ Neurologists",
    },
  ];

  // FAQs
  const faqs = [
    {
      question: "How do I create a support ticket?",
      answer:
        "Simply click 'Get Started' above and log in with your hospital account. Then use the 'Create Ticket' button to describe your issue, select a department, and set the priority. Our team will respond within 2-4 hours.",
    },
    {
      question: "What are the support ticket response times?",
      answer:
        "Response times vary by priority: Low (24-48 hours), Medium (8-12 hours), High (4-6 hours), and Urgent (30 minutes). Emergency issues go directly to our support team.",
    },
    {
      question: "Can I attach documents to my ticket?",
      answer:
        "Yes! You can attach images, PDFs, documents, and other files up to 10MB per file. This helps our team understand your issue better.",
    },
    {
      question: "How do I track my ticket status?",
      answer:
        "Log in to your dashboard and go to 'My Tickets' to see real-time updates on all your tickets. You'll also receive notifications when your ticket status changes.",
    },
    {
      question: "Can I chat with support staff directly?",
      answer:
        "Yes! Use our AI-powered chatbot for instant help, or initiate a chat with support staff for complex issues. Average chat response time is 5 minutes.",
    },
    {
      question: "Is my information secure?",
      answer:
        "Absolutely. We use enterprise-grade encryption (HIPAA-compliant) to protect all your personal and medical information. Your privacy is our top priority.",
    },
  ];

  // Features highlight
  const features = [
    { icon: Zap, text: "Instant Ticket Creation" },
    { icon: Clock, text: "Real-time Status Updates" },
    { icon: Users, text: "Expert Support Team" },
    { icon: Shield, text: "Secure & Encrypted" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70">
                <Hospital className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">MedDesk</h1>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button
                type="button"
                onClick={handleGetStarted}
                variant="default"
                size="sm"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background py-20 sm:py-32">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Heart className="h-6 w-6" />
              </div>
              <span className="inline-block text-sm font-semibold text-primary">
                Hospital Support Portal
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
              Your Health, Our Priority
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Professional hospital support management system. Create tickets, track appointments, connect with specialists, and get instant assistance.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12">
              <form
                onSubmit={handleSearch}
                className="flex gap-2 rounded-full bg-background/50 backdrop-blur border border-border/40 p-2 focus-within:border-primary/50 transition-colors"
              >
                <div className="flex-1 flex items-center gap-2 px-4">
                  <Search className="h-5 w-5 text-muted-foreground" />
                  <input
                    placeholder="Describe your issue or search departments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium flex items-center gap-2 text-sm"
                >
                  Search <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button
                type="button"
                onClick={handleGetStarted}
                size="lg"
                className="gap-2 px-8"
              >
                Create Support Ticket <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2 px-8"
                onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
              >
                Learn More <ChevronDown className="h-5 w-5" />
              </Button>
            </div>

            {/* Features Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/30 border border-border/40 hover:border-primary/50 transition-colors"
                  >
                    <Icon className="h-6 w-6 text-primary" />
                    <p className="text-xs sm:text-sm font-medium text-foreground text-center">
                      {feature.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-12 sm:py-16 bg-muted/30 border-y border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                      <Icon className={cn("h-6 w-6", stat.color)} />
                    </div>
                  </div>
                  <p className={cn("text-2xl sm:text-3xl font-bold", stat.color)}>
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Our Services
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive hospital support services designed to meet your healthcare needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card
                  key={index}
                  className="group relative overflow-hidden border border-border/40 hover:border-primary/50 transition-all hover:shadow-lg p-6"
                >
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity",
                      service.color
                    )}
                  />
                  <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">
                      {service.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {service.description}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section className="py-16 sm:py-20 bg-muted/20 border-y border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Hospital Departments
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Specialized medical departments with expert healthcare professionals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept, index) => (
              <button
                key={index}
                type="button"
                onClick={handleGetStarted}
                className="p-6 rounded-lg border border-border/40 bg-card hover:border-primary/50 hover:bg-primary/5 transition-all hover:shadow-md group text-left"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{dept.emoji}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">
                  {dept.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {dept.description}
                </p>
                <p className="text-xs font-medium text-primary">
                  {dept.specialists}
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Quick answers to common questions about our support system
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`faq-${index}`}
                className="border border-border/40 rounded-lg px-4"
              >
                <AccordionTrigger className="hover:text-primary transition-colors">
                  <span className="text-left font-semibold text-foreground">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-2">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-primary/10 to-primary/5 border-y border-border/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Get Help?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create a support ticket in minutes and let our expert team assist you with your healthcare needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              type="button"
              onClick={handleGetStarted}
              size="lg"
              className="gap-2"
            >
              Get Started Now <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="gap-2"
              onClick={() =>
                window.open("mailto:support@hospital.com")
              }
            >
              Contact Support <Mail className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Landing;
