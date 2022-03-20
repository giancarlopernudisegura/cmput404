import { FAILED_GITHUB_STREAM, FAILED_CREATE_POSTS, FETCH_IMG_ERROR } from '../utils/errorMsg';


const BACKEND_HOST = process.env.FLASK_HOST;
/**
 * Returns the current user's information.
 * 
 * Reference: https://dev.to/ramonak/javascript-how-to-access-the-return-value-of-a-promise-object-1bck
 */
export function getCurrentAuthor() {
  const currentAuthor = fetch(`${BACKEND_HOST}/user_me`, {
    mode: 'cors',
    credentials: 'include',
    method: 'GET',
  })
    .then(res => res.json())
    .then(user_data => { return user_data.data })
    .catch(err => { console.log("ERROR:", err) });

  const getAuthor = async () => {
    const author = await currentAuthor;
    return author;
  }

  return getAuthor();

};

export const get_author_id = async () => {
  const res = await fetch(`${BACKEND_HOST}/login_test`, {
    mode: 'cors',
    credentials: 'include',
    method: 'GET',
  });
  if (res.status === 200) {
    const currentUserId = res.headers.get('X-User-Id') as string;
    if (currentUserId === null) {
      throw new Error('Could not get user id');
    }
    return currentUserId;
  }
  throw new Error('Could not get user id');
};

/**
 * Gets the posts of the given author_id
 * @param author_id 
 * @returns Array<Post>
 */
export async function getPosts(author_id: string): Promise<any> {

  try {
    let res = await fetch(`${BACKEND_HOST}/authors/${author_id}/posts/`, {
      mode: 'cors',
      method: 'GET',
    });

    let data = await res.json();
    let listOfPosts = Array();

    for (let i = 0; i < data.items.length; i++) {
      const post: any = {
        'id': data.items[i].id,
        'author': data.items[i].author.displayName,
        'title': data.items[i].title,
        'description': data.items[i].description,
        'contentType': data.items[i].contentType,
      };
      listOfPosts.push(post);
    }

    return listOfPosts;
  } catch (err) {
    throw Error("There was an error fetching the posts");
  }
};

/**
 * Gets a list of all authenticated authors
 * with their id and displayName
 * @returns Array<Author>
 */
export const getAllAuthors = async (page: number) => {
  try {
    const res = await fetch(`${BACKEND_HOST}/authors/?size=10&page=${page}`, {
      mode: 'cors',
      method: 'GET',
    });

    if (res.status == 200) {
      const currentUserId = res.headers.get('X-User-Id');
      let listOfAuthors = await res.json();
      return { ...listOfAuthors, currentUserId };
    } else {
      return { items: [] }
    }
  } catch (err) {
    throw Error('There was an error fetching all authors');
  }
}

/**
 * Sends a post to the backend
 * @param authorId  the id of the author
 * @param postData  form data of the post 
 */
export async function newPublicPost(authorId: string, postData: any) {
  const encodedPostData = JSON.stringify(postData);

  let res;
  let json;
  try {
    // postData contains data from the forms 
    res = await fetch(`${BACKEND_HOST}/authors/${authorId}/posts/`, {
      mode: 'cors',
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: encodedPostData
    })

    json = await res.json();

    if (res.status === 200) {
      return { status: res.status, ...json };
    } else {
      throw Error();
    }
    // TODO: return post id
  } catch (err) {
    throw Error(FAILED_CREATE_POSTS);
  }


}

export async function inboxCall(author_id: string, method: string, data?: any) {
  try {
    let metadata = {};

    if (data !== undefined) {
      metadata = {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(data)
      }
    }

    const res = await fetch(`${BACKEND_HOST}/authors/${author_id}/inbox/`, {
      method: 'POST',
      credentials: 'include',
      ...metadata
    })
    // TODO change return value
    return await res.json();
  } catch (err) {
    throw Error("There was an error getting the inbox");
  }
}

export async function clearInbox(author_id: string): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_HOST}/authors/${author_id}/inbox/`, {
      method: 'DELETE'
    })

    // TODO: change return value
    return res.status === 200;
  } catch (err) {
    throw Error('Unable to clear inbox');
  }
}

export async function getGithubStream(author_id: string, per_page = 30, page = 1): Promise<any> {
  try {
    // TODO: change return value
    const res = await fetch(`${BACKEND_HOST}/authors/${author_id}`)
    const { github } = await res.json();
    const regexPattern = /^https:\/\/github.com\/(\w+)\/?/;
    const githubID = regexPattern.exec(github)![1];
    const stream = await fetch(`https://api.github.com/users/${githubID}/events?per_page=${per_page}&page=${page}`);
    return await stream.json();
  } catch (err) {
    throw Error(FAILED_GITHUB_STREAM);
  }
}

export const logOutCall = async () => {
  try {
    const res = await fetch(`${BACKEND_HOST}/logout`, {
      mode: 'cors',
      credentials: 'include',
      method: 'POST',
    });

    if (res.status === 200) {
      let json = await res.json();
      return { status: res.status, ...json };
    } else {
      return { status: res.status };
    }
  } catch (err) {
    throw Error('Unable to log out user');
  }
}

export const followerCall = async (currentUserId: string, toFollowId: string, method: string) => {
  try {
    const res = await fetch(`${BACKEND_HOST}/authors/${currentUserId}/followers/${toFollowId}`, {
      mode: 'cors',
      credentials: 'include',
      method,
    });

    if (res.status === 200) {
      let json = [];

      if (method === "GET") {
        json = await res.json();
      }

      return { ...json, status: res.status };
    }
    return { status: res.status }
  } catch (err) {
    throw Error('Unable to make follow actions on user');
  }
}

export const getSpecAuthor = async (author_id: string) => {
  try {
    const res = await fetch(`${BACKEND_HOST}/authors/${author_id}`, {
      mode: 'cors',
      credentials: 'include',
      method: 'GET',
    });

    let json = [];
    if (res.status === 200) {
      json = await res.json();
    }

    return { status: res.status, ...json };
  } catch (err) {
    throw Error('Unable to get the information about this user');
  }
}

export const serveImage = async (authorId: string, postId: string) => {
  try {
    const res = await fetch(`${BACKEND_HOST}/authors/${authorId}/posts/${postId}/image`, {
      method: 'GET'
    });

    let json = res.json();

    if (res.status === 200) {
      return { status: res.status, ...json};
    }
  } catch(err) {
    throw Error(FETCH_IMG_ERROR);
  }
}

export function deletePost(author_id: string, post_id: string) {
  const response = fetch(`${BACKEND_HOST}/authors/${author_id}/posts/${post_id}`, {
    mode: 'cors',
    credentials: 'include',
    method: 'DELETE',
  })
  .then(res => {
    return res.status;
  })
  .catch(err => {
    throw Error('Unable to delete post');
  });

  return response;
}