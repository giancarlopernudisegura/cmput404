import { Button } from "@mui/material";
import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import DrawerMenu from "../components/sidemenu-components/Drawer";
import { getPosts, get_author_id, inboxCall } from '../utils/apiCalls';
import PostElement from '../components/Post';
import LikeElement from '../components/Like';
import FollowElement from '../components/Follow';
import CommentElement from "../components/Comment";
import { Author, Post, Like, Follow, Comment } from '../types';

type notiProps = { path: string };

type InboxItem = Post | Like | Follow | Comment;

export default function Inbox({ path }: notiProps) {
  const [inboxItems, setInboxItems] = useState<InboxItem[]>([]);
  const [errMsg, setErrMsg] = useState("");


  const clearInbox = async () => {
    const ID = await get_author_id();
    fetch(`/authors/${ID}/inbox`, { method: 'DELETE' });
  }

  useEffect(() => {
    get_author_id()
      .then(ID => {
        fetch(`/authors/${ID}/inbox`)
          .then(res => res.json())
          .then(data => {
            const items = data.items as InboxItem[];
            setInboxItems(items);
          });
      });
  }, []);

  return (
    <div>
      <DrawerMenu
        pageName="Inbox"
      >
        <Button onClick={clearInbox}>Clear Inbox</Button>
        <ul>
          {inboxItems.map(inboxItem => {
            switch (inboxItem.type.toLowerCase()) {
              case "post":
                const post = inboxItem as Post;
                return <PostElement
                  key={post.id}
                  authorId={post.author.id}
                  authorName={post.author.displayName}
                  body={post.description}
                  contentType={post.contentType}
                  postId={post.id}
                  title={post.title}
                  visibility={post.visibility}
                  unlisted={post.unlisted}
                  origin={post.origin}
                  source={post.source}
                  categories={post.categories}
                />;
              case "follow":
                const follow = inboxItem as Follow;
                return <FollowElement {...follow} />;
              case "like":
                const like = inboxItem as Like;
                return <LikeElement {...like} />;
              case "comment":
                const comment = inboxItem as Comment;
                return <CommentElement {...comment} />;
            }
          })}
        </ul>
      </DrawerMenu>
    </div>
  );
}
