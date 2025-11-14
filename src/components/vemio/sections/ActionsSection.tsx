/**
 * Actions Section Component
 */

import { useState } from 'react';
import ActionCard from '../cards/ActionCard';
import WizardAccionesGenerales from '../modals/WizardAccionesGenerales';
import type { Action } from '@/types/tiendas.types';

interface ActionsSectionProps {
  actions: Action[];
}

export default function ActionsSection({ actions }: ActionsSectionProps) {
  const [wizardAbierto, setWizardAbierto] = useState(false);
  const [accionSeleccionada, setAccionSeleccionada] = useState<Action | null>(null);

  const handleAbrirWizard = (accion: Action) => {
    setAccionSeleccionada(accion);
    setWizardAbierto(true);
  };

  const handleCerrarWizard = () => {
    setWizardAbierto(false);
    setAccionSeleccionada(null);
  };

  const handleCompletarWizard = (datos: unknown) => {
    console.log("Plan de acción completado:", datos);
    // Additional logic: show notification, refresh data, etc.
  };

  return (
    <>
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Acciones Recomendadas a Nivel General
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {actions.map((accion) => (
            <ActionCard
              key={accion.id}
              title={accion.title}
              tiendas={accion.tiendas}
              tipo={accion.tipo}
              description={accion.description}
              icon={accion.icon}
              onClick={() => handleAbrirWizard(accion)}
            />
          ))}
        </div>
      </div>

      {/* Wizard Modal */}
      {wizardAbierto && accionSeleccionada && (
        <WizardAccionesGenerales
          accionInfo={accionSeleccionada}
          onClose={handleCerrarWizard}
          onComplete={handleCompletarWizard}
        />
      )}
    </>
  );
}

