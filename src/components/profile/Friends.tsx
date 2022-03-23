import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';

type friendProps = {
    authorId : string,
    followers : Array<any>,
}

function getMyFriends({ authorId, followers }: friendProps) {
    const [friends, setFriends] = useState(Array());;

    useEffect(() => {

    });
}
