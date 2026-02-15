import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";

const features = [
  {
    title: "Build Workflows",
    description: "Create text-processing pipelines with 2-4 steps. Choose from cleaning, summarization, key point extraction, and categorization.",
    href: "/builder",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
  {
    title: "Run Pipelines",
    description: "Execute your workflows on any text. See per-step outputs with LLM or heuristic indicators in real time.",
    href: "/run",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "View History",
    description: "Browse your recent runs with full step-by-step details. Expand any run to see inputs, outputs, and timing.",
    href: "/history",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
          Workflow Builder{" "}
          <span className="text-primary-600">Lite</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Create text-processing workflows, run them on your content, and view
          detailed per-step results. LLM-powered when available, with smart
          heuristic fallbacks.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Link key={feature.href} href={feature.href}>
            <Card className="h-full hover:shadow-md hover:border-primary-200 transition-all cursor-pointer">
              <CardBody>
                <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h2>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
