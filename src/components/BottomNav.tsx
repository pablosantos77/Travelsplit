import React, { useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

type Tab = 'trips' | 'payments' | 'insights' | 'settings';

interface BottomNavProps {
  currentTab: Tab;
  onChange: (tab: Tab) => void;
}

const NAV_ITEMS: { tab: Tab; icon: string; labelKey: keyof ReturnType<typeof useLanguage>['t']['nav'] }[] = [
  { tab: 'trips',    icon: 'explore',   labelKey: 'trips'    },
  { tab: 'payments', icon: 'payments',  labelKey: 'payments' },
  { tab: 'insights', icon: 'insights',  labelKey: 'insights' },
  { tab: 'settings', icon: 'settings',  labelKey: 'settings' },
];

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onChange }) => {
  const { t } = useLanguage();
  const labels = t.nav;

  const activeIndex = NAV_ITEMS.findIndex(i => i.tab === currentTab);

  const textRefs  = useRef<(HTMLElement | null)[]>([]);
  const itemRefs  = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const update = () => {
      const btn  = itemRefs.current[activeIndex];
      const text = textRefs.current[activeIndex];
      if (btn && text) {
        btn.style.setProperty('--lineWidth', `${text.offsetWidth}px`);
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [activeIndex]);

  return (
    <nav
      className="bottom-nav"
      role="navigation"
      style={{ '--component-active-color': '#004ccc' } as React.CSSProperties}
    >
      {NAV_ITEMS.map(({ tab, icon, labelKey }, index) => {
        const isActive = index === activeIndex;
        return (
          <button
            key={tab}
            ref={el => (itemRefs.current[index] = el)}
            className={`bottom-nav__item${isActive ? ' active' : ''}`}
            onClick={() => onChange(tab)}
            style={{ '--lineWidth': '0px' } as React.CSSProperties}
          >
            <div className="bottom-nav__icon">
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {icon}
              </span>
            </div>
            <strong
              ref={el => (textRefs.current[index] = el)}
              className={`bottom-nav__text${isActive ? ' active' : ''}`}
            >
              {labels[labelKey]}
            </strong>
          </button>
        );
      })}
    </nav>
  );
};
