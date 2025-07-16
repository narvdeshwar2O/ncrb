import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

interface TypeData {
  enrollment: number;
  hit: number;
  nohit: number;
  total: number;
}

interface StateData {
  [state: string]: {
    tp: TypeData;
    cp: TypeData;
    mesha: TypeData;
  };
}

function AgencyTable({ data }: { data: StateData }) {
  return (
    <div className="overflow-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead rowSpan={2} className="border-r text-center">State</TableHead>
            <TableHead colSpan={4} className="text-center border-r">TP</TableHead>
            <TableHead colSpan={4} className="text-center border-r">CP</TableHead>
            <TableHead colSpan={4} className="text-center">MESA</TableHead>
          </TableRow>
          <TableRow>
            <TableHead>Enrollment</TableHead>
            <TableHead>Hit</TableHead>
            <TableHead>NoHit</TableHead>
            <TableHead className="border-r">Total</TableHead>
            <TableHead>Enrollment</TableHead>
            <TableHead>Hit</TableHead>
            <TableHead>NoHit</TableHead>
            <TableHead className="border-r">Total</TableHead>
            <TableHead>Enrollment</TableHead>
            <TableHead>Hit</TableHead>
            <TableHead>NoHit</TableHead>
            <TableHead>Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(data).map(([state, types]) => (
            <TableRow key={state} className="text-center">
              <TableCell className="font-medium border-r">{state}</TableCell>
              {/* TP */}
              <TableCell>{types.tp.enrollment}</TableCell>
              <TableCell>{types.tp.hit}</TableCell>
              <TableCell>{types.tp.nohit}</TableCell>
              <TableCell className="border-r">{types.tp.total}</TableCell>
              {/* CP */}
              <TableCell>{types.cp.enrollment}</TableCell>
              <TableCell>{types.cp.hit}</TableCell>
              <TableCell>{types.cp.nohit}</TableCell>
              <TableCell className="border-r">{types.cp.total}</TableCell>
              {/* MESHA */}
              <TableCell>{types.mesha.enrollment}</TableCell>
              <TableCell>{types.mesha.hit}</TableCell>
              <TableCell>{types.mesha.nohit}</TableCell>
              <TableCell>{types.mesha.total}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default AgencyTable;
