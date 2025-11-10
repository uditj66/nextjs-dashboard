"use client";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useDebounceCallback } from "usehooks-ts";
import {
  useSearchParams,
  usePathname,
  useParams,
  useRouter,
} from "next/navigation";
export default function Search({ placeholder }: { placeholder: string }) {
  const router = useRouter();
  const pathname = usePathname();
  console.log(pathname);
  const { dynamicParams } = useParams();
  console.log(dynamicParams);
  const searchparams = useSearchParams(); // returns an readOnly object of searched parameter
  console.log(searchparams);
  const params = new URLSearchParams(searchparams);
  console.log(params);
  for (const p of params) {
    console.log(p);
  }
  const handleChange = useDebounceCallback((term: string) => {
    console.log(`Searching... ${term}`);
    const params = new URLSearchParams(searchparams); // Returns an object of searched parameter i.e (key value pairs).We can modify the search parameter
    console.log(params.toString()); // An object i.e ["query","shyam"]
    // params.set("page", "1");
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    router.push(`${pathname}?${params.toString()}`); // Converting the object to string using params.toString() method.
  }, 3000);
  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        onChange={(e) => handleChange(e.target.value)}
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        defaultValue={searchparams.get("query")?.toString()} // keep the search bar in sync with url ,if page reloads then searchbar string will be remain in sync with what the search query is present in url
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
