export type Author = {
	type: "author";
	id: string;
	host: string;
	displayName: string;
	url: string;
	github: string;
	profileimage: string;
};
export type Post = {
	type: "post";
	id: string;
	title: string;
	source: string;
	origin: string;
	description: string;
	contentType: string;
	author: Author;
	categories: string[];
	count: number;
	comments: string[];
	commentsSrc: {
		type: "comments";
		page: number;
		size: number;
		post: string;
		id: string;
		comments: Comment[];
	};
	published: string;
	visibility: string;
	unlisted: boolean;
};
export type Like = {
	summary: string;
	type: "Like";
	author: Author;
	object: string;
};
export type Follow = {
	type: "Follow";
	summary: string;
	actor: Author;
	object: Author;
};
export type Comment = {
	type: "comment";
	author: Author;
	content: string;
	contentType: string;
	published: string;
	id: string;
};
