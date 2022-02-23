import { h, Component, ComponentChild, VNode } from 'preact';
import { useEffect } from 'preact/hooks';
import { Router, route } from 'preact-router';


type Props = {
	path: string,
	component: VNode,
	author: object | null
}

const RestrictedRoute = (props : Props) => {

	useEffect(() => {
		if (props.author === null) {
			route('/login');
		}
	})

	return (
		<div>
			{props.component}
		</div>
	);
}

export default RestrictedRoute;