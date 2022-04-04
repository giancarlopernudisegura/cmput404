import {
  FAILED_GITHUB_STREAM,
  FAILED_CREATE_POSTS,
  FETCH_IMG_ERROR,
  FAILED_EDIT_POST,
  FAILED_CREATE_COMMENT,
  FAILED_FETCH_SPEC_POST,
  FAILED_ADD_LIKE,
  FAILED_DELETE_LIKE,
  FAILED_GET_COMMENT_LIKES,
  FAILED_ADD_COMMENT_LIKES,
} from "../utils/errorMsg";
import { Follow } from "../types"

import { SUCCESS, NOT_FOUND } from "../utils/constants";

const BACKEND_HOST = process.env.FLASK_HOST;

export const get_author_id = async () => {
  const res = await fetch(`${BACKEND_HOST}/login_test`, {
    mode: "cors",
    credentials: "include",
    method: "GET",
  });
  if (res.status === SUCCESS) {
    const currentUserId: string = res.headers.get("X-User-Id") as string;
    if (currentUserId === null) {
      throw new Error("Could not get user id");
    }
    return currentUserId;
  }
  throw new Error("Could not get user id");
};

/**
 * Gets the posts of the given author_id
 * @param author_id
 * @returns Array<Post>
 */
export async function getPosts(author_id: string, page?: number): Promise<any> {
  var baseUrl = `${BACKEND_HOST}/authors/${author_id}/posts/`
  var listOfPosts = Array();

  try {

    if (page) {
      let size = 10;
      baseUrl += `?size=${size}&page=${page}`;
    }

    var res = await fetch(baseUrl, {
      mode: "cors",
      credentials: "include",
      method: "GET"
    });

    let data = await res.json();

    if (data.items === undefined) {
      return { status: NOT_FOUND, items: [] };
    }
    for (let i = 0; i < data.items.length; i++) {
      const post: any = {
        postId: data.items[i].id,
        authorName: data.items[i].author.displayName,
        authorId: data.items[i].author.id,
        title: data.items[i].title,
        description: data.items[i].description,
        contentType: data.items[i].contentType,
        visibility: data.items[i].visibility,
        unlisted: data.items[i].unlisted,
        origin: data.items[i].origin,
        source: data.items[i].source,
      };
      listOfPosts.push(post);
    }

  } catch (err) {
    console.error(err);
    throw Error("There was an error fetching the posts");
  }

  return { status: res.status, items: listOfPosts };

}

/**
 * Gets a list of all authenticated authors
 * with their id and displayName
 * @returns Array<Author>
 */
export const getAllAuthors = async (page?: number) => {
  var baseUrl = `${BACKEND_HOST}/authors/`;
  try {
    if (page) {
      baseUrl += `?size=10&page=${page}`;
    }

    const res = await fetch(baseUrl, {
      mode: "cors",
      credentials: "include",
      method: "GET",
    });

    if (res.status == SUCCESS) {
      const currentUserId = res.headers.get("X-User-Id");
      let listOfAuthors = await res.json();
      return { ...listOfAuthors, currentUserId };
    } else {
      return { items: [] };
    }
  } catch (err) {
    throw Error("There was an error fetching all authors");
  }
};

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
      mode: "cors",
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: encodedPostData,
    });

    json = await res.json();

    if (res.status === SUCCESS) {
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
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(data),
      };
    }

    const res = await fetch(`${BACKEND_HOST}/authors/${author_id}/inbox/`, {
      method: method,
      credentials: "include",
      ...metadata,
    });
    // TODO change return value
    return await res.json();
  } catch (err) {
    throw Error("There was an error getting the inbox");
  }
}

export async function clearInbox(author_id: string): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_HOST}/authors/${author_id}/inbox/`, {
      method: "DELETE",
      credentials: "include",
    });

    // TODO: change return value
    return res.status === SUCCESS;
  } catch (err) {
    throw Error("Unable to clear inbox");
  }
}

export async function getGithubStream(
  author_id: string,
  per_page = 30,
  page = 1
): Promise<any> {
  try {
    // TODO: change return value
    const res = await fetch(`${BACKEND_HOST}/authors/${author_id}`);
    const { github } = await res.json();
    const regexPattern = /^https:\/\/github.com\/(\w+)\/?/;
    const githubID = regexPattern.exec(github)![1];
    const stream = await fetch(
      `https://api.github.com/users/${githubID}/events?per_page=${per_page}&page=${page}`
    );
    return await stream.json();
  } catch (err) {
    throw Error(FAILED_GITHUB_STREAM);
  }
}

export const logOutCall = async () => {
  try {
    const res = await fetch(`${BACKEND_HOST}/logout`, {
      mode: "cors",
      credentials: "include",
      method: "POST",
    });

    if (res.status === SUCCESS) {
      let json = await res.json();
      return { status: res.status, ...json };
    } else {
      return { status: res.status };
    }
  } catch (err) {
    throw Error("Unable to log out user");
  }
};

export const followerRequest = async (
  author_id: string,
  follower_id: string
) => {
  const res = await fetch(`/authors/${author_id}/inbox`);
  if (res.status >= 400) return undefined;
  const data = await res.json();
  const items = data.items as any[];
  const follow = items.find(item => (item.type as string).toLowerCase() === "follow" && item.actor.id === follower_id) as Follow;
  return follow;
}

export const followerCall = async (
  currentUserId: string,
  toFollowId: string,
  method: string
) => {
  try {
    const res = await fetch(
      `${BACKEND_HOST}/authors/${currentUserId}/followers/${toFollowId}`,
      {
        mode: "cors",
        credentials: "include",
        method,
      }
    );

    if (res.status === SUCCESS) {
      let json = [];

      if (method === "GET") {
        json = await res.json();
      }

      return { ...json, status: res.status };
    }
    return { status: res.status };
  } catch (err) {
    throw Error("Unable to make follow actions on user");
  }
};

export const getSpecAuthor = async (author_id: string) => {
  try {
    const res = await fetch(`${BACKEND_HOST}/authors/${author_id}`, {
      mode: "cors",
      credentials: "include",
      method: "GET",
    });

    let json = [];
    if (res.status === SUCCESS) {
      json = await res.json();
    }

    return { status: res.status, ...json };
  } catch (err) {
    throw Error("Unable to get the information about this user");
  }
};

/**
 * Get all comments for a specific post
 */
export async function getAllComments(author_id: string, post_id: string) {
  try {
    const res = await fetch(
      `${BACKEND_HOST}/authors/${author_id}/posts/${post_id}/comments`,
      {
        mode: "cors",
        method: "GET",
      }
    );

    let data = await res.json();
    let listOfComments = Array();

    for (let i = 0; i < data.comments.length; i++) {
      var t = data.comments[i].published;
      var publishTime = t.substring(0, t.lastIndexOf("T"));
      const comment: any = {
        // title: data.comments[i].title,
        author: data.comments[i].author.displayName,
        content: data.comments[i].content,
        published: publishTime,
        id: data.comments[i].id,
      };
      listOfComments.push(comment);
    }

    return listOfComments;
    // return { ...listOfComments, status: res.status };
  } catch (err) {
    throw Error("Unable to retrieve comments for this post");
  }
}

export const serveImage = async (authorId: string, postId: string) => {
  try {
    const res = await fetch(
      `${BACKEND_HOST}/authors/${authorId}/posts/${postId}/image`,
      {
        method: "GET",
      }
    );

    let json = res.json();

    if (res.status === SUCCESS) {
      return { status: res.status, ...json };
    }
  } catch (err) {
    throw Error(FETCH_IMG_ERROR);
  }
};

export function deletePost(author_id: string, post_id: string) {
  const response = fetch(
    `${BACKEND_HOST}/authors/${author_id}/posts/${post_id}`,
    {
      mode: "cors",
      credentials: "include",
      method: "DELETE",
    }
  )
    .then((res) => {
      return res.status;
    })
    .catch((err) => {
      throw Error("Unable to delete post");
    });

  return response;
}

export function getFollowers(author_id: string): Promise<any> {
  const response = fetch(`${BACKEND_HOST}/authors/${author_id}/followers/`, {
    mode: "cors",
    method: "GET",
  })
    .then((res) => {
      return res.json();
    })
    .catch((err) => {
      throw Error("Unable to get followers:" + err);
    });

  return response;
}

export async function getSpecPost(author_id: string, post_id: string) {
  try {
    const res = await fetch(
      `${BACKEND_HOST}/authors/${author_id}/posts/${post_id}`,
      {
        mode: "cors",
        credentials: "include",
        method: "GET",
      }
    );

    if (res.status !== 200) {
      throw new Error();
    }

    let json = await res.json();

    return { ...json, status: res.status };
  } catch (err) {
    throw new Error(FAILED_FETCH_SPEC_POST);
  }
}

export async function editPost(
  author_id: string,
  post_id: string,
  postInfo: any
) {
  try {
    const response = await fetch(
      `${BACKEND_HOST}/authors/${author_id}/posts/${post_id}`,
      {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(postInfo),
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      }
    );

    let json = await response.json();

    if (response.status !== SUCCESS) {
      throw Error();
    }

    return { status: response.status, ...json };
  } catch (err) {
    throw Error(FAILED_EDIT_POST);
  }
}
/**
 * Get likes for a specific post
 */
export async function getPostLikes(author_id: string, post_id: string) {
  const res = await fetch(
    `${BACKEND_HOST}/authors/${author_id}/posts/${post_id}/likes`,
    {
      mode: "cors",
      credentials: "include",
      method: "GET",
    }
  );

  let data = res.json();
  // data.then((likeList) => console.log(likeList.likes));
  return data;
}
/**
 * Sends a new comment for a specific post
 */
export async function newPublicComment(
  author_id: any,
  post_id: string,
  commentData: any
) {
  const encodedCommentData = JSON.stringify(commentData);

  try {
    const res = await fetch(
      `${BACKEND_HOST}/authors/${author_id}/posts/${post_id}/comments/`,
      {
        mode: "cors",
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: encodedCommentData,
      }
    );

    console.log(encodedCommentData);
  } catch (err) {
    throw Error(FAILED_CREATE_COMMENT);
  }
}

export function isLocal(node: string) {
  const regex = `^${BACKEND_HOST}`;
  return Boolean(node.match(regex));
}

/**
 * Add like to post
 */

export async function addPostLike(author_id: string, post_id: string) {
  try {
    const res = await fetch(
      `${BACKEND_HOST}/authors/${author_id}/posts/${post_id}/likes`,
      {
        mode: "cors",
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      }
    );

    // let json = await res.json();

    if (res.status !== 201) {
      throw Error();
    }

    return { status: res.status };
  } catch (err) {
    throw Error(FAILED_ADD_LIKE);
  }
}

export function deletePostLike(author_id: string, post_id: string) {
  const response = fetch(
    `${BACKEND_HOST}/authors/${author_id}/posts/${post_id}/likes`,
    {
      credentials: "include",
      method: "DELETE",
    }
  )
    .then((res) => {
      return res.status;
    })
    .catch((err) => {
      throw Error(FAILED_DELETE_LIKE);
    });

  return response;
}

/**
 * Get all comment likes
 */

export async function getCommentLikes(
  author_id: string,
  post_id: string,
  comment_id: string
) {
  try {
    const res = await fetch(
      `${BACKEND_HOST}/authors/${author_id}/posts/${post_id}/comments/${comment_id}/likes`,
      {
        mode: "cors",
        credentials: "include",
        method: "GET",
      }
    );

    let data = res.json();
    // data.then((likeList) => console.log(likeList.likes));
    // console.log("comment likes");
    return data;
  } catch (err) {
    throw Error(FAILED_GET_COMMENT_LIKES);
  }
}

/**
 * Add like to comment
 */
export async function addCommentLikes(
  author_id: string,
  post_id: string,
  comment_id: string
) {
  try {
    const res = await fetch(
      `${BACKEND_HOST}/authors/${author_id}/posts/${post_id}/comments/${comment_id}/likes`,
      {
        mode: "cors",
        credentials: "include",
        method: "PUT",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      }
    );

    // let json = await res.json();

    if (res.status !== 201) {
      throw Error();
    }

    return { status: res.status };
  } catch (err) {
    throw Error(FAILED_ADD_COMMENT_LIKES);
  }
}

/**
 * Delete likes for a comment
 * @param author_id
 * @param post_id
 * @param comment_id
 */

export async function deleteCommentLike(
  author_id: string,
  post_id: string,
  comment_id: string
) {
  const response = await fetch(
    `${BACKEND_HOST}/authors/${author_id}/posts/${post_id}/comments/${comment_id}/likes`,
    {
      mode: "cors",
      credentials: "include",
      method: "DELETE",
    }
  )
    .then((res) => {
      return res.status;
    })
    .catch((err) => {
      throw Error(FAILED_DELETE_LIKE);
    });

  return response;
}
