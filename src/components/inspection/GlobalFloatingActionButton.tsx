
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, ClipboardList, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function GlobalFloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Hide on inspection execution pages
  if (location.pathname.includes('/inspections/') && location.pathname.includes('/view')) {
    return null;
  }

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleCreateChecklist = () => {
    navigate('/new-checklists/create');
    setIsOpen(false);
  };

  const handleStartInspection = () => {
    navigate('/inspections/new');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="absolute bottom-16 right-0 flex flex-col gap-2 items-end z-50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2">
                <span className="bg-white text-sm font-medium px-3 py-2 rounded-md shadow-md">
                  Criar Checklist
                </span>
                <Button 
                  size="icon" 
                  className="bg-green-600 hover:bg-green-700 h-12 w-12 rounded-full shadow-lg"
                  onClick={handleCreateChecklist}
                >
                  <ClipboardList className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="bg-white text-sm font-medium px-3 py-2 rounded-md shadow-md">
                  Iniciar Inspeção
                </span>
                <Button 
                  size="icon" 
                  className="bg-blue-600 hover:bg-blue-700 h-12 w-12 rounded-full shadow-lg"
                  onClick={handleStartInspection}
                >
                  <ClipboardCheck className="h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      <Button 
        size="icon"
        className={cn(
          "h-14 w-14 rounded-full shadow-lg transition-colors",
          isOpen ? "bg-red-600 hover:bg-red-700" : "bg-primary hover:bg-primary/90"
        )}
        onClick={handleToggle}
      >
        <Plus 
          className={cn(
            "h-6 w-6 transition-transform", 
            isOpen && "rotate-45"
          )} 
        />
      </Button>
    </div>
  );
}
