import { useEffect, useState, useRef } from 'react';

interface Section {
  id: string;
  label: string;
}

interface FormProgressIndicatorProps {
  sections: Section[];
}

export function FormProgressIndicator({ sections }: FormProgressIndicatorProps) {
  const [activeSection, setActiveSection] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            const index = sections.findIndex((s) => s.id === sectionId);
            if (index !== -1) {
              setActiveSection(index);
            }
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: '-100px 0px -50% 0px',
      }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element && observerRef.current) {
        observerRef.current.observe(element);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [sections]);

  return (
    <div className="sticky top-16 z-10 bg-white border-b border-gray-200 shadow-sm mb-6 -mx-4 px-4 py-3 md:relative md:top-0 md:shadow-none md:border-0 md:mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-500">
          Step {activeSection + 1} of {sections.length}
        </span>
        <span className="text-xs font-medium text-blue-600">
          {sections[activeSection]?.label}
        </span>
      </div>
      <div className="flex gap-1">
        {sections.map((section, index) => (
          <div
            key={section.id}
            className={`h-1 rounded-full flex-1 transition-all duration-300 ${
              index <= activeSection
                ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
