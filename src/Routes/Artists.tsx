import * as React from 'react';

interface ArtistsProps extends React.Props<Artists> {
	open?: boolean;
}

export default class Artists extends React.Component<ArtistsProps, {}> {
	render() {
		return (
			<div>
				<h2>Artists</h2>
			</div>
		);
	}
}
