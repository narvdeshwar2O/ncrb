
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { SidebarLayout } from "./components/layouts/SidebarLayout";
import Dashboard from "./pages/Dashboard";
import CCTNSPage from "./pages/CCTNSPage";
import NCRCPage from "./pages/NCRCPage";
import NotFound from "./pages/NotFound";
import TotalFIRsDetail from "./pages/details/TotalFIRsDetail";
import ResolutionRateDetail from "./pages/details/ResolutionRateDetail";
import PendingCasesDetail from "./pages/details/PendingCasesDetail";
import ResolutionTimeDetail from "./pages/details/ResolutionTimeDetail";
import CrimeHotspotsDetail from "./pages/details/CrimeHotspotsDetail";
import RepeatOffendersDetail from "./pages/details/RepeatOffendersDetail";
import PatternMatchDetail from "./pages/details/PatternMatchDetail";
import MOAnalysisDetail from "./pages/details/MOAnalysisDetail";
import FirstResponseTimeDetail from "./pages/details/FirstResponseTimeDetail";
import InvestigationQualityDetail from "./pages/details/InvestigationQualityDetail";
import CourtSuccessRateDetail from "./pages/details/CourtSuccessRateDetail";
import ResourceUtilizationDetail from "./pages/details/ResourceUtilizationDetail";
import DigitalEvidenceDetail from "./pages/details/DigitalEvidenceDetail";
import ForensicTATDetail from "./pages/details/ForensicTATDetail";
import PublicSafetyIndexDetail from "./pages/details/PublicSafetyIndexDetail";
import ComplianceScoreDetail from "./pages/details/ComplianceScoreDetail";
// NCRC Detail Pages
import TotalVerificationsDetail from "./pages/details/ncrc/TotalVerificationsDetail";
import SuccessRateDetail from "./pages/details/ncrc/SuccessRateDetail";
import PendingRequestsDetail from "./pages/details/ncrc/PendingRequestsDetail";
import ProcessingTimeDetail from "./pages/details/ncrc/ProcessingTimeDetail";
import DataAccuracyDetail from "./pages/details/ncrc/DataAccuracyDetail";
import SourceReliabilityDetail from "./pages/details/ncrc/SourceReliabilityDetail";
import CrossReferenceDetail from "./pages/details/ncrc/CrossReferenceDetail";
import FalsePositivesDetail from "./pages/details/ncrc/FalsePositivesDetail";
import CustomerSatisfactionDetail from "./pages/details/ncrc/CustomerSatisfactionDetail";
import CompletionRateDetail from "./pages/details/ncrc/CompletionRateDetail";
import SLAComplianceDetail from "./pages/details/ncrc/SLAComplianceDetail";
import AbandonmentRateDetail from "./pages/details/ncrc/AbandonmentRateDetail";
import FraudDetectionDetail from "./pages/details/ncrc/FraudDetectionDetail";
import NCRCComplianceScoreDetail from "./pages/details/ncrc/NCRCComplianceScoreDetail";
import HighRiskCasesDetail from "./pages/details/ncrc/HighRiskCasesDetail";
import AuditTrailDetail from "./pages/details/ncrc/AuditTrailDetail";
import Agency from "./pages/Agency/Agency";
import SlipCapture from "./pages/SlipCapture/SlipCapture";
import MesaTP from "./pages/mesatp/MesaTP";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarLayout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Agency />} />
              <Route path="/slipcapture" element={<SlipCapture />} />
              <Route path="/mesa" element={<MesaTP />} />
              <Route path="/cctns" element={<CCTNSPage />} />
              <Route path="/ncrc" element={<NCRCPage />} />
              {/* CCTNS Detail Routes */}
              <Route path="/details/total-firs" element={<TotalFIRsDetail />} />
              <Route path="/details/resolution-rate" element={<ResolutionRateDetail />} />
              <Route path="/details/pending-cases" element={<PendingCasesDetail />} />
              <Route path="/details/resolution-time" element={<ResolutionTimeDetail />} />
              <Route path="/details/crime-hotspots" element={<CrimeHotspotsDetail />} />
              <Route path="/details/repeat-offenders" element={<RepeatOffendersDetail />} />
              <Route path="/details/pattern-match" element={<PatternMatchDetail />} />
              <Route path="/details/mo-analysis" element={<MOAnalysisDetail />} />
              <Route path="/details/first-response-time" element={<FirstResponseTimeDetail />} />
              <Route path="/details/investigation-quality" element={<InvestigationQualityDetail />} />
              <Route path="/details/court-success-rate" element={<CourtSuccessRateDetail />} />
              <Route path="/details/resource-utilization" element={<ResourceUtilizationDetail />} />
              <Route path="/details/digital-evidence" element={<DigitalEvidenceDetail />} />
              <Route path="/details/forensic-tat" element={<ForensicTATDetail />} />
              <Route path="/details/public-safety-index" element={<PublicSafetyIndexDetail />} />
              <Route path="/details/compliance-score" element={<ComplianceScoreDetail />} />
              {/* NCRC Detail Routes */}
              <Route path="/details/ncrc/total-verifications" element={<TotalVerificationsDetail />} />
              <Route path="/details/ncrc/success-rate" element={<SuccessRateDetail />} />
              <Route path="/details/ncrc/pending-requests" element={<PendingRequestsDetail />} />
              <Route path="/details/ncrc/processing-time" element={<ProcessingTimeDetail />} />
              <Route path="/details/ncrc/data-accuracy" element={<DataAccuracyDetail />} />
              <Route path="/details/ncrc/source-reliability" element={<SourceReliabilityDetail />} />
              <Route path="/details/ncrc/cross-reference" element={<CrossReferenceDetail />} />
              <Route path="/details/ncrc/false-positives" element={<FalsePositivesDetail />} />
              <Route path="/details/ncrc/customer-satisfaction" element={<CustomerSatisfactionDetail />} />
              <Route path="/details/ncrc/completion-rate" element={<CompletionRateDetail />} />
              <Route path="/details/ncrc/sla-compliance" element={<SLAComplianceDetail />} />
              <Route path="/details/ncrc/abandonment-rate" element={<AbandonmentRateDetail />} />
              <Route path="/details/ncrc/fraud-detection" element={<FraudDetectionDetail />} />
              <Route path="/details/ncrc/compliance-score" element={<NCRCComplianceScoreDetail />} />
              <Route path="/details/ncrc/high-risk-cases" element={<HighRiskCasesDetail />} />
              <Route path="/details/ncrc/audit-trail" element={<AuditTrailDetail />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SidebarLayout>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
