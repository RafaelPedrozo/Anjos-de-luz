"use client";

import { Card } from "@/components/ui";
import { ConfiguracoesLayout } from "./ConfiguracoesLayout";
import { ConfiguracoesUsuariosPage } from "./ConfiguracoesUsuariosPage";

export function ConfiguracoesUsuariosWrapper() {
  return (
    <ConfiguracoesLayout>
      <ConfiguracoesUsuariosPage />
    </ConfiguracoesLayout>
  );
}

interface StaticSectionProps {
  title: string;
  description: string;
  fields: { label: string; value: string }[];
}

export function ConfiguracoesStaticSection({ title, description, fields }: StaticSectionProps) {
  return (
    <ConfiguracoesLayout>
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">{description}</p>
        <div className="mt-6 flex flex-col gap-3">
          {fields.map((field) => (
            <div
              key={field.label}
              className="flex items-center justify-between rounded-[10px] bg-[var(--color-list-item)] px-4 py-3.5"
            >
              <span className="text-sm text-[var(--color-text-secondary)]">{field.label}</span>
              <span className="text-sm font-medium text-white">{field.value}</span>
            </div>
          ))}
        </div>
      </Card>
    </ConfiguracoesLayout>
  );
}
