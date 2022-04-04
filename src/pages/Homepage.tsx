import { h } from 'preact'
import { useEffect, useState } from 'preact/hooks';
import { Button, CircularProgress, Alert } from '@mui/material';
import DrawerMenu from '../components/sidemenu-components/Drawer'

import { 
  followerCall,
  getAllAuthors,
  get_author_id, 
  getPosts 
} from '../utils/apiCalls';

import { 
  LOAD_MORE_TEXT, 
  NO_MORE_POSTS_TEXT, 
  PUBLIC, 
  PRIVATE,
  FRIENDS,
  SUCCESS, 
  ALERT_NO_MORE_POSTS_TEXT 
} from '../utils/constants';

import PostList from '../components/PostList';

type FeedProps = {
  path: string
};


function Homepage(props : FeedProps) {
  const [errMsg, setErrMsg] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [ authorPage, setAuthorPage ] = useState(1);

  const [ friendsPosts, setFriendsPosts] = useState<Array<any>>([]);
  const [ buttonText, setButtonText ] = useState(LOAD_MORE_TEXT);
  const [ authorId, setAuthorId ] = useState<string>("");

  const getNextPosts = async (authId?: any) => {
    let newAuthId : any;
    if (!authorId) {
      newAuthId = authId
    } else {
      newAuthId = authorId
    }
    try {
        let results = await getAllAuthors(authorPage);
        let authors = results.items;
        let allPosts : Array<any> = [];
        let allPromises : Array<Promise<any>> = [];
        authors = authors.map((author : any) => {
            author['pageNumber'] = 1;
            return author;
        });

        if (authors.length === 0) {
            alert(ALERT_NO_MORE_POSTS_TEXT);
            setButtonText(NO_MORE_POSTS_TEXT);
        }

        for (let i = 0; i < authors.length; i++) {
            let author = authors[i];
            allPromises.push(new Promise<any>( async (resolve, reject) => {
                let followerData = await followerCall(author.id, newAuthId as string, "GET");
                if (followerData.items.length === 0) {
                    author.pageNumber = null;
                    resolve([]);
                }
                let authorPosts : Array<any> = [];
                while (author.pageNumber !== null) {
                    let data : any = await getPosts(author.id, author.pageNumber);
                    if (data.items.length === 0) {
                        author.pageNumber = null;
                    } else {
                        for (let post of data.items) {
                            if ((post.visibility === PRIVATE || post.visibility === FRIENDS) && post.unlisted === false) {
                              let followerData = await followerCall(newAuthId as string, author.id, "GET");
                              if (followerData.items.length !== 0) {
                                authorPosts.push(post);
                              }
                            } else {
                              authorPosts.push(post);
                            }
                        }
                        author.pageNumber++;
                    }
                }
                resolve(authorPosts);
            }));
        }

        let promiseRes = await Promise.all(allPromises);
        promiseRes.forEach((posts : Array<any>) => {
            allPosts.push(...posts);
        });
        setAuthorPage(authorPage + 1);
        setFriendsPosts([...friendsPosts, ...allPosts]);
    } catch (err) {
        setErrMsg('Error retrieving posts: ' + (err as Error).message);
    }
    setLoading(false);
}

  useEffect( () => {
    const getPosts = async () => {
      let authId;
      try {
        authId = await get_author_id();
        setAuthorId(authId);
      } catch (err) {
        setErrMsg((err as Error).message);
      }

      getNextPosts(authId);
    };

    try {
      getPosts();
    } catch (err) {
      setErrMsg((err as Error).message);
    }
  }, [])

  return (
    <div>
      {errMsg && (
        <Alert severity="error">{errMsg}</Alert>
      )}

      <DrawerMenu pageName="Home">

        {loading ? <CircularProgress /> : (
          <div>
            <PostList
              initialPosts={friendsPosts} 
            />
            
            <Button
              className="w-fit"
              onClick={() => getNextPosts()}
              variant="contained"
            >
                {buttonText}
            </Button>
          </div>
        )

        }

      </DrawerMenu>
    </div>
  )
}

export default Homepage;