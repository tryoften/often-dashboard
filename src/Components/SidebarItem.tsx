import * as React from 'react';

export interface SidebarItemProps {
	title: string;
	onSelection: any;
	color?: string;
	selected?: boolean;
}

export default class SidebarItem extends React.Component<SidebarItemProps, {}> {

	render() {

		let carot = (this.props.selected)
			? (<div className="glyphicon glyphicon-menu-down selected"></div>)
			: (<div className="glyphicon glyphicon-menu-down unselected"></div>);

		return (
			<div onClick={this.props.onSelection} className="row-block">
				<div className="image-box vertical-align" style={{backgroundColor: this.props.color}}></div>
				<div className="page vertical-align">{this.props.title}</div>
				<div className="vertical-align">{carot}</div>
			</div>
		);
	}
}
