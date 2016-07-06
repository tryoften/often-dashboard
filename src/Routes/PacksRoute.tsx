import * as React from 'react';
import { Row, Col, Grid, ButtonToolbar, Button } from 'react-bootstrap';
import { Link } from 'react-router';
import PackView from '../Components/PackView';
import { Packs, Sections } from '@often/often-core';
import * as ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import ConfirmationButton from '../Components/ConfirmationButton';

const firebase = require('firebase');

interface PacksProps extends React.Props<PacksRoute> {
	open?: boolean;
}

interface PacksState extends React.Props<PacksRoute> {
	packs?: Packs;
	sections?: Sections;
	loading?: boolean;
}

export default class PacksRoute extends React.Component<PacksProps, PacksState> {
	constructor(props: PacksProps) {
		super(props);

		this.state = {
			loading: true
		};
		this.updateCollection = this.updateCollection.bind(this);
		this.onClickUpdateBrowse = this.onClickUpdateBrowse.bind(this);
	}

	updateCollection(collection: Packs) {
		this.setState({
			packs: collection,
			loading: false
		});
	}

	updateBrowseSections() {
		new Sections().fetch({
			success: (sections) => {
				var sectionAttributes = sections.toJSON();
				console.log(sectionAttributes);
				var sectionResult = this.state.packs.generateBrowseSections(sectionAttributes);

				let sectionRef = firebase.database().ref(`/browse`);
				sectionRef.set(sectionResult);
			}
		})
	}

	componentDidMount() {
		let state = {
			packs: new Packs(),
			loading: true
		};
		state.packs.fetch({
			success: this.updateCollection
		});

		this.setState(state);
	}

	componentWillUnmount() {
		this.state.packs.off('sync', this.updateCollection);
	}

	onClickUpdateBrowse(e) {
		e.preventDefault();
		this.updateBrowseSections();
	}

	render() {
		if (this.state.loading) {
			return <div>Loading...</div>;
		}

		let packComponents = this.state.packs
			.filter(pack => !pack.isFavorites && !pack.isRecents && !pack.deleted)
			.map(pack => {
				return (
					<Link key={pack.id} to={`/pack/${pack.id}`}>
						<PackView key={pack.id} model={pack}></PackView>
					</Link>
				);
			});

		let content = this.props.children ? <div>{this.props.children}</div> : (
			<div className="section">
				<header className="section-header">
					<h2>Packs</h2>
					<ButtonToolbar className="pull-right">
						<ConfirmationButton confirmationText="Are you sure you want to update browse on production?"
											onClick={this.onClickUpdateBrowse}>
							Update Browse
						</ConfirmationButton>

						<Link to="/pack">
							<Button bsStyle="primary" bsSize="small" active>Add Pack</Button>
						</Link>
					</ButtonToolbar>
				</header>
				<Grid fluid={true}>
					<Row>
						<Col sm={12}>
							<div className="content">
								<ReactCSSTransitionGroup
									transitionName="pack"
									transitionEnterTimeout={300}
									transitionLeaveTimeout={300}>
									{packComponents}
								</ReactCSSTransitionGroup>
							</div>
						</Col>
					</Row>
				</Grid>
			</div>

		);

		return content;
	}
}
