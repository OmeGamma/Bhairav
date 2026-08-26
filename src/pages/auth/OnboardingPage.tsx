import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, LayoutDashboard, Video, Map, 
  Search, Bell, ShieldQuestion, Lock, ArrowRight, ArrowLeft
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { Footer } from '../../components/layout/Footer';

const steps = [
  {
    title: "Welcome to Bhairav",
    description: "You are accessing the centralized AI-powered Defence & Security Intelligence platform. This system fuses multi-domain intelligence into a unified command view.",
    icon: Shield
  },
  {
    title: "Command Center",
    description: "Your primary dashboard. Monitor high-level security activity, critical alerts, and intelligence updates in real-time.",
    icon: LayoutDashboard
  },
  {
    title: "Security Monitoring",
    description: "Access and monitor live and simulated video feeds with AI-assisted anomaly detection and event tracking.",
    icon: Video
  },
  {
    title: "Geospatial Maps",
    description: "Visualize security events, monitored zones, and intelligence assets across dynamic geographic layers.",
    icon: Map
  },
  {
    title: "Intelligence Search",
    description: "A universal search interface allowing you to cross-reference entities, events, vehicles, and personnel.",
    icon: Search
  },
  {
    title: "Attention Center",
    description: "Centralized hub for all alerts requiring human review, ranging from critical security events to welfare follow-ups.",
    icon: Bell
  },
  {
    title: "Ask Bhairav",
    description: "Interact with the AI assistant for complex intelligence queries, network analysis, and voice-activated operations.",
    icon: ShieldQuestion
  },
  {
    title: "Security Protocol",
    description: "Reminder: All activity on this platform is monitored and logged. Ensure operational security and privacy compliance at all times.",
    icon: Lock
  }
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      navigate('/login');
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const handleSkip = () => {
    navigate('/login');
  };

  const StepIcon = steps[currentStep].icon;

  return (
    <div className="min-h-screen bg-[var(--color-bhairav-bg)] flex flex-col relative">
      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10">
        
        <div className="w-full max-w-2xl bg-[var(--color-bhairav-surface)] border border-[var(--color-bhairav-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          
          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-[var(--color-bhairav-bg)] flex">
            {steps.map((_, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "h-full flex-1 transition-all duration-300",
                  idx <= currentStep ? "bg-[var(--color-bhairav-primary)]" : "bg-transparent",
                  idx < steps.length - 1 ? "border-r border-[var(--color-bhairav-bg)]" : ""
                )}
              />
            ))}
          </div>

          <div className="p-10 flex flex-col items-center text-center">
            
            <div className="w-20 h-20 rounded-full bg-[var(--color-bhairav-primary)]/10 flex items-center justify-center mb-8 border border-[var(--color-bhairav-primary)]/20 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
              <StepIcon className="text-[var(--color-bhairav-primary)]" size={40} />
            </div>
            
            <h2 className="text-3xl font-bold mb-4">{steps[currentStep].title}</h2>
            <p className="text-[var(--color-bhairav-text-muted)] text-lg max-w-lg leading-relaxed h-20">
              {steps[currentStep].description}
            </p>
            
          </div>
          
          <div className="p-6 border-t border-[var(--color-bhairav-border)] bg-[var(--color-bhairav-bg)]/50 flex items-center justify-between">
            <button 
              onClick={handleSkip}
              className="text-sm font-medium text-[var(--color-bhairav-text-muted)] hover:text-white transition-colors px-4 py-2"
            >
              Skip Onboarding
            </button>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handleBack}
                disabled={currentStep === 0}
                className="p-2.5 rounded-md border border-[var(--color-bhairav-border)] text-[var(--color-bhairav-text)] hover:bg-[var(--color-bhairav-surface-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={20} />
              </button>
              
              <button 
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 rounded-md bg-[var(--color-bhairav-primary)] hover:bg-[var(--color-bhairav-primary-hover)] text-white font-medium transition-colors"
              >
                {currentStep === steps.length - 1 ? "Finish" : "Next"}
                {currentStep < steps.length - 1 && <ArrowRight size={18} />}
              </button>
            </div>
          </div>
          
        </div>
      </div>
      
      <div className="absolute bottom-0 w-full z-0">
        <Footer />
      </div>
    </div>
  );
}
