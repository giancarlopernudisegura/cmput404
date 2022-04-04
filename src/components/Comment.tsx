import { Link } from "@mui/material";
import { h } from "preact";
import { Comment } from "../types";
import { MARKDOWN, PLAIN } from "../utils/constants";
import ReactMarkdown from "react-markdown";

type RenderBodyProps = {
  content: string;
  contentType: string;
}

const RenderBody = ({ content, contentType }: RenderBodyProps) => {
  switch (contentType) {
    case MARKDOWN:
      return <ReactMarkdown>{content}</ReactMarkdown>;
    default:
      return <p className="text-lg">{content}</p>;
  }
};

export default function Comment({
  content,
  author,
  contentType
}: Comment) {
  return (
    <li className="bg-zinc-100 border-solid border-1 border-slate-600 w-2/3 m-auto rounded-lg py-4 px-5  my-5">
      <div className="grid grid-cols-1 gap-y-2">

        <div className="px-3 my-2">
          <RenderBody content={content} contentType={contentType} />
        </div>
      </div>

    </li>
  );
}
