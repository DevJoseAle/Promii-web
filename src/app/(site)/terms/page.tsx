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

          <Divider />

          {/* ===== PROMII RED - PROGRAMA DE REFERIDOS ===== */}
          <div
            className="text-xs font-semibold uppercase tracking-wider mb-6"
            style={{ color: COLORS.primary.main }}
          >
            Promii Red - Programa de Referidos
          </div>

          <SubSection title="1. Descripción del programa">
            <p>
              Promii Red es el programa de referidos oficial de Promii que permite a usuarios e influencers registrados ganar recompensas económicas por referir nuevos comercios a la plataforma.
            </p>
            <p>
              La participación en este programa es completamente voluntaria y está sujeta a los términos aquí establecidos.
            </p>
          </SubSection>

          <SubSection title="2. Elegibilidad">
            <p>Pueden participar en Promii Red:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Usuarios registrados con perfil activo en Promii</li>
              <li>Influencers con perfil aprobado y activo en Promii</li>
              <li>Personas mayores de 18 años residentes en Venezuela</li>
            </ul>
            <p className="mt-2">
              Promii se reserva el derecho de verificar la identidad y elegibilidad de cualquier participante antes de procesar pagos.
            </p>
          </SubSection>

          <SubSection title="3. Funcionamiento del programa">
            <p>
              Cada participante elegible recibe un código de referido único con formato RU-XXXX (usuarios) o RI-XXXX (influencers) que puede compartir con comercios interesados en registrarse en Promii.
            </p>
            <p>
              Cuando un comercio se registra utilizando un código de referido válido, se establece un vínculo de referencia que permite el seguimiento de las recompensas.
            </p>
          </SubSection>

          <SubSection title="4. Estructura de recompensas">
            <div className="space-y-3">
              <div>
                <p className="font-semibold" style={{ color: COLORS.text.primary }}>Recompensa base ($5 USD):</p>
                <p>Se paga cuando el comercio referido alcanza el estado &quot;Activado&quot;, que requiere:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Registro completado</li>
                  <li>Solicitud aprobada por Promii</li>
                  <li>Primer pago mensual realizado</li>
                  <li>Mantenimiento de cuenta activa por 30 días consecutivos</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mt-3" style={{ color: COLORS.text.primary }}>Bono adicional ($5 USD):</p>
                <p>Se paga cuando el comercio referido mantiene su cuenta activa por 90 días consecutivos (3 meses) después de la activación inicial.</p>
              </div>
              <div>
                <p className="mt-3 font-semibold" style={{ color: COLORS.text.primary }}>Total potencial por referido: $10 USD</p>
              </div>
            </div>
          </SubSection>

          <SubSection title="5. Condiciones para el pago de recompensas">
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Las recompensas se calculan en dólares estadounidenses (USD)</li>
              <li>Los pagos se realizan exclusivamente mediante transferencia bancaria en Venezuela</li>
              <li>Todos los pagos son procesados de forma manual por el equipo de Promii</li>
              <li>El participante debe proporcionar datos bancarios válidos y actualizados</li>
              <li>Los pagos se procesan en ciclos mensuales</li>
              <li>Promii se reserva el derecho de retener pagos en caso de sospecha de fraude o incumplimiento</li>
            </ul>
          </SubSection>

          <SubSection title="6. Validación y prevención de fraude">
            <p>Promii implementa medidas de validación para garantizar la legitimidad de las referencias:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Cada comercio solo puede ser referido una vez</li>
              <li>Los códigos de referido son únicos e intransferibles</li>
              <li>Se verificará la autenticidad de los comercios registrados</li>
              <li>El uso de técnicas fraudulentas (creación de cuentas falsas, auto-referidos, etc.) resultará en la suspensión permanente de la cuenta y pérdida de todas las recompensas pendientes</li>
              <li>Promii puede solicitar documentación adicional para verificar cualquier referencia</li>
            </ul>
          </SubSection>

          <SubSection title="7. Exclusiones y limitaciones">
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>No se pagarán recompensas por comercios que no cumplan los requisitos de activación</li>
              <li>Si un comercio referido cancela su cuenta antes de completar los períodos requeridos, no se generarán recompensas</li>
              <li>No hay límite en la cantidad de referidos que un participante puede realizar</li>
              <li>Las recompensas no son acumulables con otros programas de incentivos salvo indicación expresa de Promii</li>
            </ul>
          </SubSection>

          <SubSection title="8. Modificaciones al programa">
            <p>
              Promii se reserva el derecho de modificar, suspender o cancelar el programa Promii Red en cualquier momento sin previo aviso.
            </p>
            <p>
              Las recompensas ya ganadas y pendientes de pago serán honradas bajo los términos vigentes al momento de su generación.
            </p>
          </SubSection>

          <SubSection title="9. Terminación y suspensión">
            <p>Promii puede suspender o terminar la participación de cualquier usuario en Promii Red si:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Se detecta actividad fraudulenta o sospechosa</li>
              <li>Se incumplen estos términos y condiciones</li>
              <li>Se viola cualquier otro término de uso de la plataforma Promii</li>
              <li>El participante solicita la eliminación de su cuenta</li>
            </ul>
            <p className="mt-2">
              En caso de terminación por violación de términos, todas las recompensas pendientes serán forfeitadas.
            </p>
          </SubSection>

          <SubSection title="10. Aspectos fiscales">
            <p>
              El participante es responsable de cumplir con todas las obligaciones fiscales aplicables en Venezuela relacionadas con los ingresos recibidos a través de Promii Red.
            </p>
            <p>
              Promii no retiene impuestos ni emite comprobantes fiscales. El participante debe consultar con un asesor fiscal según corresponda.
            </p>
          </SubSection>

          <SubSection title="11. Contacto y soporte">
            <p>
              Para consultas sobre Promii Red, el participante puede contactar al equipo de soporte de Promii a través de los canales oficiales de comunicación publicados en la plataforma.
            </p>
          </SubSection>
        </div>
      </div>
    </div>
  );
}
