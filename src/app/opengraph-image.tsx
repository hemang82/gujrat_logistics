import { ImageResponse } from 'next/og';

export const alt = 'Trust Logistic — Transport Management Software for India';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #06262A 0%, #0A4F4A 65%, #0F766E 100%)',
          padding: '64px 72px',
          color: '#FFFFFF',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top Row: Brand Mark & Domain Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div
              style={{
                width: '58px',
                height: '58px',
                borderRadius: '14px',
                backgroundColor: '#F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#06262A',
                fontSize: '34px',
                fontWeight: 900,
              }}
            >
              T
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontSize: '30px',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  color: '#FFFFFF',
                }}
              >
                TRUST LOGISTIC
              </span>
              <span
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  color: '#2DD4BF',
                }}
              >
                TRANSPORT MANAGEMENT SOFTWARE · INDIA
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              padding: '10px 22px',
              borderRadius: '9999px',
              border: '1px solid rgba(45, 212, 191, 0.35)',
              backgroundColor: 'rgba(6, 38, 42, 0.55)',
              fontSize: '18px',
              fontWeight: 700,
              color: '#2DD4BF',
            }}
          >
            trustlogistic.in
          </div>
        </div>

        {/* Center Brand Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '980px' }}>
          <div
            style={{
              fontSize: '60px',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: '#FFFFFF',
              display: 'flex',
            }}
          >
            Transport operations, unified from LR to GST billing.
          </div>
          <div
            style={{
              fontSize: '25px',
              lineHeight: 1.4,
              color: 'rgba(255, 255, 255, 0.85)',
              display: 'flex',
            }}
          >
            Built for Indian transporters, fleet owners and transport brokers across daily dispatch, compliance and branch accounts.
          </div>
        </div>

        {/* Bottom Module Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {[
            'LR / Bilty',
            'Lorry Challan & Crossing',
            'GSP E-Way Bill',
            'Fleet & Drivers',
            'Accounts & GST Billing',
          ].map((label) => (
            <div
              key={label}
              style={{
                display: 'flex',
                padding: '10px 20px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                fontSize: '18px',
                fontWeight: 700,
                color: '#FFFFFF',
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
