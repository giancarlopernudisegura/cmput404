import { Button, Link } from "@mui/material";
import { h } from "preact";
import { Follow } from "../types";

export default function Follow({
  summary,
  actor,
  object
}: Follow) {
  const acceptFollow = () => {
    fetch(`/authors/${object.id}/followers/${actor.id}`, { method: 'PUT' })
  }

  return (
    <li className="bg-zinc-100 border-solid border-1 border-slate-600 w-2/3 m-auto rounded-lg py-4 px-5  my-5">
      <div className="grid grid-cols-1 gap-y-2">

        <div className="px-3 my-2">
          <h3 className="font-semibold text-lg mb-2">{summary}</h3>
          <Button onClick={acceptFollow}>Accept Follow Request</Button>
        </div>
      </div>

    </li>
  );
}
