import * as React from 'react';
import { Pack } from "@often/often-core";
import { Thumbnail, Glyphicon } from 'react-bootstrap';

export interface PackTableRowViewProps {
	model: Pack;
	onClickPack?: (packId: string) => void;
}

export default class PackTableRowView extends React.Component<PackTableRowViewProps, {}> {

	render() {
		let model = this.props.model;

		return (
			<tr onClick={this.props.onClickPack}>
				<td className="image-cell">
					<div className="image-container" style={{backgroundImage: `url(${model.get('image').large_url})`}}></div>
				</td>
				<td>{model.name}</td>
				<td>{model.published ? <div className="published"><Glyphicon glyph="ok" /></div> : '' }</td>
				<td>{model.section ? model.section.name : 'No Section'}</td>
				<td>{model.items_count} Items</td>
				<td>0 Shares</td>
				<td>0 Downloads</td>
			</tr>
		);
	}
}
