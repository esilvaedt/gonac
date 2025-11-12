"use client";

import { useEffect, useState } from "react";
import WizardPlanPrescriptivo, { DatosOportunidad } from "@/components/plan-wizard/WizardPlanPrescriptivo";

export default function WizardPlanPage() {
  const [oportunidad, setOportunidad] = useState<DatosOportunidad | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Leer datos de la oportunidad desde sessionStorage
    const oportunidadData = sessionStorage.getItem('oportunidadWizard');
    if (oportunidadData) {
      try {
        const parsed = JSON.parse(oportunidadData);
        setOportunidad(parsed);
      } catch (error) {
        console.error('Error parsing oportunidad data:', error);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <WizardPlanPrescriptivo oportunidad={oportunidad} />;
}

