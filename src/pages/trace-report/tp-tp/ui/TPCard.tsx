import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface TPCardProps {
  title: string; // e.g., "Hit", "No Hit", "Own State", "Inter State"
  value: number;
}

const getBorderColor = (title: string) => {
  switch (title.toLowerCase()) {
    case "hit":
      return "border-green-600";
    case "no_hit":
    case "no hit":
      return "border-red-600";
    case "own_state":
    case "own state":
      return "border-blue-600";
    case "inter_state":
    case "inter state":
      return "border-purple-600";
    default:
      return "border-gray-500";
  }
};

export const TPCard: React.FC<TPCardProps> = ({ title, value }) => {
  return (
    <Card className={`border-l-4 ${getBorderColor(title)} bg-card shadow-sm`}>
      <CardHeader className="py-2 px-3">
        <CardTitle className="text-sm font-medium capitalize">{title}</CardTitle>
      </CardHeader>
      <CardContent className="py-2 px-3 text-2xl font-bold">
        {value.toLocaleString()}
      </CardContent>
    </Card>
  );
};
