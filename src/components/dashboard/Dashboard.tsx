import React, { useState, useEffect } from "react";
import DashboardHeader from "./DashboardHeader";
import Sidebar from "./Sidebar";
import PricingSection from "./PricingSection";
import ApiStatus from "./ApiStatus";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState("home");
  const { user } = useAuth();
  const [apiConnections, setApiConnections] = useState([]);

  // Handle route changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove the # symbol
      setCurrentPage(hash || "home");
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange(); // Initial check

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Fetch API connections
  useEffect(() => {
    if (user) {
      const fetchApiConnections = async () => {
        const { data, error } = await supabase
          .from("api_connections")
          .select("*")
          .eq("user_id", user.id);

        if (!error && data) {
          setApiConnections(data);
        }
      };

      fetchApiConnections();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          {currentPage === "pricing" && <PricingSection />}
          {currentPage === "home" && (
            <div className="w-full">
              <div className="p-6 bg-card rounded-lg border border-border mb-6">
                <h2 className="text-2xl font-bold mb-2">
                  Welcome to Dashboard, {user?.username}
                </h2>
                <p className="text-muted-foreground">
                  Manage your trading accounts and monitor your performance
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ApiStatus
                  connectedApis={apiConnections.map((api) => ({
                    name: api.app_name,
                    broker: api.broker,
                    status: api.is_active ? "live" : "inactive",
                  }))}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
