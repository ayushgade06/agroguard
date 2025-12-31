import { Leaf, Info } from "lucide-react";

export default function Header() {
  return (
    <header className="flex justify-between items-center p-4 border-b">
      <div className="flex items-center gap-2">
        <Leaf className="text-green-600" />
        <span className="font-black">AGRIGUARD</span>
      </div>
      <Info />
    </header>
  );
}
