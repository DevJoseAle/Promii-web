import { COLORS } from "@/config/colors";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones - Promii",
  description: "Términos y condiciones generales, política de privacidad y acuerdos de uso de Promii.",
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-xl font-bold mt-10 mb-4"
      style={{ color: COLORS.text.primary }}
    >
      {children}
    </h2>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-base font-semibold mb-2" style={{ color: COLORS.text.primary }}>
        {title}
      </h3>
      <div className="text-sm leading-relaxed space-y-2" style={{ color: COLORS.text.secondary }}>
        {children}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="my-10 h-px" style={{ backgroundColor: COLORS.border.light }} />;
}

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.background.secondary }}>
      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Header */}
        <div
          className="rounded-2xl border p-8 mb-8"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ color: COLORS.text.primary }}
          >
            Términos y Condiciones
          </h1>
          <p className="mt-2 text-sm" style={{ color: COLORS.text.secondary }}>
            Última actualización: Febrero 2026
          </p>
        </div>

        {/* Content */}
        <div
          className="rounded-2xl border p-8"
          style={{
            backgroundColor: COLORS.background.primary,
            borderColor: COLORS.border.light,
          }}
        >
          {/* ===== TÉRMINOS GENERALES ===== */}
          <div
            className="text-xs font-semibold uppercase tracking-wider mb-6"
            style={{ color: COLORS.primary.main }}
          >
            Términos y Condiciones Generales
          </div>

          <SubSection title="1. Naturaleza de la plataforma">
            <p>
              Promii es una plataforma digital de intermediación tecnológica que conecta usuarios, comercios (merchants) e influencers dentro del territorio de la República Bolivariana de Venezuela.
            </p>
            <p>Promii no procesa pagos ni actúa como proveedor directo de productos o servicios.</p>
          </SubSection>

          <SubSection title="2. Registro y uso">
            <p>El uso de la plataforma requiere registro previo.</p>
            <p>Solo pueden registrarse personas mayores de 18 años.</p>
            <p>Al registrarse, el usuario declara que la información proporcionada es veraz y actual.</p>
          </SubSection>

          <SubSection title="3. Roles dentro de Promii">
            <div className="space-y-4">
              <div>
                <p className="font-semibold" style={{ color: COLORS.text.primary }}>Usuarios:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Buscar Promiis</li>
                  <li>Comprar Promiis</li>
                  <li>Canjear códigos directamente con el comercio</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold" style={{ color: COLORS.text.primary }}>Merchants:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Crear, editar y eliminar Promiis</li>
                  <li>Conectar con influencers</li>
                  <li>Gestionar vencimientos</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold" style={{ color: COLORS.text.primary }}>Influencers:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Promocionar Promiis mediante códigos</li>
                  <li>Negociar directamente con merchants</li>
                </ul>
              </div>
            </div>
          </SubSection>

          <SubSection title="4. Pagos y responsabilidad">
            <p>Promii no procesa pagos.</p>
            <p>Todo pago se realiza directamente entre el usuario y el comercio.</p>
            <p>Promii no es responsable por productos, servicios, reembolsos ni disputas.</p>
          </SubSection>

          <SubSection title="5. Propiedad del contenido">
            <p>
              Todo contenido subido a la plataforma pasa a ser propiedad exclusiva de Promii. Promii podrá utilizar dicho contenido para marketing, publicidad y posicionamiento SEO sin limitación territorial ni temporal.
            </p>
          </SubSection>

          <SubSection title="6. Expiración">
            <p>Los Promiis tienen fecha de vencimiento establecida por el merchant.</p>
          </SubSection>

          <SubSection title="7. Limitación de responsabilidad">
            <p>
              Promii actúa exclusivamente como intermediario tecnológico y no garantiza calidad, disponibilidad ni exactitud de las ofertas.
            </p>
          </SubSection>

          <SubSection title="8. Jurisdicción">
            <p>
              Cualquier conflicto será sometido a la jurisdicción de los tribunales competentes de la República Bolivariana de Venezuela.
            </p>
          </SubSection>

          <Divider />

          {/* ===== POLÍTICA DE PRIVACIDAD ===== */}
          <div
            className="text-xs font-semibold uppercase tracking-wider mb-6"
            style={{ color: COLORS.primary.main }}
          >
            Política de Privacidad
          </div>

          <SubSection title="Datos que recopilamos">
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Nombre</li>
              <li>Email</li>
              <li>Teléfono</li>
              <li>Dirección</li>
              <li>Estado y Ciudad</li>
              <li>IP y cookies</li>
            </ul>
          </SubSection>

          <SubSection title="Uso de los datos">
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Registro y autenticación</li>
              <li>Conexión entre usuarios y merchants</li>
              <li>Mejora del servicio</li>
            </ul>
          </SubSection>

          <SubSection title="Seguridad y derechos">
            <p>Promii implementa medidas de seguridad razonables para proteger la información.</p>
            <p>Los usuarios pueden solicitar acceso, rectificación o eliminación de sus datos.</p>
          </SubSection>

          <Divider />

          {/* ===== POLÍTICA DE COOKIES ===== */}
          <div
            className="text-xs font-semibold uppercase tracking-wider mb-6"
            style={{ color: COLORS.primary.main }}
          >
            Política de Cookies
          </div>

          <div className="text-sm leading-relaxed space-y-2 mb-6" style={{ color: COLORS.text.secondary }}>
            <p>Promii utiliza cookies esenciales y analíticas para el correcto funcionamiento del sitio.</p>
            <p>El usuario puede configurar su navegador para rechazarlas.</p>
          </div>

          <Divider />

          {/* ===== ACUERDO MERCHANTS ===== */}
          <div
            className="text-xs font-semibold uppercase tracking-wider mb-6"
            style={{ color: COLORS.primary.main }}
          >
            Acuerdo para Merchants
          </div>

          <div className="text-sm leading-relaxed space-y-2 mb-6" style={{ color: COLORS.text.secondary }}>
            <p>El merchant es responsable absoluto de los productos y servicios ofrecidos.</p>
            <p>Los planes comerciales podrán implicar pagos por publicación.</p>
            <p>Promii no garantiza ventas.</p>
          </div>

          <Divider />

          {/* ===== ACUERDO INFLUENCERS ===== */}
          <div
            className="text-xs font-semibold uppercase tracking-wider mb-6"
            style={{ color: COLORS.primary.main }}
          >
            Acuerdo para Influencers
          </div>

          <div className="text-sm leading-relaxed space-y-2" style={{ color: COLORS.text.secondary }}>
            <p>El influencer negocia directamente con el merchant.</p>
            <p>Promii no garantiza ingresos ni comisiones.</p>
            <p>El uso indebido de códigos podrá implicar suspensión de la cuenta.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
