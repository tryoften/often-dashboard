import * as React from 'react';
import { Pack } from "@often/often-core";
import { Thumbnail } from 'react-bootstrap';

export interface PackTableRowViewProps {
	model: Pack;
	onClickPack?: (packId: string) => void;
}

export default class PackTableRowView extends React.Component<PackTableRowViewProps, {}> {

	render() {
		return (
			<tr onClick={this.props.onClickPack}>
				<td className="image-cell">
					<div className="image-container" style={{backgroundImage: `url(${this.props.model.get('image').large_url})`}}></div>
				</td>
				<td>{this.props.model.name} </td>
				<td>{this.props.model.items_count} Items</td>
				<td>0 Shares</td>
				<td>0 Downloads</td>
			</tr>
		);
	}
}
