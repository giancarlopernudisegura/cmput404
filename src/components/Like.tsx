import { Link } from "@mui/material";
import { h } from "preact";
import { Like } from "../types";

export default function Like({
  summary,
  author,
  object
}: Like) {
  return (
    <li className="bg-zinc-100 border-solid border-1 border-slate-600 w-2/3 m-auto rounded-lg py-4 px-5  my-5">
      <div className="grid grid-cols-1 gap-y-2">

        <div className="px-3 my-2">
          <h3 className="font-semibold text-lg mb-2">{summary}</h3>
          <Link href={object}>See in context</Link>
        </div>
      </div>

    </li>
  );
}
