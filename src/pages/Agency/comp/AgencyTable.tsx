import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TypeData {
  enrollment: number;
  hit: number;
  nohit: number;
  total: number;
}

export interface StateData {
  [state: string]: {
    tp: TypeData;
    cp: TypeData;
    mesa: TypeData;
  };
}

interface AgencyTableProps {
  data: StateData;
  filters: {
    dataTypes?: string[];
    categories?: string[];
  };
}

function AgencyTable({ data, filters }: AgencyTableProps) {
  const { dataTypes, categories } = filters;

  const availableCategories = ["tp", "cp", "mesa"].filter((cat) =>
    categories.includes(cat)
  );

  const availableDataTypes = ["enrollment", "hit", "nohit"].filter((type) =>
    dataTypes.includes(type)
  );

  return (
    <div className="overflow-auto rounded-md border">
      <Table>
        {/* Header */}
        <TableHeader>
          <TableRow>
            <TableHead rowSpan={2} className="border-r text-center">
              State
            </TableHead>
            {availableCategories.map((cat) => (
              <TableHead
                key={cat}
                colSpan={availableDataTypes.length + 1} // +1 for Total
                className="text-center border-r"
              >
                {cat.toUpperCase()}
              </TableHead>
            ))}
          </TableRow>
          <TableRow>
            {availableCategories.map((cat) =>
              [...availableDataTypes, "total"].map((type) => (
                <TableHead
                  key={`${cat}-${type}`}
                  className={type === "total" ? "border-r text-center" : ""}
                >
                  {type === "total"
                    ? "Total"
                    : type.charAt(0).toUpperCase() + type.slice(1)}
                </TableHead>
              ))
            )}
          </TableRow>
        </TableHeader>

        {/* Body */}
        <TableBody>
          {Object.entries(data).map(([state, types]) => (
            <TableRow key={state} className="text-center">
              <TableCell className="font-medium border-r">{state}</TableCell>
              {availableCategories.map((cat) =>
                [...availableDataTypes, "total"].map((type) => (
                  <TableCell
                    key={`${state}-${cat}-${type}`}
                    className={type === "total" ? "border-r" : ""}
                  >
                    {types[cat as "tp" | "cp" | "mesa"][type as keyof TypeData]}
                  </TableCell>
                ))
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default AgencyTable;
