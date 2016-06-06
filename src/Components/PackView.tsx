import * as React from 'react';
import Pack from "../../Models/Pack";
import { Glyphicon } from 'react-bootstrap';
import ImageBrandMask from '../Components/ImageBrandMask';

export interface PackViewProps extends React.Props<PackView> {
	model: Pack;
	onItemSelected?: (pack: Pack) => void;
}

export default class PackView extends React.Component<PackViewProps, {}> {
	onClickEvent(e: Event) {
		if (this.props.onItemSelected) {
			this.props.onItemSelected(this.props.model);
		}
	}

	render() {
		return (
			<div className="pack media-item" id={this.props.model.id} onClick={this.onClickEvent.bind(this)}>
				<div className="image-container" style={{backgroundImage: `url(${this.props.model.get('image').large_url})`}}>
					<ImageBrandMask />
					{ this.props.model.published ? <div className="published"><Glyphicon glyph="ok" /></div> : '' }
				</div>
				<div className="meta">
					<div className="title">{this.props.model.name}</div>
					<div className="subtitle">{this.props.model.items_count} items</div>
					<div className="description">{this.props.model.get('description')}</div>
				</div>
			</div>
		);
	}
}
