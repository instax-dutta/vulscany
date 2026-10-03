import { ImageResponse } from 'next/og';
import { SITE_CONFIG } from '@/config/site';

export const alt = 'vulscany - local-first AI code security scanning';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '80px',
                    background: 'linear-gradient(135deg, #0B1220 0%, #050A12 60%, #04121A 100%)',
                    color: '#E6F7FF',
                    fontFamily: 'sans-serif',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                    <svg width="120" height="120" viewBox="0 0 512 512" fill="none">
                        <defs>
                            <linearGradient id="g" x1="72" y1="72" x2="440" y2="440" gradientUnits="userSpaceOnUse">
                                <stop offset="0" stopColor="#00D4FF" />
                                <stop offset="1" stopColor="#00FFC8" />
                            </linearGradient>
                        </defs>
                        <g stroke="url(#g)" strokeWidth="22" strokeLinecap="round" fill="none">
                            <path d="M72 152V92a20 20 0 0 1 20-20h60" />
                            <path d="M440 152V92a20 20 0 0 0-20-20h-60" />
                            <path d="M72 360v60a20 20 0 0 0 20 20h60" />
                            <path d="M440 360v60a20 20 0 0 1-20 20h-60" />
                        </g>
                        <path
                            d="M256 150c32 28 64 39 88 41v71c0 54-34 96-88 124-54-28-88-70-88-124v-71c24-2 56-13 88-41Z"
                            stroke="url(#g)"
                            strokeWidth="24"
                            strokeLinejoin="round"
                            fill="none"
                        />
                        <path
                            d="M204 264l32 34 74-86"
                            stroke="url(#g)"
                            strokeWidth="26"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                        />
                    </svg>
                    <div style={{ display: 'flex', fontSize: 84, fontWeight: 700, letterSpacing: -2 }}>
                        vulscany
                    </div>
                </div>

                <div style={{ display: 'flex', marginTop: 44, fontSize: 40, fontWeight: 600, color: '#9FE8FF' }}>
                    Local-first AI code security scanning
                </div>
                <div style={{ display: 'flex', marginTop: 22, fontSize: 28, color: '#8FA9B8', lineHeight: 1.4 }}>
                    Pattern prefilter. Adversarial revalidation. Verified fixes. SARIF for CI.
                </div>
                <div style={{ display: 'flex', marginTop: 20, fontSize: 24, color: '#6E8794' }}>
                    Your source code never leaves your machine.
                </div>
            </div>
        ),
        size
    );
}