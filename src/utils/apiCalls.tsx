const BACKEND_HOST = process.env.FLASK_HOST;

export const get_author_me = async () => {
  let res = await fetch(`${BACKEND_HOST}/user_me`, {
    mode: 'cors',
    credentials: 'include',
    method: 'GET',
  });
  let json = await res.json();
  let data = json.data()
  return data;
};

export function getPosts(author_id: number) {
  // DEBUG: only get posts from author_id 1
  fetch(`${BACKEND_HOST}/authors/${author_id}/posts/`, {
    mode: 'cors',
    method: 'GET',
  }).then(res => res.json())
    .then(data => { 
      console.log(data.items);
      var posts = [];
      for (let i=0; i<data.items.length; i++) {
        const post : any = {
          'author': data.items[i].author.displayName,
          'title': data.items[i].title,
          'description': data.items[i].description,
        };
        posts.push(post);
      }
      return posts;
    // TODO: send promise data back to the caller
    });

};