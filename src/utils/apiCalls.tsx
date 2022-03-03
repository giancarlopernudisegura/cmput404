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
    return res.headers.get('X-User-Id') as string;
  }
  throw new Error('Could not get user id');
};

/**
 * Gets the posts of the given author_id
 * @param author_id 
 * @returns Array<Post>
 */

export function getPosts(author_id: string): Promise<any> {

  let listOfPosts = fetch(`${BACKEND_HOST}/authors/${author_id}/posts/`, {
    mode: 'cors',
    method: 'GET',
  }).then(res => res.json())
    .then(data => {
      var posts = Array();
      for (let i = 0; i < data.items.length; i++) {
        const post: any = {
          'author': data.items[i].author.displayName,
          'title': data.items[i].title,
          'description': data.items[i].description,
        };
        posts.push(post);
      }
      return posts;
    })
    .catch(err => { alert(err); });

  return listOfPosts;

};
/**
 * Gets a list of all authenticated authors
 * with their id and displayName
 * @returns Array<Author>
 */
export function getAllAuthors() {
  const listOfAuthors = fetch(`${BACKEND_HOST}/authors/`, {
    mode: 'cors',
    method: 'GET',
  }).then(res => res.json())
    .then(data => {
      var authors = Array();
      for (let i = 0; i < data.items.length; i++) {
        const author: any = {
          'id': data.items[i].id,
          'displayName': data.items[i].displayName,
        };
        authors.push(author);
      }
      return authors;
    })
    .catch(err => {alert(err);});
  
    return listOfAuthors;
} 
/**
 * Sends a post to the backend
 * @param authorId  the id of the author
 * @param postData  form data of the post 
 */
export function newPublicPost(authorId: any, postData: any) {
  // postData contains data from the forms 
  fetch(`${BACKEND_HOST}/authors/${authorId}/posts/`, {
    mode: 'cors',
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: postData
  }).catch(err => {console.log(err)});

}
