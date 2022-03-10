import { h } from 'preact';

type GitHubActivityProps = {
    author: string;
    repo: {
        name: string;
        url: string;
    };
    eventType: string;
}

export default function GitHubActivity({ author, repo, eventType }: GitHubActivityProps) {
    return (
        <div className='bg-zinc-100 border-solid border-1 border-slate-600 w-2/3 m-auto rounded-lg py-4 px-5  my-5'>
            <div className='grid grid-cols-1 gap-y-2'>
                <h2 className='font-bold tracking-wide'>{author}</h2>
                <div className='px-3 my-2'>
                    <h3 className='font-semibold text-lg mb-2'>{eventType}</h3>
                    <a href={repo.url}>{repo.name}</a>
                </div>
            </div>
        </div>
    );
}
