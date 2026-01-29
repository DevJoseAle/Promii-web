export default function InfluencerRequestsPage() {
  return (
    <div>
      <div>
        <h1 className="text-xl font-bold text-text-primary">Solicitudes de influencers</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Aquí verás solicitudes para afiliarse a tu negocio.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-background p-4">
          <div className="text-sm font-semibold text-text-primary">Pendientes</div>
          <div className="mt-2 text-3xl font-bold text-primary">0</div>
          <div className="mt-1 text-xs text-text-secondary">Por revisar</div>
        </div>

        <div className="rounded-2xl border border-border bg-background p-4">
          <div className="text-sm font-semibold text-text-primary">Aprobadas</div>
          <div className="mt-2 text-3xl font-bold">0</div>
          <div className="mt-1 text-xs text-text-secondary">Este mes</div>
        </div>

        <div className="rounded-2xl border border-border bg-background p-4">
          <div className="text-sm font-semibold text-text-primary">Rechazadas</div>
          <div className="mt-2 text-3xl font-bold">0</div>
          <div className="mt-1 text-xs text-text-secondary">Este mes</div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-background p-4">
        <div className="text-sm font-semibold text-text-primary">Listado</div>
        <div className="mt-2 text-sm text-text-secondary">
          Aquí irá la tabla/lista de solicitudes.
        </div>
      </div>
    </div>
  );
}
