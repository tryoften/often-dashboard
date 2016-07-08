import * as React from 'react';
import { Link, browserHistory } from 'react-router';
import { Table } from 'react-bootstrap';
import PackView from './PackView';
import { IndexableObject, Pack} from '@often/often-core';
import PackTableRowView from './PackTableRowView';

interface PackGroupProps {
	items: Pack[];
	type: PackGroupType;
	title: string;
	edit?: boolean;
}

class PackGroupType extends String {
	static table: PackGroupType = 'table';
	static card: PackGroupType = 'card';
}


export default class PackGroup extends React.Component<PackGroupProps, {}> {

	constructor(props: PackGroupProps, context: any) {
		super(props, context);
	}
	onClickPack(packId: string) {
		browserHistory.push(`/pack/${packId}`)
	}
	render() {
		let packs;
		if (this.props.type == PackGroupType.table) {
			packs = (
				<table  className="media-item-group table">
					<thead className="table-header group-title">
						<tr>
							<th colSpan="2">Pack Name</th>
							<th>Item Count</th>
							<th>Share Count</th>
							<th>Engagement</th>
						</tr>
					</thead>
					<tbody className="table-text group-title">
						{
							this.props.items.map(pack => {
								return (
									<PackTableRowView key={pack.id} model={pack} onClickPack={this.onClickPack.bind(this, pack.id)} />
								)})
							}
					</tbody>
				</table>);

		} else if (this.props.type == PackGroupType.card) {
			packs = this.props.items.map(pack => {
				return (
					<Link key={pack.id} to={`/pack/${pack.id}`}>
						<PackView key={pack.id} model={pack} />
					</Link>
				);
			});
		}

		return (
			<div className="media-item-group">
				<header>
					<span className="group-title">{this.props.title}</span>
					{(this.props.edit) ? <a className="action-btn">Edit</a> : <div></div> }
				</header>
				<div className="items">
					{packs}
				</div>
			</div>
		);
	}
}
