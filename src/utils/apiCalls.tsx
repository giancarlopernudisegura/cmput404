const BACKEND_HOST = process.env.FLASK_HOST;

export const get_author_me = async () => {
  try {
    let res = await fetch(`${BACKEND_HOST}/user_me`, {
      mode: 'cors',
      credentials: 'include',
      method: 'GET',
    });

    let res_json = await res.json();
    return res_json;
  } catch(err) {
    throw err;
  } 

};