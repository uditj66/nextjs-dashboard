import { Inter, Lusitana } from "next/font/google";

const lusitana = Lusitana({
  subsets: ["latin"],
  weight: ["400", "700"],
});
const inter = Inter({ subsets: ["latin"] });

export { lusitana, inter };
