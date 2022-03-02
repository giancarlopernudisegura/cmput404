const BACKEND_HOST = process.env.FLASK_HOST;

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

export function getAllAuthors() {
  let listOfAuthors = fetch(`${BACKEND_HOST}/authors/`, {
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
    .catch(err => { alert(err); });

  return listOfAuthors;
}
