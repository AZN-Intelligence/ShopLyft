import { type StepHeaderProps } from "../../types";

export default function StepHeader({ title, description }: StepHeaderProps) {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold mb-2 text-orange-600">{title}</h2>
      <p className="text-orange-700">{description}</p>
    </div>
  );
}
