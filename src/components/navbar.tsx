"use client";

import { useEffect, useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { Bell, Menu, X, BookOpen } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [student, setStudent] = useState<any>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchStudent = async () => {
      try {
        const res = await fetch("/api/students/me");
        if (res.ok) {
          const data = await res.json();
          if (!mounted) return;
          // Detect new notification and show toast once
          if (data?.notification && data.notification !== student?.notification) {
            toast.info(data.notification);
          }
          setStudent(data);
        } else {
          console.error("Failed to fetch student:", res.status, res.statusText);
        }
      } catch (error) {
        console.error("Error fetching student:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchStudent();

  // Poll every 3s to pick up notifications pushed by admin actions faster
  const id = setInterval(fetchStudent, 3000);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const handleAccept = async () => {
    if (!student || accepting) return;
    
    setAccepting(true);
    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seatAccepted: true, // Set the boolean field to true
          notification: null,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setStudent(updated);
        setShowNotification(false);
        toast.success('Seat accepted');
      } else {
        let errorData = null;
        try { errorData = await res.json(); } catch (_) { /* ignore */ }
        console.error("Failed to accept seat:", res.status, res.statusText, errorData);
        toast.error(errorData?.error || 'Failed to accept seat');
      }
    } catch (error) {
      console.error("Error accepting seat:", error);
    } finally {
      setAccepting(false);
    }
  };
  const handleReject = async () => {
  if (!student || rejecting) return;
  
  setRejecting(true);
  try {
    const res = await fetch(`/api/students/${student.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        seatAccepted: false, // Set the boolean field to false
        notification: null,
      }),
    });

    if (res.ok) {
      const updated = await res.json();
      setStudent(updated);
      setShowNotification(false);
      toast.success('Seat rejected');
    } else {
      let errorData = null;
      try { errorData = await res.json(); } catch (_) { /* ignore */ }
      console.error("Failed to reject seat:", res.status, res.statusText, errorData);
      toast.error(errorData?.error || 'Failed to reject seat');
    }
  } catch (error) {
    console.error("Error rejecting seat:", error);
  } finally {
    setRejecting(false);
  }
};


  const handleDownloadPDF = async () => {
    if (!student?.offerLetterUrl) return;

    try {
      const response = await fetch(student.offerLetterUrl);
      if (!response.ok) throw new Error("Failed to fetch offer letter");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", "OfferLetter.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading offer letter:", error);
    }
  };

  // Animation variants
  const navbarVariants = {
    hidden: { 
      y: -100, 
      opacity: 0 
    },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 20,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { 
      y: -20, 
      opacity: 0 
    },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 20
      }
    }
  };

  const mobileMenuVariants = {
    hidden: { 
      opacity: 0, 
      height: 0,
      transition: {
        duration: 0.2
      }
    },
    visible: { 
      opacity: 1, 
      height: "auto" as const,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const mobileItemVariants = {
    hidden: { 
      x: -20, 
      opacity: 0 
    },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 20
      }
    }
  };

  const notificationVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8, 
      y: -10 
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 25
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      y: -10,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <motion.header 
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 shadow-sm dark:shadow-lg dark:shadow-black/5"
      variants={navbarVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
        {/* Logo Section */}
        <motion.div 
          className="flex items-center gap-3"
          variants={itemVariants}
        >
          <motion.div 
            className="flex items-center gap-2 cursor-pointer group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative">
              <motion.div 
                className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"
                whileHover={{ 
                  scale: 1.1,
                  boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)"
                }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <BookOpen className="w-4 h-4 text-white" />
                </motion.div>
              </motion.div>
              <motion.div 
                className="absolute -inset-1 bg-linear-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-20"
                whileHover={{ opacity: 0.4 }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <motion.span 
              className="text-xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400"
              whileHover={{ 
                backgroundSize: "200% 100%",
                backgroundPosition: "100% 0%"
              }}
              transition={{ duration: 0.5 }}
            >
              Stream Portal
            </motion.span>
          </motion.div>
        </motion.div>

        {/* Desktop Nav */}
        <motion.nav 
          className="hidden md:flex items-center gap-8 text-sm font-medium"
          variants={itemVariants}
        >
          {[
            { href: "/student/dashboard", label: "Dashboard" },
            { href: "/student/browse", label: "Browse" },
            { href: "/student/help", label: "Help" },
            { href: "/student/payment", label: "Payment" }
          ].map((item, index) => (
            <motion.a
              key={item.href}
              href={item.href}
              className="text-foreground/80 hover:text-foreground transition-colors relative"
              whileHover={{ 
                scale: 1.05,
                color: "#3b82f6"
              }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {item.label}
              <motion.div
                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-linear-to-r from-blue-500 to-purple-600 rounded-full"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.a>
          ))}
        </motion.nav>

        {/* Right Side */}
        <motion.div 
          className="flex items-center gap-3 relative"
          variants={itemVariants}
        >
          {/* Notification */}
          <div className="relative">
            <motion.button
              className="p-2 hover:bg-muted rounded-full transition-all duration-200 relative"
              onClick={() => setShowNotification(!showNotification)}
              whileHover={{ 
                scale: 1.1,
                backgroundColor: "rgba(59, 130, 246, 0.1)"
              }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                whileHover={{ rotate: 15 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Bell className="w-5 h-5 text-muted-foreground" />
              </motion.div>
              {student?.notification && (
                <motion.span 
                  className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                >
                  <motion.span 
                    className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.7, 1]
                    }}
                    transition={{ 
                      repeat: Infinity,
                      duration: 1.5
                    }}
                  />
                </motion.span>
              )}
            </motion.button>

            <AnimatePresence>
              {showNotification && student?.notification && (
                <motion.div
                  className="absolute right-0 mt-2 w-72 p-4 bg-white dark:bg-gray-900 border border-border rounded shadow-lg z-50 space-y-4"
                  variants={notificationVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <motion.p 
                    className="text-sm text-foreground"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {student.notification}
                  </motion.p>

                  {/* Offer Letter Download */}
                  {student.offerLetterUrl && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full hover:bg-linear-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950 dark:hover:to-purple-950 transition-all duration-300"
                        onClick={handleDownloadPDF}
                      >
                        📄 Download Offer Letter
                      </Button>
                    </motion.div>
                  )}

                  {/* Accept Seat: show when seat not decided AND when it's actually a seat/offer notification or a seat is allotted */}
                  {student.seatAccepted == null && (student.seatAllotted || student.offerLetterUrl || /seat|offer/i.test(student.notification || '')) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Button
                        size="sm"
                        className="w-full bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                        onClick={handleAccept}
                        disabled={accepting}
                      >
                        {accepting ? "Accepting..." : "Accept Seat"}
                      </Button>
                      <Button
                        size="sm"
                        className="w-full bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                        onClick={handleReject}
                        disabled={rejecting}
                      >
                        {rejecting ? "Rejecting..." : "Reject Seat"}
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme & User */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ThemeToggle />
          </motion.div>
          
          <motion.div 
            className="ml-1"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 ring-2 ring-border hover:ring-primary/50 transition-all duration-200",
                  userButtonPopoverCard: "bg-background border border-border shadow-lg",
                  userButtonPopoverActions: "bg-background"
                }
              }}
            />
          </motion.div>

          {/* Mobile Menu Toggle */}
          <motion.button
            className="md:hidden p-2 hover:bg-muted rounded-full transition-colors duration-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileHover={{ 
              scale: 1.1,
              backgroundColor: "rgba(59, 130, 246, 0.1)"
            }}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Menu className="w-5 h-5 text-muted-foreground" />
              )}
            </motion.div>
          </motion.button>
        </motion.div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden border-t border-border bg-background/95 backdrop-blur"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div className="container px-4 py-4">
              <nav className="flex flex-col space-y-4">
                {[
                  { href: "/student/dashboard", label: "Dashboard" },
                  { href: "/student/browse", label: "Browse" },
                  { href: "/student/help", label: "Help" },
                  { href: "/student/payment", label: "Payment" }
                ].map((item, index) => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    className="text-foreground/80 hover:text-foreground transition-colors py-2 text-base relative"
                    variants={mobileItemVariants}
                    whileHover={{ 
                      x: 10,
                      color: "#3b82f6"
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.label}
                      <motion.div
                      className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-blue-500 to-purple-600 rounded-full"
                      initial={{ scaleY: 0 }}
                      whileHover={{ scaleY: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.a>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}