import { Row, Col, Grid, ProgressBar, Nav, NavItem } from 'react-bootstrap';
import * as React from 'react';
import * as _ from 'underscore';
import { Link, browserHistory } from 'react-router';
import Authenticator from '../Models/Authenticator';
import { LinkContainer } from 'react-router-bootstrap';
import { User } from '@often/often-core';
import SidebarItem from './SidebarItem';


interface SidebarComponentState extends React.Props<SidebarComponent> {
	user?: User;
	pages?: PageAttributes[];
}

interface PageAttributes {
	id: string;
	title: string;
	link: string;
	color: string;
	selected: boolean;
}

export default class SidebarComponent extends React.Component<{}, SidebarComponentState> {
	constructor() {
		super();

		let pages = [{
			id: 'categories',
			title: 'Categories',
			link: '/categories',
			color: '#2db8ff',
			selected: false
		}, {
			id: 'packs',
			title: 'Packs',
			link: '/packs',
			color: '#50e3c2',
			selected: true
		},{
			id: 'owners',
			title: 'Owners',
			link: '/owners',
			color: '#f5818f',
			selected: false
		}];

		this.state = {
			user: Authenticator.getAuthorizedUser(),
			pages: pages
		};
	}

	onNavChange(page: PageAttributes) {
		let pages = this.state.pages;
		let targetPage = _.find(pages, p => p.id == page.id);
		pages.forEach( p => p.selected = false);
		targetPage.selected = true;
		this.setState({
			pages: pages
		});
		browserHistory.push(targetPage.link);

	}

	render() {

		let sidebarSelections = this.state.pages.map((page) => {
			return (<SidebarItem
				title={page.title}
				color={page.color}
				selected={page.selected}
				onSelection={this.onNavChange.bind(this, page)}
			/>)
		});
		return (
			<div id='sidebar'>
				<div id='brand'>
					<div id='logo'>Often</div>
				</div>
				<div id='sidebar-container'>
					<table>
						{sidebarSelections}
					</table>
				</div>
				<div className='avatar'>
					<div className='profile-image' style={{backgroundImage: `url(${this.state.user.get('profileImageLarge')})`}}></div>
					<div className='name'>{this.state.user.get('name')}</div>
					<div className='logout'>
						<Link to='/logout'>Logout</Link>
					</div>
				</div>
			</div>
		);
	}
}
