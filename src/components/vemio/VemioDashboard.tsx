"use client";

import { useState } from "react";
import { vemioMockData } from "@/data/vemio-mock-data";
import VemioHeader from "./VemioHeader";
import VemioTabs from "./VemioTabs";
import AgenticoView from "./views/AgenticoView";
import ResumenView from "./views/ResumenView";
import TiendasView from "./views/TiendasView";
import SKUsView from "./views/SKUsView";
import PriorizacionOportunidadesView from "./views/PriorizacionOportunidadesView";
import AccionesView from "./views/AccionesView";

export type TabType = "agentico" | "resumen" | "tiendas" | "skus" | "oportunidades" | "acciones";

export default function VemioDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("agentico");

  const renderTabContent = () => {
    switch (activeTab) {
      case "agentico":
        return <AgenticoView />;
      case "resumen":
        return <ResumenView data={vemioMockData.resumen} />;
      case "tiendas":
        return <TiendasView data={vemioMockData} />;
      case "skus":
        return <SKUsView data={vemioMockData.skus} />;
      case "oportunidades":
        return <PriorizacionOportunidadesView />;
      case "acciones":
        return <AccionesView data={vemioMockData.acciones} />;
      default:
        return <AgenticoView />;
    }
  };

  return (
    <div className="space-y-6">
      <VemioHeader projectInfo={vemioMockData.projectInfo} />
      <VemioTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="min-h-[600px]">
        {renderTabContent()}
      </div>
    </div>
  );
}