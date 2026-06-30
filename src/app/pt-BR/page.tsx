import type { Metadata } from "next";
import { getBilingualAlternates, getCanonicalUrl } from "@/lib/seo/canonical";
import { siteConfig } from "@/config/site";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Section } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionEyebrow } from "@/components/public/section-eyebrow";
import { GradientTitle } from "@/components/public/gradient-title";
import { PremiumCard } from "@/components/public/premium-card";
import { BlueprintGridBackground } from "@/components/public/blueprint-grid-background";

export const metadata: Metadata = {
  title: {
    absolute: "Arkanum — Software sob Medida e Automação para Empresas",
  },
  description:
    "Projetamos sistemas operacionais sob medida para organizar processos, conectar áreas e fazer evoluir a operação da sua empresa.",
  openGraph: {
    title: "Arkanum — Software sob Medida e Automação para Empresas",
    description:
      "Projetamos sistemas operacionais sob medida para organizar processos, conectar áreas e fazer evoluir a operação da sua empresa.",
    url: `${siteConfig.url}/pt-BR`,
    locale: "pt_BR",
    type: "website",
  },
  alternates: {
    canonical: getCanonicalUrl("/pt-BR"),
    languages: getBilingualAlternates("/", "/pt-BR"),
  },
};

// ─── Dados estáticos ───────────────────────────────────────────────────────

const problems = [
  {
    title: "Excel fora de controle",
    description:
      "Planilhas difíceis de manter, dados duplicados e fórmulas que ninguém quer tocar.",
  },
  {
    title: "Pedidos pelo WhatsApp",
    description:
      "Informações dispersas, mensagens perdidas e pouca rastreabilidade do que aconteceu.",
  },
  {
    title: "Estoque sem controle",
    description:
      "Diferenças entre o que foi vendido, o disponível e o registrado no sistema.",
  },
  {
    title: "Relatórios manuais",
    description:
      "Horas perdidas montando relatórios que deveriam ser gerados automaticamente.",
  },
  {
    title: "Sistemas desconectados",
    description:
      "Ferramentas que não se comunicam e obrigam a cadastrar as mesmas informações mais de uma vez.",
  },
  {
    title: "Equipes sem app operacional",
    description:
      "Pessoal em campo, depósito ou entrega sem uma ferramenta clara para registrar atividade.",
  },
];

const pillars = [
  {
    name: "Arkanum Core",
    explanation:
      "Plataformas operacionais para centralizar processos, dados, equipes e decisões.",
    value: "Ver e controlar a operação a partir de um só lugar.",
    accent: "text-cyan-400",
    dot: "bg-cyan-400",
  },
  {
    name: "Arkanum Flow",
    explanation:
      "Automação e integração entre áreas, sistemas, APIs e tarefas repetitivas.",
    value: "Fazer os sistemas trabalharem entre si.",
    accent: "text-indigo-400",
    dot: "bg-indigo-400",
  },
  {
    name: "Arkanum Agents",
    explanation:
      "Agentes IA conectados a dados, regras e operações reais do seu negócio.",
    value: "Pedir ações inteligentes a uma IA que entende sua operação.",
    accent: "text-violet-400",
    dot: "bg-violet-400",
  },
  {
    name: "Arkanum Hardware Layer",
    explanation:
      "Software conectado a sensores, dispositivos, terminais e processos físicos.",
    value: "Conectar o mundo físico com o sistema.",
    accent: "text-emerald-400",
    dot: "bg-emerald-400",
  },
] as const;

const cases = [
  "Controle de estoque e pedidos",
  "Rastreamento de entregas",
  "Registro de visitas ou tarefas em campo",
  "Painel de administração interno",
  "Conciliação de vendas e pagamentos",
  "Relatórios automáticos para diretoria",
  "Modernização de sistemas antigos",
  "Centralização de informações dispersas",
];

const steps = [
  {
    number: "01",
    title: "Diagnóstico",
    description:
      "Mapeamos como funciona o processo hoje, quais ferramentas são usadas e onde se perdem tempo, dados ou controle.",
  },
  {
    number: "02",
    title: "Design da solução",
    description:
      "Definimos o que convém automatizar, o que deve ser integrado e qual é o escopo mínimo para gerar valor.",
  },
  {
    number: "03",
    title: "MVP funcional",
    description:
      "Construímos uma primeira versão utilizável, focada em resolver o problema principal sem superdimensionar o projeto.",
  },
  {
    number: "04",
    title: "Implementação",
    description:
      "Acompanhamos a entrada em operação, ajustes iniciais e adoção pela equipe.",
  },
  {
    number: "05",
    title: "Melhoria contínua",
    description:
      "Evoluímos a solução conforme o uso real, novas necessidades e o crescimento da empresa.",
  },
];

const trustPoints = [
  {
    title: "Arquitetura limpa e modular",
    description:
      "Código organizado, separado por responsabilidades e fácil de manter ou ampliar.",
  },
  {
    title: "Bancos de dados projetados com critério",
    description:
      "Estrutura pensada para a operação real, não para o exemplo do tutorial.",
  },
  {
    title: "Controle de acesso e segurança desde o início",
    description:
      "Papéis, permissões e validações aplicados desde o primeiro dia, não como um patch posterior.",
  },
  {
    title: "Integrações encapsuladas",
    description:
      "Cada serviço externo está isolado. Mudar um fornecedor não obriga a reescrever o sistema.",
  },
  {
    title: "Documentação técnica e funcional",
    description: "O sistema fica documentado para que qualquer desenvolvedor possa retomá-lo.",
  },
  {
    title: "Preparado para evolução futura",
    description:
      "A solução pode crescer junto com sua empresa sem precisar ser reconstruída do zero.",
  },
];

// ─── Página ────────────────────────────────────────────────────────────────

export default function PtBRHomePage() {
  return (
    <>
      <SiteHeader locale="pt-BR" />
      <main>

        {/* Hero */}
        <section className="relative overflow-hidden px-6 pb-24 pt-20 md:pt-32">
          <BlueprintGridBackground />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[700px] -translate-x-1/2 rounded-full bg-cyan-400/5 blur-3xl"
          />
          <div className="relative mx-auto max-w-4xl">
            <SectionEyebrow className="reveal">
              Arkanum Studio — sistemas sob medida para sua operação
            </SectionEyebrow>
            <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-slate-50 reveal reveal-1 md:text-6xl">
              Sua empresa cresceu.
              <br className="hidden md:block" /> Seus sistemas, não.
            </h1>
            <p className="mb-10 max-w-2xl text-lg leading-relaxed text-slate-400 reveal reveal-2">
              Arkanum projeta e constrói sistemas operacionais sob medida para organizar processos,
              conectar áreas e fazer evoluir sua operação.
            </p>
            <div className="flex flex-col gap-4 reveal reveal-3 sm:flex-row">
              <Button
                href="/pt-BR/diagnostico"
                variant="primary"
                className="px-8 py-3.5 text-sm"
              >
                Diagnosticar meu processo sem custo
              </Button>
              <Button
                href="#capacidades"
                variant="secondary"
                className="px-8 py-3.5 text-sm"
              >
                Ver capacidades
              </Button>
            </div>
            <p className="mt-6 text-xs text-slate-500 reveal reveal-4">
              Primeiro entendemos sua operação. Depois definimos se uma solução sob medida faz
              sentido.
            </p>
          </div>
        </section>

        {/* Problemas */}
        <Section id="problemas" className="bg-slate-950">
          <div className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold leading-snug text-slate-50 reveal md:text-3xl">
              Quando a operação cresce, as ferramentas improvisadas começam a falhar.
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-slate-400 reveal reveal-1">
              Excel, WhatsApp e sistemas antigos podem funcionar no início. Mas quando aumentam os
              pedidos, o estoque, a equipe ou a administração, começam os erros, a sobrecarga e
              a falta de controle.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {problems.map((p) => (
              <Card key={p.title}>
                <h3 className="mb-2 text-sm font-semibold text-slate-100">{p.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{p.description}</p>
              </Card>
            ))}
          </div>
        </Section>

        {/* Como trabalhamos — Arkanum Studio */}
        <Section id="como-trabalhamos" className="relative overflow-hidden bg-slate-950">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-64 -top-32 h-80 w-80 rounded-full bg-cyan-400/5 blur-3xl"
          />
          <div className="relative mx-auto max-w-3xl">
            <SectionEyebrow>Como trabalhamos</SectionEyebrow>
            <GradientTitle
              as="h2"
              className="mb-6 text-2xl font-semibold leading-snug reveal md:text-3xl"
            >
              Um sistema projetado para sua operação. Não um template adaptado.
            </GradientTitle>
            <div className="space-y-4 text-base leading-relaxed text-slate-400 reveal reveal-1">
              <p>
                Na{" "}
                <span className="font-medium text-slate-200">Arkanum Studio</span>{" "}
                projetamos soluções sob medida combinando software, automação, IA e integração
                física conforme o problema real da sua empresa.
              </p>
              <p>
                Nem toda solução precisa de inteligência artificial. Alguns sistemas devem parecer
                inteligentes porque a arquitetura, a automação e o design operacional estão bem
                resolvidos. A IA entra só quando agrega valor real: contexto, velocidade,
                raciocínio ou execução dentro do processo.
              </p>
              <p>
                Você pode começar com um módulo focado e evoluir para uma plataforma conectada,
                automatizada e inteligente.
              </p>
            </div>
            <PremiumCard className="mt-8 reveal reveal-2">
              <p className="text-sm italic leading-relaxed text-slate-300">
                &ldquo;Primeiro arquitetura. Depois automação. Depois IA, quando realmente
                incrementa o valor operacional.&rdquo;
              </p>
            </PremiumCard>
          </div>
        </Section>

        {/* Pilares */}
        <Section id="capacidades" className="bg-slate-900/40">
          <div className="mb-12">
            <SectionEyebrow>Capacidades combináveis</SectionEyebrow>
            <GradientTitle
              as="h2"
              className="mb-4 text-2xl font-semibold leading-snug md:text-3xl"
            >
              Um módulo focado hoje. Uma plataforma conectada amanhã.
            </GradientTitle>
            <p className="max-w-2xl text-base leading-relaxed text-slate-400">
              Arkanum Studio combina estas capacidades conforme o que sua operação precisa.
              Não é um catálogo de planos: projetamos a combinação correta para cada empresa.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {pillars.map((pillar) => (
              <PremiumCard key={pillar.name} className="flex flex-col gap-4">
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${pillar.dot}`} />
                    <p className={`text-xs font-semibold uppercase tracking-widest ${pillar.accent}`}>
                      {pillar.name}
                    </p>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-300">{pillar.explanation}</p>
                </div>
                <div className="mt-auto border-t border-slate-700/40 pt-4">
                  <p className="text-xs leading-relaxed text-slate-500">
                    <span className="font-medium text-slate-400">Para o cliente: </span>
                    {pillar.value}
                  </p>
                </div>
              </PremiumCard>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-slate-600">
            Você pode começar com um e adicionar capacidades à medida que o sistema cresce.
          </p>
        </Section>

        {/* Casos de uso */}
        <Section id="casos" className="bg-slate-950">
          <div className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold leading-snug text-slate-50 reveal md:text-3xl">
              Casos onde Arkanum pode te ajudar.
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-slate-400 reveal reveal-1">
              Se um processo se repete, depende de carga manual ou gera erros frequentes,
              provavelmente pode ser automatizado ou melhorado.
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {cases.map((item) => (
              <li
                key={item}
                className="group flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 transition-colors hover:border-slate-700 hover:bg-slate-800/60"
              >
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                <span className="text-sm leading-relaxed text-slate-300 transition-colors group-hover:text-slate-100">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </Section>

        {/* Método */}
        <Section id="metodo" className="bg-slate-900/40">
          <div className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold leading-snug text-slate-50 reveal md:text-3xl">
              Primeiro entendemos o processo. Depois construímos a solução.
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-slate-400 reveal reveal-1">
              O software sob medida só faz sentido quando responde a um problema real. Por isso
              começamos com diagnóstico, definimos escopo e avançamos por etapas.
            </p>
          </div>
          <ol className="relative flex flex-col gap-0">
            {steps.map((step, index) => (
              <li key={step.number} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-400/10 text-xs font-semibold text-cyan-400">
                    {step.number}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="my-1 h-full w-px bg-slate-800" />
                  )}
                </div>
                <div className="pb-10">
                  <h3 className="mb-1.5 text-sm font-semibold text-slate-100">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-400">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        {/* Confiança técnica */}
        <Section className="bg-slate-950">
          <div className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold leading-snug text-slate-50 reveal md:text-3xl">
              Software pensado para crescer, não para quebrar em dois meses.
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-slate-400 reveal reveal-1">
              Trabalhamos com arquitetura clara, validações, controle de acesso, bancos de dados
              robustos e documentação. A solução deve ser útil hoje e sustentável amanhã.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trustPoints.map((point) => (
              <Card key={point.title}>
                <h3 className="mb-2 text-sm font-semibold text-slate-100">{point.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{point.description}</p>
              </Card>
            ))}
          </div>
        </Section>

        {/* CTA Final */}
        <section
          id="diagnostico"
          className="relative overflow-hidden border-t border-slate-800 bg-slate-900/40 px-6 py-24"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/5 blur-3xl"
          />
          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-2xl font-semibold leading-snug text-slate-50 reveal md:text-3xl">
              Solicite um diagnóstico inicial sem custo.
            </h2>
            <p className="mb-8 text-base leading-relaxed text-slate-400 reveal reveal-1">
              Conte o que você quer melhorar. Analisamos seu caso e indicamos se uma solução digital
              sob medida pode ajudar a reduzir carga manual, organizar informações ou conectar
              sistemas.
            </p>
            <div className="reveal reveal-2">
              <Button
                href="/pt-BR/diagnostico"
                variant="primary"
                className="px-10 py-3.5 text-sm"
              >
                Diagnosticar meu processo sem custo
              </Button>
              <p className="mt-4 text-xs text-slate-500">
                Sem compromisso. Se não fizer sentido desenvolver software sob medida para o seu
                caso, também te dizemos.
              </p>
            </div>
          </div>
        </section>

      </main>
      <SiteFooter locale="pt-BR" />
    </>
  );
}
