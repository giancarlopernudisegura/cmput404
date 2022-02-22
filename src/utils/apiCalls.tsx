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